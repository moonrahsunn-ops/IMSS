// Base de datos local en IndexedDB. Todo se guarda en el navegador del dispositivo.
// Expone la misma interfaz simple que usaba la app: db.entities.Product.list(), .create(), .update(), etc.

const DB_NAME = "inventario_local";
const DB_VERSION = 1;
export const ENTITY_NAMES = ["Product", "Accessory", "Location", "Category", "Sale", "Work"];

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const database = req.result;
      ENTITY_NAMES.forEach((n) => {
        if (!database.objectStoreNames.contains(n)) database.createObjectStore(n, { keyPath: "id" });
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

// Ejecuta una operación en una transacción y devuelve el resultado de la petición.
async function run(store, mode, fn) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const t = database.transaction(store, mode);
    let result;
    const req = fn(t.objectStore(store));
    if (req) req.onsuccess = () => { result = req.result; };
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

// ---- Avisos de cambios (también entre pestañas abiertas) ----
const listeners = {};
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("inventario_local") : null;

function notify(entity, event) {
  (listeners[entity] || []).forEach((cb) => {
    try { cb(event); } catch { /* ignorar */ }
  });
}
function emit(entity, event) {
  notify(entity, event);
  if (channel) channel.postMessage({ entity, event });
}
if (channel) channel.onmessage = (e) => notify(e.data.entity, e.data.event);

// ---- Utilidades ----
const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

function cmp(a, b) {
  if (a == null) return b == null ? 0 : -1;
  if (b == null) return 1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function applySort(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  const sorted = [...rows].sort((a, b) => cmp(a[field], b[field]));
  return desc ? sorted.reverse() : sorted;
}

function matchQuery(row, query) {
  if (!query) return true;
  return Object.entries(query).every(([k, v]) => {
    if (v == null || v === "") return true;
    const rv = row[k];
    if (rv == null) return false;
    return String(rv) === String(v);
  });
}

function createEntity(name) {
  const api = {
    async list(sort = "created_date", limit) {
      let rows = (await run(name, "readonly", (s) => s.getAll())) || [];
      rows = applySort(rows, sort);
      if (limit) rows = rows.slice(0, limit);
      return rows;
    },
    async filter(query, sort = "created_date", limit) {
      let rows = (await run(name, "readonly", (s) => s.getAll())) || [];
      rows = applySort(rows.filter((r) => matchQuery(r, query)), sort);
      if (limit) rows = rows.slice(0, limit);
      return rows;
    },
    async get(id) {
      return (await run(name, "readonly", (s) => s.get(id))) || null;
    },
    async create(data) {
      const now = new Date().toISOString();
      const record = { ...data, id: data.id || genId(), created_date: data.created_date || now, updated_date: now };
      await run(name, "readwrite", (s) => s.put(record));
      emit(name, { type: "create", id: record.id });
      return record;
    },
    async bulkCreate(arr) {
      const now = new Date().toISOString();
      const records = arr.map((data) => ({
        ...data, id: data.id || genId(), created_date: data.created_date || now, updated_date: now,
      }));
      await run(name, "readwrite", (s) => { records.forEach((r) => s.put(r)); });
      emit(name, { type: "list" });
      return records;
    },
    async update(id, data) {
      const database = await openDB();
      const updated = await new Promise((resolve, reject) => {
        const t = database.transaction(name, "readwrite");
        const os = t.objectStore(name);
        const getReq = os.get(id);
        let out;
        getReq.onsuccess = () => {
          const existing = getReq.result;
          if (!existing) {
            reject(new Error("Registro no encontrado: " + id));
            t.abort();
            return;
          }
          out = { ...existing, ...data, id, updated_date: new Date().toISOString() };
          os.put(out);
        };
        t.oncomplete = () => resolve(out);
        t.onerror = () => reject(t.error);
      });
      emit(name, { type: "update", id });
      return updated;
    },
    async delete(id) {
      await run(name, "readwrite", (s) => s.delete(id));
      emit(name, { type: "delete", id });
    },
    subscribe(cb) {
      (listeners[name] = listeners[name] || []).push(cb);
      return () => {
        listeners[name] = (listeners[name] || []).filter((f) => f !== cb);
      };
    },
  };
  return api;
}

const cache = {};
export const db = {
  entities: new Proxy({}, {
    get(_, name) {
      if (typeof name !== "string") return undefined;
      if (!ENTITY_NAMES.includes(name)) throw new Error("Entidad desconocida: " + name);
      if (!cache[name]) cache[name] = createEntity(name);
      return cache[name];
    },
  }),
};

// ---- Respaldo ----
export async function exportBackup() {
  const data = {};
  for (const n of ENTITY_NAMES) data[n] = (await run(n, "readonly", (s) => s.getAll())) || [];
  return { app: "inventario", version: 1, exported_at: new Date().toISOString(), data };
}

// Reemplaza TODOS los datos actuales por los del respaldo.
export async function importBackup(backup) {
  if (!backup || backup.app !== "inventario" || !backup.data) {
    throw new Error("El archivo no es un respaldo válido de esta app.");
  }
  for (const n of ENTITY_NAMES) {
    const rows = Array.isArray(backup.data[n]) ? backup.data[n] : [];
    await run(n, "readwrite", (s) => { s.clear(); rows.forEach((r) => s.put(r)); });
    emit(n, { type: "list" });
  }
}
