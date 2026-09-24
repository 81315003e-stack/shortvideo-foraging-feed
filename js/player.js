/*
 * 播放器：同一介面，兩種實作。
 *   PlaceholderPlayer：沒有影片時以色塊與計時模擬播放（prototype）。
 *   VideoPlayer：item.src 有值時使用 <video>。
 * 介面：load(item) / play() / pause() / isPlaying() / getPosMs() / getDurMs() / stop()，
 *       onEnded 為播放結束時呼叫的函式。
 * timeScale 只給開發測試加速用，正式施測請維持 1。
 */
(function () {
  function hueFor(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
    return h;
  }

  function PlaceholderPlayer(stage, timeScale) {
    this.stage = stage; this.timeScale = timeScale || 1;
    this.onEnded = null; this.playing = false; this.acc = 0; this.last = 0; this.raf = null; this.ended = false;
  }
  PlaceholderPlayer.prototype.load = function (item) {
    this.item = item; this.acc = 0; this.ended = false; this.playing = false;
    this.dur = item.durationSec * 1000;
    const h = hueFor(item.id);
    this.stage.innerHTML =
      '<div class="ph" style="background:linear-gradient(160deg,hsl(' + h + ',45%,32%),hsl(' + ((h + 60) % 360) + ',50%,18%))">' +
      '<div class="ph-label">模擬影片</div>' +
      '<div class="ph-id">' + item.id + '</div>' +
      '<div class="ph-time"><span class="ph-pos">0:00</span> / ' + fmt(this.dur) + '</div>' +
      '<div class="ph-paused hidden">暫停</div>' +
      '</div>' +
      '<div class="progress"><div class="progress-fill"></div></div>';
    this.fill = this.stage.querySelector(".progress-fill");
    this.posEl = this.stage.querySelector(".ph-pos");
    this.pauseEl = this.stage.querySelector(".ph-paused");
    this.render();
  };
  PlaceholderPlayer.prototype.tick = function () {
    if (!this.playing) return;
    const now = performance.now();
    this.acc += (now - this.last) * this.timeScale;
    this.last = now;
    if (this.acc >= this.dur) {
      this.acc = this.dur; this.playing = false; this.ended = true; this.render();
      if (this.onEnded) this.onEnded();
      return;
    }
    this.render();
    this.raf = requestAnimationFrame(this.tick.bind(this));
  };
  PlaceholderPlayer.prototype.play = function () {
    if (this.playing || this.ended) return;
    this.playing = true; this.last = performance.now();
    this.pauseEl && this.pauseEl.classList.add("hidden");
    this.raf = requestAnimationFrame(this.tick.bind(this));
  };
  PlaceholderPlayer.prototype.pause = function () {
    if (!this.playing) return;
    this.acc += (performance.now() - this.last) * this.timeScale;
    this.playing = false; cancelAnimationFrame(this.raf);
    this.pauseEl && this.pauseEl.classList.remove("hidden");
    this.render();
  };
  PlaceholderPlayer.prototype.isPlaying = function () { return this.playing; };
  PlaceholderPlayer.prototype.getPosMs = function () {
    let a = this.acc;
    if (this.playing) a += (performance.now() - this.last) * this.timeScale;
    return Math.min(Math.round(a), this.dur);
  };
  PlaceholderPlayer.prototype.getDurMs = function () { return this.dur; };
  PlaceholderPlayer.prototype.stop = function () { this.playing = false; cancelAnimationFrame(this.raf); };
  PlaceholderPlayer.prototype.render = function () {
    const p = this.getPosMs();
    if (this.fill) this.fill.style.width = (100 * p / this.dur) + "%";
    if (this.posEl) this.posEl.textContent = fmt(p);
  };

  function VideoPlayer(stage, timeScale) {
    this.stage = stage; this.timeScale = timeScale || 1; this.onEnded = null;
  }
  VideoPlayer.prototype.load = function (item) {
    const self = this;
    this.item = item;
    this.stage.innerHTML = '<video class="vid" playsinline webkit-playsinline preload="auto"></video>' +
      '<div class="progress"><div class="progress-fill"></div></div>';
    this.v = this.stage.querySelector("video");
    this.fill = this.stage.querySelector(".progress-fill");
    this.v.src = item.src;
    this.v.playbackRate = this.timeScale;
    this.v.addEventListener("ended", function () { if (self.onEnded) self.onEnded(); });
    this.v.addEventListener("timeupdate", function () {
      if (self.v.duration) self.fill.style.width = (100 * self.v.currentTime / self.v.duration) + "%";
    });
  };
  VideoPlayer.prototype.play = function () { const p = this.v.play(); if (p && p.catch) p.catch(function (e) { console.warn(e); }); };
  VideoPlayer.prototype.pause = function () { this.v.pause(); };
  VideoPlayer.prototype.isPlaying = function () { return !this.v.paused && !this.v.ended; };
  VideoPlayer.prototype.getPosMs = function () { return Math.round(this.v.currentTime * 1000); };
  VideoPlayer.prototype.getDurMs = function () {
    return this.v.duration ? Math.round(this.v.duration * 1000) : this.item.durationSec * 1000;
  };
  VideoPlayer.prototype.stop = function () { if (this.v) { this.v.pause(); this.v.removeAttribute("src"); this.v.load(); } };

  function fmt(ms) {
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  window.createPlayer = function (item, stage, timeScale) {
    return item.src ? new VideoPlayer(stage, timeScale) : new PlaceholderPlayer(stage, timeScale);
  };
})();
