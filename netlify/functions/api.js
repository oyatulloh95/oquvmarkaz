const SEED = require("../../backend/seed");
const { processApi } = require("../../backend/api-core");

const STORE_NAME = "bilimrank-db";

let cachedDb = null;
let blobStore = null;
let blobChecked = false;

async function getBlobStore() {
  if (blobChecked) return blobStore;
  blobChecked = true;
  try {
    const { getStore } = require("@netlify/blobs");
    blobStore = getStore({ name: STORE_NAME });
  } catch (e) {
    blobStore = null;
  }
  return blobStore;
}

async function loadDB() {
  try {
    const store = await getBlobStore();
    if (store) {
      const data = await store.get("db.json", { type: "json" });
      if (data && data.centers) return data;
      const seeded = JSON.parse(JSON.stringify(SEED));
      await store.set("db.json", JSON.stringify(seeded));
      return seeded;
    }
  } catch (e) {
    // fall through to in-memory
  }
  if (!cachedDb) cachedDb = JSON.parse(JSON.stringify(SEED));
  return cachedDb;
}

async function saveDB(db) {
  try {
    const store = await getBlobStore();
    if (store) {
      await store.set("db.json", JSON.stringify(db));
      return;
    }
  } catch (e) {
    // fall through
  }
  cachedDb = JSON.parse(JSON.stringify(db));
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

    if (method === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: ""
      };
    }

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
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(result.json)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Server xatosi", detail: err.message })
    };
  }
};
