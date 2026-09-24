/*
 * 實驗設定檔：所有可調參數集中在這裡，改參數不需要動 app.js。
 * 每次正式施測前，請把 version 改成新的值；它會寫進每一份資料的 meta。
 */
window.EXP_CONFIG = {
  version: "0.1.0-prototype",

  // 每個正式 block 的時間預算（秒）。時間到就結束 block，不論看到第幾支。
  blockDurationSec: 600,

  // 影片結束後的「下一支」倒數畫面，可依摩擦條件分開設定。
  //   enabled: false  → 影片結束立即自動播下一支（outcome = end_auto）
  //   enabled: true   → 顯示按鍵與倒數；點擊 = end_click，倒數結束 = end_timeout
  endScreen: {
    zero:  { enabled: true, countdownSec: 10 },
    micro: { enabled: true, countdownSec: 10 }
  },

  // 提早滑走（影片還沒播完）時的摩擦。
  //   type: "none"    → 立即換下一支
  //   type: "confirm" → 跳出「下一支／繼續看」，需多點一下
  //   type: "delay"   → 顯示倒數 delaySec 秒後才換片，可按「取消」留下
  friction: {
    zero:  { type: "none" },
    micro: { type: "confirm", delaySec: 5 }
  },

  allowRevisit: true,   // 可否往下滑回上一支（re-visiting patch）
  tapToPause: true,     // 輕點畫面暫停／繼續（仿真實平台）

  // 觸控判定門檻（px / ms）。高齡者手勢差異大，pilot 後請校正。
  gesture: {
    advancePx: 80,      // 垂直位移超過此值才算滑動換片
    abortMinPx: 20,     // 介於 abortMinPx 與 advancePx 之間 = 放棄的滑動（猶豫）
    tapMaxPx: 12,       // 位移小於此值且時間短於 tapMaxMs = 輕點
    tapMaxMs: 350
  },

  // 練習 block：不計時，看完這幾支就結束，資料標記 practice = true。
  practice: {
    enabled: true,
    friction: "zero",
    items: [
      { id: "P01", scent: "na", falseScent: false, durationSec: 20, src: null, cues: [] },
      { id: "P02", scent: "na", falseScent: false, durationSec: 20, src: null, cues: [] }
    ]
  },

  // 平衡設計：摩擦順序（Z→M / M→Z）× 影片組（A/B）= 4 種排序。
  sequences: {
    "1": [ { friction: "zero",  set: "A" }, { friction: "micro", set: "B" } ],
    "2": [ { friction: "micro", set: "A" }, { friction: "zero",  set: "B" } ],
    "3": [ { friction: "zero",  set: "B" }, { friction: "micro", set: "A" } ],
    "4": [ { friction: "micro", set: "B" }, { friction: "zero",  set: "A" } ]
  },

  /*
   * 刺激材料。src 為 null 時以色塊模擬影片（prototype 用）。
   * 放入真實影片後：src 填相對路徑（例如 "stimuli/A01.mp4"），durationSec 以實際長度為準。
   * cues：影片內 scent 事件的時間點（秒），供離開點對齊分析，例如
   *   [{ t: 2.5, label: "hook" }, { t: 41, label: "conflict_peak" }, { t: 80, label: "reveal" }]
   * falseScent：依客觀判準（劇情詐欺、資訊產出低）預先編碼。
   */
  stimulusSets: {
    A: [
      { id: "A01", scent: "high", falseScent: true,  durationSec: 95,  src: null, cues: [] },
      { id: "A02", scent: "low",  falseScent: false, durationSec: 80,  src: null, cues: [] },
      { id: "A03", scent: "high", falseScent: false, durationSec: 110, src: null, cues: [] },
      { id: "A04", scent: "high", falseScent: true,  durationSec: 70,  src: null, cues: [] },
      { id: "A05", scent: "low",  falseScent: false, durationSec: 100, src: null, cues: [] },
      { id: "A06", scent: "high", falseScent: true,  durationSec: 90,  src: null, cues: [] },
      { id: "A07", scent: "low",  falseScent: false, durationSec: 85,  src: null, cues: [] },
      { id: "A08", scent: "low",  falseScent: false, durationSec: 75,  src: null, cues: [] },
      { id: "A09", scent: "high", falseScent: false, durationSec: 105, src: null, cues: [] },
      { id: "A10", scent: "low",  falseScent: false, durationSec: 95,  src: null, cues: [] },
      { id: "A11", scent: "high", falseScent: true,  durationSec: 80,  src: null, cues: [] },
      { id: "A12", scent: "low",  falseScent: false, durationSec: 90,  src: null, cues: [] }
    ],
    B: [
      { id: "B01", scent: "low",  falseScent: false, durationSec: 90,  src: null, cues: [] },
      { id: "B02", scent: "high", falseScent: true,  durationSec: 85,  src: null, cues: [] },
      { id: "B03", scent: "high", falseScent: false, durationSec: 100, src: null, cues: [] },
      { id: "B04", scent: "low",  falseScent: false, durationSec: 75,  src: null, cues: [] },
      { id: "B05", scent: "high", falseScent: true,  durationSec: 95,  src: null, cues: [] },
      { id: "B06", scent: "low",  falseScent: false, durationSec: 110, src: null, cues: [] },
      { id: "B07", scent: "high", falseScent: true,  durationSec: 70,  src: null, cues: [] },
      { id: "B08", scent: "low",  falseScent: false, durationSec: 80,  src: null, cues: [] },
      { id: "B09", scent: "high", falseScent: false, durationSec: 90,  src: null, cues: [] },
      { id: "B10", scent: "low",  falseScent: false, durationSec: 105, src: null, cues: [] },
      { id: "B11", scent: "high", falseScent: true,  durationSec: 85,  src: null, cues: [] },
      { id: "B12", scent: "low",  falseScent: false, durationSec: 95,  src: null, cues: [] }
    ]
  }
};
