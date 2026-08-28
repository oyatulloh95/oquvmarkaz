const path = require("path");
const { processApi } = require(path.join(__dirname, "..", "backend", "api-core"));
const SEED = require(path.join(__dirname, "..", "backend", "seed"));

const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";

let cachedDb = null;
function getDB() {
  if (!cachedDb) cachedDb = JSON.parse(JSON.stringify(SEED));
  return cachedDb;
}

function isAuthed(req) {
  return (req.headers["x-admin-key"] || "") === ADMIN_PASS;
}

function isMutating(p) {
  return (
    p === "/api/centers" ||
    /^\/api\/centers\/\d+\/raise$/.test(p) ||
    p === "/api/reset" ||
    p === "/api/clean-updates"
  );
}

function send(res, status, obj) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = status;
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body !== undefined) {
      if (typeof req.body === "string") {
        try { return resolve(JSON.parse(req.body)); } catch (e) { return resolve({}); }
      }
      if (typeof req.body === "object") return resolve(req.body);
      return resolve({});
    }
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve({}); }
    });
  });
}

module.exports = async (req, res) => {
  try {
    const method = (req.method || "GET").toUpperCase();
    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;

    if (method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
      res.statusCode = 204;
      return res.end();
    }

    if (method === "GET" && pathname === "/api/admin/check") {
      return send(res, 200, { ok: isAuthed(req) });
    }

    if (method === "POST" && isMutating(pathname) && !isAuthed(req)) {
      return send(res, 401, { error: "Faqat admin o‘zgartira oladi" });
    }

    const query = Object.fromEntries(url.searchParams.entries());
    const body = await readBody(req);

    const db = getDB();
    const result = processApi({ method, pathname, query, body }, db);
    // In-memory store (Vercel serverless). Admin browser also keeps data via localStorage.

    return send(res, result.status, result.json);
  } catch (err) {
    return send(res, 500, { error: "Server xatosi", detail: err.message });
  }
};
