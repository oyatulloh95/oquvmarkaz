const SEED = {
  centers: [
    { id: 1, name: "Cambridge LC Tashkent", desc: "IELTS, CEFR, general English. Tajribali o‘qituvchilar, kichik guruhlar.", url: "cambridgelc.uz", category: "cefr", categoryLabel: "IELTS / CEFR", price: 1800000, clicks: 2104, time: "2 soat oldin", logo: "🎓", isToday: true },
    { id: 2, name: "IT Park Academy", desc: "Frontend, backend, mobil dasturlash. Amaliy loyihalar bilan.", url: "itpark.uz", category: "it", categoryLabel: "IT", price: 1500000, clicks: 1876, time: "4 soat oldin", logo: "💻", isToday: true },
    { id: 3, name: "Matematika Plus", desc: "Maktab va olimpiada matematikasi. 5–11-sinflar.", url: "matemplus.uz", category: "matematika", categoryLabel: "Matematika", price: 1200000, clicks: 945, time: "1 kun oldin", logo: "📐", isToday: false },
    { id: 4, name: "English Hub", desc: "Bolalar va kattalar uchun ingliz tili. Speaking club har kuni.", url: "englishhub.uz", category: "ingliz", categoryLabel: "Ingliz", price: 980000, clicks: 1120, time: "1 kun oldin", logo: "🇬🇧", isToday: false },
    { id: 5, name: "Smart Kids", desc: "Maktabga tayyorlov, erta rivojlantirish. 3–7 yosh.", url: "smartkids.uz", category: "otomaktab", categoryLabel: "Tayyorlov", price: 750000, clicks: 634, time: "2 kun oldin", logo: "👶", isToday: false },
    { id: 6, name: "Rus Tili Profi", desc: "Rus tili noldan. Grammatika, nutq, imtihonga tayyorlov.", url: "t.me/rustiliprofi", category: "rus", categoryLabel: "Rus tili", price: 620000, clicks: 512, time: "bugun", logo: "🇷🇺", isToday: true },
    { id: 7, name: "CodeLab", desc: "Python, JavaScript, algoritmlar. O‘smirlar uchun.", url: "codelab.uz", category: "it", categoryLabel: "IT", price: 540000, clicks: 489, time: "3 kun oldin", logo: "🖥️", isToday: false },
    { id: 8, name: "IELTS Master", desc: "Band 7+ kafolati. Intensive va evening guruhlar.", url: "ieltsmaster.uz", category: "cefr", categoryLabel: "IELTS", price: 480000, clicks: 701, time: "bugun", logo: "🎯", isToday: true },
    { id: 9, name: "Algebra Club", desc: "Algebra va geometriya chuqurlashtirilgan.", url: "algebraclub.uz", category: "matematika", categoryLabel: "Matematika", price: 390000, clicks: 288, time: "4 kun oldin", logo: "📏", isToday: false },
    { id: 10, name: "Kids English World", desc: "O‘yin orqali ingliz tili. 4–10 yosh.", url: "instagram.com/kidsworld", category: "ingliz", categoryLabel: "Ingliz", price: 320000, clicks: 356, time: "5 kun oldin", logo: "📗", isToday: false }
  ],
  activities: [
    { name: "Cambridge LC Tashkent", logo: "🎓", amount: 1800000, action: "TOP-1 o‘rinni egalladi", time: "2 soat oldin" },
    { name: "IT Park Academy", logo: "💻", amount: 1500000, action: "taklifini oshirdi", time: "4 soat oldin" },
    { name: "Rus Tili Profi", logo: "🇷🇺", amount: 620000, action: "reytingga qo‘shildi", time: "bugun" },
    { name: "IELTS Master", logo: "🎯", amount: 480000, action: "taklifini oshirdi", time: "bugun" },
    { name: "Matematika Plus", logo: "📐", amount: 1200000, action: "#3 o‘rinni oldi", time: "1 kun oldin" }
  ]
};

module.exports = SEED;
