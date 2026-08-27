const { getStore } = require("@netlify/blobs");
const { processApi } = require("../../backend/api-core");
const SEED = require("../../backend/seed");

const STORE_NAME = "bilimrank-db";

function getDbStore() {
  return getStore({ name: STORE_NAME });
}

async function loadDB() {
  const store = getDbStore();
  let data = await store.get("db.json", { type: "json" });
  if (!data || !data.centers) {
    data = JSON.parse(JSON.stringify(SEED));
    await store.set("db.json", JSON.stringify(data));
  }
  return data;
}

async function saveDB(db) {
  const store = getDbStore();
  await store.set("db.json", JSON.stringify(db));
}

function normalizePath(event) {
  let p = event.path || "";
  p = p.replace(/^\/\.netlify\/functions\/api/, "");
  if (!p) p = "/";
  if (!p.startsWith("/")) p = "/" + p;
  return p;
}

exports.handler = async (event, context) => {
  try {
    const method = (event.httpMethod || "GET").toUpperCase();
    const pathname = normalizePath(event);

    const query = {};
    if (event.queryStringParameters) {
      Object.assign(query, event.queryStringParameters);
    }

    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        body = {};
      }
    }

    const db = await loadDB();
    const result = processApi({ method, pathname, query, body }, db);
    if (result.changed) await saveDB(db);

    return {
      statusCode: result.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(result.json)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Server xatosi" })
    };
  }
};
