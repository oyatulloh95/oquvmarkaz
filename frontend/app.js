const API_BASE = "/api";
const LS_KEY = "bilimrank_state_v1";

let activities = [];
let currentBid = 1800000;
let currentFilter = "all";
let currentPeriod = "all";
let ranking = [];

function nextBid(p) {
  return Math.round(Number(p) * 1.05 / 10000) * 10000;
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || null;
  } catch (e) {
    return null;
  }
}
function baseLocal() {
  return { added: [], raised: {}, localActs: [] };
}
function ensureLocal() {
  let s = readLocal();
  if (!s) {
    s = baseLocal();
    writeLocal(s);
  }
  return s;
}
function writeLocal(s) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch (e) {}
}

async function loadData() {
  try {
    const [c, a] = await Promise.all([
      fetch(API_BASE + "/centers").then((r) => r.json()),
      fetch(API_BASE + "/activities").then((r) => r.json())
    ]);

    const s = ensureLocal();
    let merged = c.map((x) =>
      s.raised[x.id] != null
        ? { ...x, price: s.raised[x.id], isToday: true, time: "hozir" }
        : x
    );
    merged = merged.concat(s.added);
    ranking = merged.sort((a, b) => b.price - a.price);

    activities = s.localActs.concat(a);

    if (ranking.length) {
      currentBid = nextBid(ranking[0].price);
      updateBid();
    }
    render();
    renderFeed();
    renderStats();
  } catch (e) {
    console.error("Ma'lumotlarni yuklab bo'lmadi", e);
  }
}

function renderStats() {
  const revenue = ranking.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
  const visits =
    ranking.reduce((sum, c) => sum + (Number(c.clicks) || 0), 0) + 8240;
  document.getElementById("revenue").textContent =
    formatPrice(revenue) + " so‘m";
  document.getElementById("visits").textContent = visits.toLocaleString("uz-UZ");
  document.getElementById("centers").textContent = ranking.length;
}

function formatPrice(n) {
  n = Number(n) || 0;
  if (n >= 1000000) {
    let m = (n / 1000000).toFixed(2).replace(/\.?0+$/, "");
    return m + " mln";
  }
  if (n >= 1000) return Math.round(n / 1000).toLocaleString("uz-UZ") + " ming";
  return n.toLocaleString("uz-UZ");
}

function rankClass(i) {
  if (i === 1) return "r1";
  if (i === 2) return "r2";
  if (i === 3) return "r3";
  return "";
}

function getList() {
  let list = [...ranking];
  if (currentPeriod === "today") list = list.filter((c) => c.isToday);
  if (currentFilter !== "all") list = list.filter((c) => c.category === currentFilter);
  return list;
}

function render() {
  const el = document.getElementById("ranking");
  const title = document.getElementById("ranking-title");
  const sub = document.getElementById("ranking-sub");
  const list = getList();

  if (currentPeriod === "today") {
    title.textContent = "Bugungi aktivlar";
    sub.textContent = "Bugun taklif bergan o‘quv markazlari";
  } else {
    title.textContent = "Umumiy reyting";
    sub.textContent = "Barcha vaqtlar bo‘yicha eng yuqori takliflar";
  }

  if (!list.length) {
    el.innerHTML = '<p class="empty">Bu bo‘limda hozircha markaz yo‘q</p>';
    return;
  }

  let html = "";
  list.forEach((c, i) => {
    const rank = i + 1;
    // +5% next price
    const next = Math.round(c.price * 1.05 / 10000) * 10000;

    html += `
      <article class="row ${rankClass(rank)}">
        <div class="rank">#${rank}</div>
        <div class="av">${c.logo}</div>
        <div class="body">
          <div class="title">${c.name}</div>
          <div class="snippet">${c.desc}</div>
          <div class="meta">
            <span>${c.time}</span>
            <span>${c.url}</span>
            <span>${c.categoryLabel}</span>
            <span>· ${c.clicks.toLocaleString("uz-UZ")} klik</span>
            ${c.isToday ? '<span class="tag-today">Bugun</span>' : ""}
          </div>
        </div>
        <div class="right">
          <div class="price">${formatPrice(c.price)} so‘m</div>
          <button class="btn-take" type="button" onclick="takePlace(${c.id},${next})">
            ${formatPrice(next)} so‘mga egallash
          </button>
          <button class="btn-up" type="button" onclick="raiseBid(${c.id})">Oshirish</button>
        </div>
      </article>
    `;
    if (rank === 3 && list.length > 3) html += '<div class="hr-line">TOP 3</div>';
  });
  el.innerHTML = html;
}

