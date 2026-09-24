/*
 * Logger：事件層（events）與 patch 層（patches）兩份紀錄。
 * 每筆事件同時記相對時間 t（ms，自 session 開始，performance.now）與 wall（epoch ms），
 * wall 用來和螢幕錄影、攝影機畫面對時。
 * 資料會持續存進 localStorage，當機或誤關頁面時可從設定頁重新匯出。
 */
window.Logger = (function () {
  const PREFIX = "svff_session_";
  let meta = null, events = [], patches = [], blocks = [], key = null, t0 = 0, saveTimer = null;

  function start(m) {
    t0 = performance.now();
    events = []; patches = []; blocks = [];
    meta = Object.assign({}, m, {
      startedAt: new Date().toISOString(),
      startedWall: Date.now(),
      userAgent: navigator.userAgent,
      screen: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio }
    });
    key = PREFIX + m.participant + "_" + meta.startedWall;
    save();
  }

  function t() { return Math.round(performance.now() - t0); }

  function log(type, data) {
    const e = Object.assign({ t: t(), wall: Date.now(), type: type }, data || {});
    events.push(e);
    scheduleSave();
    return e;
  }

  function addPatch(p) { patches.push(p); scheduleSave(); }
  function addBlock(b) { blocks.push(b); scheduleSave(); }
  function finish(extra) { meta.finishedAt = new Date().toISOString(); Object.assign(meta, extra || {}); save(); }

  function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(function () { saveTimer = null; save(); }, 500);
  }
  function save() {
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(snapshot())); } catch (err) { console.warn("save failed", err); }
  }
  function snapshot() { return { meta: meta, blocks: blocks, patches: patches, events: events }; }

  // ---------- 匯出 ----------
  function toCSV(rows) {
    if (!rows.length) return "";
    const cols = [];
    rows.forEach(function (r) { Object.keys(r).forEach(function (k) { if (cols.indexOf(k) < 0) cols.push(k); }); });
    const esc = function (v) {
      if (v === null || v === undefined) return "";
      if (typeof v === "object") v = JSON.stringify(v);
      v = String(v);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    return [cols.join(",")].concat(rows.map(function (r) { return cols.map(function (c) { return esc(r[c]); }).join(","); })).join("\n");
  }

  function download(name, text, mime) {
    const blob = new Blob([text], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function exportData(data) {
    data = data || snapshot();
    const base = "P" + data.meta.participant + "_seq" + data.meta.sequence + "_" + data.meta.startedWall;
    download(base + ".json", JSON.stringify(data, null, 2), "application/json");
    download(base + "_patches.csv", "﻿" + toCSV(data.patches), "text/csv");
    download(base + "_events.csv", "﻿" + toCSV(data.events), "text/csv");
  }

  function listSaved() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0) {
        try { out.push({ key: k, data: JSON.parse(localStorage.getItem(k)) }); } catch (e) { /* skip */ }
      }
    }
    return out.sort(function (a, b) { return b.data.meta.startedWall - a.data.meta.startedWall; });
  }
  function removeSaved(k) { localStorage.removeItem(k); }

  return { start, log, addPatch, addBlock, finish, snapshot, exportData, listSaved, removeSaved, now: t, toCSV };
})();
