/*
 * 主流程：設定 → 說明 → (練習) → Block 1 → 時間估計 → 休息 → Block 2 → 時間估計 → 結束與匯出
 *
 * Patch outcome（每支影片的離開方式）：
 *   swipe_early   影片未播完就往上滑走（主動離開；微摩擦下為確認後離開）
 *   end_click     看完，在倒數內主動點「下一支」（主動繼續）
 *   end_swipe     看完，在倒數內往上滑（主動繼續）
 *   end_timeout   看完，倒數結束仍未動作，自動播下一支（沒有在做決定）
 *   end_auto      看完，結束畫面關閉時直接自動播下一支
 *   swipe_back    往下滑回上一支（re-visit）
 *   block_timeout block 時間到，強制結束
 */
(function () {
  const C = window.EXP_CONFIG;
  const L = window.Logger;
  const $ = function (s) { return document.querySelector(s); };
  const params = new URLSearchParams(location.search);
  const DEBUG = params.get("debug") === "1";

  let S = null;   // session
  let B = null;   // 目前 block 的執行狀態

  function show(id) {
    document.querySelectorAll(".screen").forEach(function (e) { e.classList.toggle("active", e.id === id); });
  }

  // ================= 設定頁 =================
  function initSetup() {
    const seqSel = $("#in-seq");
    Object.keys(C.sequences).forEach(function (k) {
      const o = document.createElement("option");
      o.value = k;
      o.textContent = k + "：" + C.sequences[k].map(function (b) {
        return (b.friction === "zero" ? "零" : "微") + (b.scent === "high" ? "高" : "低") + "(" + b.set + ")";
      }).join(" → ");
      seqSel.appendChild(o);
    });
    $("#in-scale-row").classList.toggle("hidden", !DEBUG);
    $("#cfg-version").textContent = C.version;
    $("#btn-start").addEventListener("click", startSession);
    renderSaved();
  }

  function renderSaved() {
    const box = $("#saved-list");
    const list = L.listSaved();
    box.innerHTML = list.length ? "" : "<p class='muted'>尚無資料</p>";
    list.forEach(function (s) {
      const m = s.data.meta;
      const row = document.createElement("div");
      row.className = "saved-row";
      row.innerHTML = "<span>P" + m.participant + "｜序列 " + m.sequence + "｜" + new Date(m.startedWall).toLocaleString() +
        "｜" + s.data.patches.length + " patches" + (m.finishedAt ? "" : "（未完成）") + "</span>";
      const ex = document.createElement("button"); ex.textContent = "匯出";
      ex.onclick = function () { L.exportData(s.data); };
      const del = document.createElement("button"); del.textContent = "刪除"; del.className = "danger";
      del.onclick = function () { if (confirm("確定刪除這份資料？（請先確認已匯出）")) { L.removeSaved(s.key); renderSaved(); } };
      row.appendChild(ex); row.appendChild(del);
      box.appendChild(row);
    });
  }

  function startSession() {
    const pid = $("#in-pid").value.trim();
    if (!pid) { alert("請輸入受試者編號"); return; }
    const seq = $("#in-seq").value;
    const timeScale = DEBUG ? Number($("#in-scale").value) || 1 : 1;

    const blocks = [];
    if (C.practice.enabled) {
      blocks.push({ name: "practice", practice: true, friction: C.practice.friction, scent: "na", set: "P", items: C.practice.items, durationSec: null });
    }
    C.sequences[seq].forEach(function (b, i) {
      if (!C.stimulusSets[b.set]) throw new Error("config 找不到影片組：" + b.set);
      blocks.push({ name: "block" + (i + 1), practice: false, friction: b.friction, scent: b.scent, set: b.set,
        items: C.stimulusSets[b.set], durationSec: C.blockDurationSec });
    });

    S = { pid: pid, seq: seq, timeScale: timeScale, blocks: blocks, blockIdx: -1 };
    L.start({ participant: pid, sequence: seq, timeScale: timeScale, configVersion: C.version, config: C });
    L.log("session_start");

    try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch (e) { /* iOS 不支援 */ }
    show("screen-intro");
  }

  // ================= Block =================
  function nextBlock() {
    S.blockIdx++;
    if (S.blockIdx >= S.blocks.length) return finishSession();
    const def = S.blocks[S.blockIdx];
    B = { def: def, pos: -1, trial: 0, visits: {}, patch: null, player: null, state: "idle",
          startT: L.now(), timers: [], endScreenT: null };
    L.log("block_start", ctx({ durationSec: def.durationSec, block_scent: def.scent, set: def.set }));
    show("screen-feed");
    syncFlash();
    if (def.durationSec) {
      B.blockTimer = setTimeout(function () { endBlock("time_budget"); }, def.durationSec * 1000 / S.timeScale);
    }
    openPatch(0, "start");
  }

  // 對時用的白色閃光：同時出現在螢幕錄影與肩後攝影機畫面
  function syncFlash() {
    const f = $("#sync-flash");
    f.classList.remove("hidden");
    L.log("sync_flash", ctx({}));
    setTimeout(function () { f.classList.add("hidden"); }, 300);
  }

  function endBlock(reason) {
    if (!B || B.state === "ended") return;
    if (B.patch) closePatch("block_timeout");
    clearTimeout(B.blockTimer);
    B.state = "ended";
    const dur = L.now() - B.startT;
    L.log("block_end", ctx({ reason: reason, actualMs: dur }));
    L.addBlock({ block: B.def.name, practice: B.def.practice, friction: B.def.friction, block_scent: B.def.scent, set: B.def.set,
                 start_t: B.startT, end_t: L.now(), actual_ms: dur, end_reason: reason,
                 n_patches: B.trial, time_estimate_min: null });
    if (B.def.practice) { show("screen-break"); $("#break-msg").textContent = "練習結束。準備好了就開始。"; return; }
    openEstimate();
  }

  // ================= Patch =================
  function ctx(extra) {
    const o = { block: B ? B.def.name : null, friction: B ? B.def.friction : null };
    if (B && B.patch) {
      o.trial = B.patch.trial; o.video_id = B.patch.video_id;
      o.pos_ms = B.player ? B.player.getPosMs() : null;
    }
    return Object.assign(o, extra || {});
  }

  function openPatch(pos, via) {
    const items = B.def.items;
    if (pos < 0) pos = 0;
    if (pos >= items.length) { endBlock("stimuli_exhausted"); return; }
    const item = items[pos];
    B.pos = pos; B.trial++;
    B.visits[pos] = (B.visits[pos] || 0) + 1;
    B.patch = {
      participant: S.pid, sequence: S.seq, block: B.def.name, practice: B.def.practice,
      friction: B.def.friction, block_scent: B.def.scent, set: B.def.set, trial: B.trial, feed_pos: pos,
      video_id: item.id, scent: item.scent, false_scent: item.falseScent,
      via: via, visit_n: B.visits[pos],
      start_t: L.now(), end_t: null, dwell_ms: null, watched_ms: null, duration_ms: null, prop_watched: null,
      completed: false, outcome: null,
      first_touch_ms: null, n_taps: 0, n_pauses: 0, n_aborted_swipes: 0,
      friction_shown: 0, friction_cancelled: 0,
      end_screen_ms: null, end_decision_ms: null,
      leave_swipe_px: null, leave_swipe_ms: null, leave_swipe_v: null
    };
    const stage = $("#stage");
    B.player = window.createPlayer(item, stage, S.timeScale);
    B.player.load(item);
    B.player.onEnded = onVideoEnded;
    B.patch.duration_ms = item.durationSec * 1000;
    B.state = "playing";
    L.log("patch_start", ctx({ via: via, feed_pos: pos, scent: item.scent, false_scent: item.falseScent }));
    B.player.play();
    updateDebug();
  }

  function closePatch(outcome, extra) {
    const p = B.patch; if (!p) return;
    p.end_t = L.now();
    p.dwell_ms = p.end_t - p.start_t;
    p.watched_ms = B.player.getPosMs();
    p.duration_ms = B.player.getDurMs();
    p.prop_watched = Math.round(1000 * p.watched_ms / p.duration_ms) / 1000;
    p.completed = p.watched_ms >= p.duration_ms - 50;
    p.outcome = outcome;
    if (B.endScreenT !== null) p.end_screen_ms = p.end_t - B.endScreenT;
    Object.assign(p, extra || {});
    L.log("patch_end", ctx({ outcome: outcome, dwell_ms: p.dwell_ms, watched_ms: p.watched_ms }));
    L.addPatch(p);
    B.player.stop();
    clearOverlays();
    B.patch = null; B.endScreenT = null;
  }

  function goNext(outcome, extra) { const pos = B.pos; closePatch(outcome, extra); openPatch(pos + 1, "forward"); }
  function goPrev(extra) { const pos = B.pos; closePatch("swipe_back", extra); openPatch(pos - 1, "back"); }

  // ================= Overlay =================
  function clearOverlays() {
    B.timers.forEach(clearInterval); B.timers = [];
    $("#ov-confirm").classList.add("hidden");
    $("#ov-delay").classList.add("hidden");
    $("#ov-end").classList.add("hidden");
  }

  function onVideoEnded() {
    if (!B || !B.patch) return;
    if (B.state === "friction") {
      clearOverlays();
      L.log("friction_interrupted_by_end", ctx());
    }
    L.log("video_end", ctx());
    const es = C.endScreen[B.def.friction];
    if (!es || !es.enabled) { goNext("end_auto"); return; }
    showEndScreen(es.countdownSec);
  }

  function showEndScreen(sec) {
    B.state = "endscreen";
    B.endScreenT = L.now();
    const ov = $("#ov-end");
    const ring = $("#end-ring-fg");
    const num = $("#end-count");
    const circ = 2 * Math.PI * 54;
    ring.style.strokeDasharray = circ;
    ov.classList.remove("hidden");
    L.log("end_screen_show", ctx({ countdownSec: sec }));
    const startReal = performance.now();
    const total = sec * 1000 / S.timeScale;
    const iv = setInterval(function () {
      const el = performance.now() - startReal;
      const left = Math.max(0, total - el);
      num.textContent = Math.ceil(left * S.timeScale / 1000);
      ring.style.strokeDashoffset = circ * (1 - left / total);
      if (left <= 0) {
        clearInterval(iv);
        L.log("end_screen_timeout", ctx());
        goNext("end_timeout");
      }
    }, 50);
    B.timers.push(iv);
    num.textContent = sec;
    ring.style.strokeDashoffset = 0;
  }

  function onEndClick() {
    if (B.state !== "endscreen") return;
    const d = L.now() - B.endScreenT;
    L.log("end_click", ctx({ decision_ms: d }));
    goNext("end_click", { end_decision_ms: d });
  }

  function showFriction() {
    const f = C.friction[B.def.friction];
    B.patch.friction_shown++;
    B.state = "friction";
    L.log("friction_show", ctx({ frictionType: f.type }));
    if (f.type === "confirm") {
      $("#ov-confirm").classList.remove("hidden");
    } else if (f.type === "delay") {
      const ov = $("#ov-delay"); const num = $("#delay-count");
      ov.classList.remove("hidden");
      const startReal = performance.now(); const total = f.delaySec * 1000 / S.timeScale;
      num.textContent = f.delaySec;
      const iv = setInterval(function () {
        const left = Math.max(0, total - (performance.now() - startReal));
        num.textContent = Math.ceil(left * S.timeScale / 1000);
        if (left <= 0) { clearInterval(iv); L.log("friction_confirm", ctx({ by: "delay_elapsed" })); goNext("swipe_early", Object.assign({ friction_resolved: "delay_elapsed" }, B.pendingLeave || {})); }
      }, 50);
      B.timers.push(iv);
    }
  }

  function frictionConfirm() {
    if (B.state !== "friction") return;
    L.log("friction_confirm", ctx({ by: "tap" }));
    goNext("swipe_early", Object.assign({ friction_resolved: "confirmed" }, B.pendingLeave || {}));
  }
  function frictionCancel() {
    if (B.state !== "friction") return;
    B.patch.friction_cancelled++;
    L.log("friction_cancel", ctx());
    clearOverlays();
    B.state = B.player.isPlaying() ? "playing" : "paused";
  }

  // ================= 手勢 =================
  let G = null;
  function onDown(e) {
    if (!B || B.state === "ended" || B.state === "idle") return;
    if (e.target.closest("button")) return;
    G = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    if (B.patch && B.patch.first_touch_ms === null) {
      B.patch.first_touch_ms = L.now() - B.patch.start_t;
      L.log("first_touch", ctx({ latency_ms: B.patch.first_touch_ms }));
    }
    L.log("touch_start", ctx({ x: Math.round(e.clientX), y: Math.round(e.clientY), input: e.pointerType }));
  }
  function onMove(e) {
    if (!G || e.pointerId !== G.id) return;
    const dy = e.clientY - G.y;
    if (B.state === "playing" || B.state === "paused" || B.state === "endscreen") {
      $("#stage").style.transform = "translateY(" + (dy * 0.35) + "px)";
    }
  }
  function onUp(e) {
    if (!G || e.pointerId !== G.id) return;
    $("#stage").style.transform = "";
    const dx = e.clientX - G.x, dyRaw = e.clientY - G.y;
    const up = -dyRaw;                                // 正值 = 往上滑（下一支）
    const dist = Math.abs(dyRaw), dur = performance.now() - G.t;
    const v = dur > 0 ? Math.round(1000 * dist / dur) / 1000 : 0; // px/ms
    const g = C.gesture;
    const meta = { dy: Math.round(up), dx: Math.round(dx), dur_ms: Math.round(dur), v_px_ms: v, input: e.pointerType };
    G = null;
    if (!B || !B.patch) return;
    L.log("touch_end", ctx(meta));

    if (dist < g.tapMaxPx && Math.abs(dx) < g.tapMaxPx && dur < g.tapMaxMs) return handleTap(meta);
    if (up >= g.advancePx) return handleSwipe("up", meta);
    if (up <= -g.advancePx) return handleSwipe("down", meta);
    if (dist >= g.abortMinPx) {
      B.patch.n_aborted_swipes++;
      L.log("swipe_aborted", ctx(meta));
    }
  }

  function handleTap(meta) {
    B.patch.n_taps++;
    L.log("tap", ctx(meta));
    if (!C.tapToPause) return;
    if (B.state === "playing") { B.player.pause(); B.state = "paused"; B.patch.n_pauses++; L.log("pause", ctx()); }
    else if (B.state === "paused") { B.player.play(); B.state = "playing"; L.log("resume", ctx()); }
    updateDebug();
  }

  function handleSwipe(dir, meta) {
    L.log("swipe_" + dir, ctx(meta));
    const leave = { leave_swipe_px: meta.dy, leave_swipe_ms: meta.dur_ms, leave_swipe_v: meta.v_px_ms };
    if (dir === "down") {
      if (!C.allowRevisit || B.pos <= 0 || B.state === "friction") return;
      return goPrev(leave);
    }
    if (B.state === "endscreen") {
      leave.end_decision_ms = L.now() - B.endScreenT;
      return goNext("end_swipe", leave);
    }
    if (B.state === "playing" || B.state === "paused") {
      const f = C.friction[B.def.friction];
      if (!f || f.type === "none") return goNext("swipe_early", leave);
      B.pendingLeave = leave;
      return showFriction();
    }
  }

  // 桌機測試用：方向鍵／空白鍵
  function onKey(e) {
    if (!B || !B.patch) return;
    const m = { dy: 0, dx: 0, dur_ms: 0, v_px_ms: 0, input: "key" };
    if (e.key === "ArrowUp" || e.key === "ArrowRight") { m.dy = 999; handleSwipe("up", m); }
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") { m.dy = -999; handleSwipe("down", m); }
    else if (e.key === " ") { handleTap(m); e.preventDefault(); }
  }

  // ================= 時間估計 =================
  function openEstimate() {
    $("#est-val").value = "";
    show("screen-estimate");
    L.log("estimate_show", { block: B.def.name });
  }
  function stepEstimate(d) {
    const el = $("#est-val");
    const v = Math.max(0, (Number(el.value) || 0) + d);
    el.value = v;
  }
  function submitEstimate() {
    const raw = $("#est-val").value.trim();
    if (raw === "" || isNaN(Number(raw))) { $("#est-val").focus(); return; }
    const v = Number(raw);
    L.log("time_estimate", { block: B.def.name, friction: B.def.friction, block_scent: B.def.scent, estimate_min: v });
    const snap = L.snapshot();
    const b = snap.blocks[snap.blocks.length - 1];
    if (b) b.time_estimate_min = v;
    if (S.blockIdx >= S.blocks.length - 1) return finishSession();
    $("#break-msg").textContent = "這一段結束了，請稍等研究人員。";
    show("screen-break");
  }

  // ================= 結束 =================
  function finishSession() {
    L.log("session_end");
    L.finish({ completed: true });
    show("screen-done");
  }

  // 研究者選單：左上角 1.5 秒內點三下
  let cornerTaps = [];
  function onCorner(e) {
    e.stopPropagation();
    const now = performance.now();
    cornerTaps = cornerTaps.filter(function (t) { return now - t < 1500; });
    cornerTaps.push(now);
    if (cornerTaps.length >= 3) { cornerTaps = []; openResearcherMenu(); }
  }
  function openResearcherMenu() {
    if (B && B.player && B.state === "playing") { B.player.pause(); B.state = "paused"; }
    L.log("researcher_menu_open", B ? ctx() : {});
    $("#researcher-menu").classList.remove("hidden");
  }
  function closeResearcherMenu() {
    $("#researcher-menu").classList.add("hidden");
    L.log("researcher_menu_close", B ? ctx() : {});
  }

  // ================= Debug =================
  function updateDebug() {
    if (!DEBUG) return;
    const d = $("#debug");
    d.classList.remove("hidden");
    if (!B || !B.patch) { d.textContent = ""; return; }
    d.textContent = B.def.name + "｜" + B.def.friction + "×" + B.def.scent + "｜" + B.def.set + "｜#" + B.patch.trial + " " + B.patch.video_id +
      "｜scent:" + B.patch.scent + (B.patch.false_scent ? "(false)" : "") + "｜" + B.state;
  }
  if (DEBUG) setInterval(updateDebug, 250);

  // ================= 綁定 =================
  document.addEventListener("DOMContentLoaded", function () {
    initSetup();
    const feed = $("#screen-feed");
    feed.addEventListener("pointerdown", onDown);
    feed.addEventListener("pointermove", onMove);
    feed.addEventListener("pointerup", onUp);
    feed.addEventListener("pointercancel", function () { G = null; $("#stage").style.transform = ""; });
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", function () {
      if (S) L.log("visibility", Object.assign(B ? ctx() : {}, { state: document.visibilityState }));
    });
    $("#btn-intro-go").addEventListener("click", nextBlock);
    $("#btn-break-go").addEventListener("click", nextBlock);
    $("#btn-end-next").addEventListener("click", onEndClick);
    $("#btn-confirm-next").addEventListener("click", frictionConfirm);
    $("#btn-confirm-stay").addEventListener("click", frictionCancel);
    $("#btn-delay-cancel").addEventListener("click", frictionCancel);
    $("#est-minus").addEventListener("click", function () { stepEstimate(-1); });
    $("#est-plus").addEventListener("click", function () { stepEstimate(1); });
    $("#btn-est-ok").addEventListener("click", submitEstimate);
    $("#corner").addEventListener("pointerdown", onCorner);
    $("#rm-close").addEventListener("click", closeResearcherMenu);
    $("#rm-export").addEventListener("click", function () { L.exportData(); });
    $("#rm-endblock").addEventListener("click", function () { closeResearcherMenu(); if (B && B.state !== "ended") endBlock("researcher_skip"); });
    $("#rm-abort").addEventListener("click", function () {
      if (!confirm("中止整個 session？資料會保留並可匯出。")) return;
      if (B && B.patch) closePatch("aborted");
      if (B) clearTimeout(B.blockTimer);
      L.log("session_abort"); L.finish({ completed: false });
      closeResearcherMenu(); show("screen-done");
    });
    $("#btn-done-export").addEventListener("click", function () { L.exportData(); });
    $("#btn-done-home").addEventListener("click", function () { location.reload(); });
  });

  // 測試用掛勾
  window.__exp = { get S() { return S; }, get B() { return B; } };
})();
