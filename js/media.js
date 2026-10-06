/*
 * 影片載入：施測前在手機上匯入影片檔，存進這個瀏覽器的 IndexedDB。
 *   - 檔名（去掉副檔名）必須等於 config 中的影片編號，例如 HS-A01.mp4、P01.mp4
 *   - 影片只存在這台裝置，不會上傳到任何地方；播放影片不需要網路（頁面本身仍要從網址開啟）
 *   - iPhone 請先「加入主畫面」再從主畫面開啟，避免 Safari 清除久未使用網站的資料
 */
(function () {
  const DB_NAME = "svff-media", STORE = "videos";
  let db = null;
  const index = {};      // id → { id, size, type, durationSec, name, addedAt }
  const urls = {};       // id → object URL（快取）

  function open() {
    return new Promise(function (resolve, reject) {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE, { keyPath: "id" }); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function tx(mode) { return db.transaction(STORE, mode).objectStore(STORE); }
  function reqP(r) { return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }

  function readDuration(blob) {
    return new Promise(function (resolve) {
      const v = document.createElement("video");
      const u = URL.createObjectURL(blob);
      let done = false;
      function fin(d) { if (done) return; done = true; URL.revokeObjectURL(u); v.removeAttribute("src"); resolve(d); }
      v.preload = "metadata"; v.muted = true;
      v.onloadedmetadata = function () { fin(isFinite(v.duration) ? Math.round(v.duration * 10) / 10 : null); };
      v.onerror = function () { fin(null); };
      setTimeout(function () { fin(null); }, 10000);
      v.src = u;
    });
  }

  const Media = {
    init: function () {
      if (!window.indexedDB) return Promise.reject(new Error("這個瀏覽器不支援 IndexedDB"));
      return open().then(function (d) {
        db = d;
        return new Promise(function (resolve, reject) {
          const r = tx("readonly").openCursor();
          r.onsuccess = function () {
            const c = r.result;
            if (!c) { resolve(); return; }
            const v = c.value;
            index[v.id] = { id: v.id, size: v.size, type: v.type, durationSec: v.durationSec, name: v.name, addedAt: v.addedAt };
            c.continue();
          };
          r.onerror = function () { reject(r.error); };
        });
      });
    },

    // files: FileList；knownIds: config 中所有影片編號
    importFiles: function (files, knownIds, onProgress) {
      const known = new Set(knownIds);
      const result = { added: [], replaced: [], skipped: [], failed: [] };
      const list = Array.prototype.slice.call(files);
      let chain = Promise.resolve();
      list.forEach(function (f, i) {
        chain = chain.then(function () {
          const id = f.name.replace(/\.[^.]+$/, "").trim();
          if (!known.has(id)) { result.skipped.push(f.name); return; }
          return readDuration(f).then(function (dur) {
            const rec = { id: id, blob: f, size: f.size, type: f.type || "video/mp4", durationSec: dur, name: f.name, addedAt: new Date().toISOString() };
            return reqP(tx("readwrite").put(rec)).then(function () {
              (index[id] ? result.replaced : result.added).push(id);
              index[id] = { id: id, size: rec.size, type: rec.type, durationSec: dur, name: f.name, addedAt: rec.addedAt };
              if (urls[id]) { URL.revokeObjectURL(urls[id]); delete urls[id]; }
            });
          }).catch(function (e) { result.failed.push(f.name + "：" + e.message); });
        }).then(function () { if (onProgress) onProgress(i + 1, list.length); });
      });
      return chain.then(function () { return result; });
    },

    has: function (id) { return !!index[id]; },
    info: function (id) { return index[id] || null; },
    count: function () { return Object.keys(index).length; },
    totalBytes: function () { return Object.values(index).reduce(function (a, r) { return a + (r.size || 0); }, 0); },

    // 回傳 Promise<object URL>
    url: function (id) {
      if (urls[id]) return Promise.resolve(urls[id]);
      return reqP(tx("readonly").get(id)).then(function (rec) {
        if (!rec) return null;
        urls[id] = URL.createObjectURL(rec.blob);
        return urls[id];
      });
    },

    clear: function () {
      Object.keys(urls).forEach(function (k) { URL.revokeObjectURL(urls[k]); delete urls[k]; });
      Object.keys(index).forEach(function (k) { delete index[k]; });
      return reqP(tx("readwrite").clear());
    },

    // 請瀏覽器不要自動清除這個網站的資料
    persist: function () {
      const s = navigator.storage;
      if (!s || !s.persist) return Promise.resolve(null);
      return s.persisted().then(function (p) { return p ? true : s.persist(); }).catch(function () { return null; });
    },
    estimate: function () {
      const s = navigator.storage;
      return s && s.estimate ? s.estimate().catch(function () { return null; }) : Promise.resolve(null);
    }
  };

  window.Media = Media;
})();