function renderFeed() {
  const el = document.getElementById("activity-list");
  el.innerHTML = activities.slice(0, 8).map((a) => `
    <div class="feed-item">
      <div class="feed-ico">${a.logo}</div>
      <div>
        <div><strong>${a.name}</strong> <span class="act">${a.action}</span>
          ${a.amount != null ? `<span class="amt">${formatPrice(a.amount)}</span>` : ""}
        </div>
        <div class="when">${a.time}</div>
      </div>
    </div>
  `).join("");
}

function updateBid() {
  document.getElementById("bid-amount").textContent = formatPrice(currentBid);
}

document.getElementById("btn-plus").onclick = () => {
  currentBid += 100000;
  updateBid();
};

document.getElementById("btn-minus").onclick = () => {
  currentBid = Math.max(50000, currentBid - 100000);
  updateBid();
};

document.getElementById("bid-form").onsubmit = async (e) => {
  e.preventDefault();
  const url = document.getElementById("url-input").value.trim();
  const cat = document.getElementById("cat-select").value;
  if (!url || !cat) return;

  try {
    const res = await fetch(API_BASE + "/centers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, category: cat, price: currentBid })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("Xatolik: " + (err.error || "noma’lum"));
      return;
    }
    const item = await res.json();

    const s = ensureLocal();
    const isTop = !ranking.length || currentBid >= ranking[0].price;
    s.added.push(item);
    s.localActs.unshift({
      name: item.name,
      logo: item.logo,
      amount: item.price,
      action: isTop ? "TOP-1 o‘rinni egalladi" : "reytingga qo‘shildi",
      time: "hozir"
    });
    writeLocal(s);

    await loadData();
    currentBid = nextBid(ranking[0].price);
    updateBid();
    document.getElementById("url-input").value = "";
    showModal(
      "<h3>✅ Markaz qo‘shildi!</h3><p><strong>" +
        item.name +
        "</strong> " +
        formatPrice(item.price) +
        " so‘m bilan reytingga tushdi.</p><p>Bu — demo rejim. Haqiqiy to‘lov ulanishi uchun Click / Payme / Stripe kalitlari ulash kerak bo‘ladi.</p>"
    );
  } catch (err) {
    showModal("<h3>❌ Xatolik</h3><p>Serverga ulanishda xatolik yuz berdi.</p>");
  }
};

document.querySelectorAll(".tab").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentPeriod = btn.dataset.period;
    render();
  };
});

document.querySelectorAll(".chip").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.cat;
    render();
  };
});

window.takePlace = (id, price) => {
  currentBid = price;
  updateBid();
  const panel = document.getElementById("bid-form");
  panel.scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("url-input").focus();
  showModal(
    "<h3>O‘rinni egallash</h3><p>Taklif miqdori <strong>" +
      formatPrice(price) +
      " so‘m</strong> ga o‘rnatildi.</p><p>Markazingiz havolasi va yo‘nalishini kiritib, <strong>«O‘rinni egallash»</strong> tugmasini bosing — darhol TOP-1 bo‘lasiz.</p>"
  );
};

window.raiseBid = async (id) => {
  const center = ranking.find((c) => c.id === id);
  if (!center) return;
  const newPrice = Math.round(center.price * 1.05 / 10000) * 10000;

  // serverga ham xabar beramiz (agar ishlamasa ham local saqlanadi)
  try {
    await fetch(API_BASE + "/centers/" + id + "/raise", { method: "POST" });
  } catch (err) {}

  const s = ensureLocal();
  s.raised[id] = newPrice;
  s.localActs.unshift({
    name: center.name,
    logo: center.logo,
    amount: newPrice,
    action: "taklifini oshirdi",
    time: "hozir"
  });
  writeLocal(s);

  await loadData();
  currentBid = nextBid(ranking[0].price);
  updateBid();
};

function showModal(html) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-body").innerHTML = html;
  modal.hidden = false;
}
function hideModal() {
  document.getElementById("modal").hidden = true;
}
document.getElementById("modal-close").onclick = hideModal;
document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") hideModal();
};

loadData();

setInterval(() => {
  document.getElementById("online").textContent = 20 + Math.floor(Math.random() * 35);
}, 7000);
