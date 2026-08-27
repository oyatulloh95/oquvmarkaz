const CATEGORIES = {
  ingliz: "Ingliz",
  it: "IT",
  matematika: "Matematika",
  rus: "Rus tili",
  otomaktab: "Tayyorlov",
  cefr: "IELTS / CEFR",
  boshqa: "Boshqa"
};

function nextBid(p) {
  return Math.round((Number(p) || 0) * 1.05 / 10000) * 10000;
}

function sortByPrice(list) {
  return [...list].sort((a, b) => b.price - a.price);
}

function computeStats(db) {
  const revenue = db.centers.reduce((s, c) => s + (Number(c.price) || 0), 0);
  const visits = db.centers.reduce((s, c) => s + (Number(c.clicks) || 0), 0) + 8240;
  return { revenue, visits, centers: db.centers.length };
}

function processApi(ctx, db) {
  const { method, pathname, query, body } = ctx;
  let changed = false;

  if (method === "GET" && pathname === "/api/centers") {
    let list = sortByPrice(db.centers);
    if (query.period === "today") list = list.filter((c) => c.isToday);
    if (query.cat && query.cat !== "all") list = list.filter((c) => c.category === query.cat);
    return { status: 200, json: list, changed: false };
  }

  if (method === "GET" && pathname === "/api/activities") {
    return { status: 200, json: db.activities.slice(0, 8), changed: false };
  }

  if (method === "GET" && pathname === "/api/stats") {
    return { status: 200, json: computeStats(db), changed: false };
  }

  if (method === "POST" && pathname === "/api/centers") {
    const rawUrl = (body.url || "").toString().trim();
    const category = (body.category || "").toString().trim();
    const price = Number(body.price);

    if (!rawUrl || !category || !CATEGORIES[category]) {
      return { status: 400, json: { error: "url va yo‘nalish majburiy" }, changed: false };
    }
    if (!Number.isFinite(price) || price < 50000) {
      return { status: 400, json: { error: "Taklif kamida 50 000 so‘m bo‘lishi kerak" }, changed: false };
    }

    const cleanUrl = rawUrl.replace(/^https?:\/\//, "");
    const name = cleanUrl.includes("t.me")
      ? "@" + cleanUrl.split("/").pop()
      : "Yangi o‘quv markazi";

    const item = {
      id: Date.now(),
      name,
      desc: "Yangi qo‘shilgan o‘quv markazi.",
      url: cleanUrl,
      category,
      categoryLabel: CATEGORIES[category],
      price,
      clicks: 0,
      time: "hozir",
      logo: "📚",
      isToday: true
    };

    db.centers.push(item);
    const ranked = sortByPrice(db.centers);
    const isTop = ranked[0] && ranked[0].id === item.id;

    db.activities.unshift({
      name,
      logo: "📚",
      amount: price,
      action: isTop ? "TOP-1 o‘rinni egalladi" : "reytingga qo‘shildi",
      time: "hozir"
    });
    changed = true;
    return { status: 201, json: item, changed };
  }

  const m = pathname.match(/^\/api\/centers\/(\d+)\/raise$/);
  if (method === "POST" && m) {
    const id = Number(m[1]);
    const center = db.centers.find((c) => c.id === id);
    if (!center) return { status: 404, json: { error: "Markaz topilmadi" }, changed: false };

    center.price = nextBid(center.price);
    center.isToday = true;
    center.time = "hozir";

    db.activities.unshift({
      name: center.name,
      logo: center.logo,
      amount: center.price,
      action: "taklifini oshirdi",
      time: "hozir"
    });
    changed = true;
    return { status: 200, json: center, changed };
  }

  return { status: 404, json: { error: "API yo‘li topilmadi" }, changed: false };
}

module.exports = { CATEGORIES, nextBid, sortByPrice, computeStats, processApi };
