/*
 * 實驗設定檔：所有可調參數集中在這裡，改參數不需要動 app.js。
 * 每次正式施測前，請把 version 改成新的值；它會寫進每一份資料的 meta。
 */
window.EXP_CONFIG = {
  version: "0.3.0-prototype",

  // 每個正式 block 的時間預算（秒）。時間到就結束 block，不論看到第幾支。
  // proposal：4 個 block，每個 5 分鐘。
  blockDurationSec: 300,

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

  /*
   * 受試者指派表：每位受試者一個專屬網址 index.html?p={編號}&k={檢查碼}。
   *   由 tools/make_assignments.py 產生（亂數種子 20260927）：每 8 人一輪，序列 1–8 在每輪內隨機打亂。
   *   檢查碼只用來防止網址打錯，不是密碼（這個檔案是公開的）。
   *   受試者退出或資料排除時，新增一個補位編號沿用同一個序列，例如
   *     "P03R": { seq: "8", k: "xxxx" }
   *   編號不可包含姓名等可識別資訊；編號與真實身分的對照表另外保存，不放進 repo。
   */
  assignments: {
    "P01": { seq: "6", k: "6737" },
    "P02": { seq: "2", k: "4346" },
    "P03": { seq: "7", k: "29d0" },
    "P04": { seq: "5", k: "c1f3" },
    "P05": { seq: "1", k: "9738" },
    "P06": { seq: "3", k: "c2a3" },
    "P07": { seq: "8", k: "8a6f" },
    "P08": { seq: "4", k: "6a46" },
    "P09": { seq: "2", k: "9c15" },
    "P10": { seq: "4", k: "d8c9" },
    "P11": { seq: "5", k: "2e75" },
    "P12": { seq: "8", k: "aa6d" },
    "P13": { seq: "1", k: "664e" },
    "P14": { seq: "6", k: "bab1" },
    "P15": { seq: "3", k: "f372" },
    "P16": { seq: "7", k: "26a6" },
    "P17": { seq: "6", k: "aaf3" },
    "P18": { seq: "5", k: "1ebb" },
    "P19": { seq: "4", k: "3143" },
    "P20": { seq: "2", k: "26dc" },
    "P21": { seq: "1", k: "61bb" },
    "P22": { seq: "7", k: "b278" },
    "P23": { seq: "3", k: "605d" },
    "P24": { seq: "8", k: "93cd" }
  },

  /*
   * 平衡設計：4 個條件（摩擦 × scent）各一個 block。
   *   條件順序：Williams 平衡拉丁方格（4 種順序，每個條件在每個位置出現一次，
   *             且每個條件緊接在其他條件之後各一次，可平衡一階延宕效果）
   *   影片組對應：α（零摩擦用 A 組、微摩擦用 B 組）與 β（對調）
   *   4 種順序 × 2 種對應 = 8 個序列；受試者人數為 8 的倍數時完全平衡（例如 16 人）
   */
  sequences: {
    "1": [ { friction: "zero", scent: "high", set: "HS-A" }, { friction: "zero", scent: "low", set: "LS-A" }, { friction: "micro", scent: "low", set: "LS-B" }, { friction: "micro", scent: "high", set: "HS-B" } ],
    "2": [ { friction: "zero", scent: "low", set: "LS-A" }, { friction: "micro", scent: "high", set: "HS-B" }, { friction: "zero", scent: "high", set: "HS-A" }, { friction: "micro", scent: "low", set: "LS-B" } ],
    "3": [ { friction: "micro", scent: "high", set: "HS-B" }, { friction: "micro", scent: "low", set: "LS-B" }, { friction: "zero", scent: "low", set: "LS-A" }, { friction: "zero", scent: "high", set: "HS-A" } ],
    "4": [ { friction: "micro", scent: "low", set: "LS-B" }, { friction: "zero", scent: "high", set: "HS-A" }, { friction: "micro", scent: "high", set: "HS-B" }, { friction: "zero", scent: "low", set: "LS-A" } ],
    "5": [ { friction: "zero", scent: "high", set: "HS-B" }, { friction: "zero", scent: "low", set: "LS-B" }, { friction: "micro", scent: "low", set: "LS-A" }, { friction: "micro", scent: "high", set: "HS-A" } ],
    "6": [ { friction: "zero", scent: "low", set: "LS-B" }, { friction: "micro", scent: "high", set: "HS-A" }, { friction: "zero", scent: "high", set: "HS-B" }, { friction: "micro", scent: "low", set: "LS-A" } ],
    "7": [ { friction: "micro", scent: "high", set: "HS-A" }, { friction: "micro", scent: "low", set: "LS-A" }, { friction: "zero", scent: "low", set: "LS-B" }, { friction: "zero", scent: "high", set: "HS-B" } ],
    "8": [ { friction: "micro", scent: "low", set: "LS-A" }, { friction: "zero", scent: "high", set: "HS-B" }, { friction: "micro", scent: "high", set: "HS-A" }, { friction: "zero", scent: "low", set: "LS-B" } ]
  },

  /*
   * 刺激材料：四組，每組 30 支（pilot 可先用 20 支）。src 為 null 時以色塊模擬影片。
   * 放入真實影片後：src 填相對路徑（例如 "stimuli/HS-A01.mp4"），durationSec 以實際長度為準。
   * 各欄位的來源見 docs/CODEBOOK.md 的「編碼結果如何進入實驗介面」：
   *   scent      ← scent_class
   *   falseScent ← mismatch（高 scent 組前 8 支固定為 M M F M F M M F，見 docs/STIMULI_CRITERIA.md 第 5 節）
   *   cues       ← hook_onset_s、plot_event_times、yield_collapse_s，例如
   *     [{ t: 2.5, label: "hook" }, { t: 41, label: "event" }, { t: 70, label: "collapse" }]
   * 目前的長度與 mismatch 是 prototype 用的假資料。
   */
  stimulusSets: {
    "HS-A": [
      { id: "HS-A01", scent: "high", falseScent: true , durationSec: 65, src: null, cues: [] },
      { id: "HS-A02", scent: "high", falseScent: true , durationSec: 87, src: null, cues: [] },
      { id: "HS-A03", scent: "high", falseScent: false, durationSec: 88, src: null, cues: [] },
      { id: "HS-A04", scent: "high", falseScent: true , durationSec: 69, src: null, cues: [] },
      { id: "HS-A05", scent: "high", falseScent: false, durationSec: 60, src: null, cues: [] },
      { id: "HS-A06", scent: "high", falseScent: true , durationSec: 61, src: null, cues: [] },
      { id: "HS-A07", scent: "high", falseScent: true , durationSec: 77, src: null, cues: [] },
      { id: "HS-A08", scent: "high", falseScent: false, durationSec: 87, src: null, cues: [] },
      { id: "HS-A09", scent: "high", falseScent: true , durationSec: 85, src: null, cues: [] },
      { id: "HS-A10", scent: "high", falseScent: false, durationSec: 61, src: null, cues: [] },
      { id: "HS-A11", scent: "high", falseScent: true , durationSec: 61, src: null, cues: [] },
      { id: "HS-A12", scent: "high", falseScent: false, durationSec: 83, src: null, cues: [] },
      { id: "HS-A13", scent: "high", falseScent: true , durationSec: 77, src: null, cues: [] },
      { id: "HS-A14", scent: "high", falseScent: false, durationSec: 64, src: null, cues: [] },
      { id: "HS-A15", scent: "high", falseScent: true , durationSec: 86, src: null, cues: [] },
      { id: "HS-A16", scent: "high", falseScent: false, durationSec: 74, src: null, cues: [] },
      { id: "HS-A17", scent: "high", falseScent: false, durationSec: 80, src: null, cues: [] },
      { id: "HS-A18", scent: "high", falseScent: true , durationSec: 82, src: null, cues: [] },
      { id: "HS-A19", scent: "high", falseScent: false, durationSec: 69, src: null, cues: [] },
      { id: "HS-A20", scent: "high", falseScent: false, durationSec: 74, src: null, cues: [] },
      { id: "HS-A21", scent: "high", falseScent: true , durationSec: 81, src: null, cues: [] },
      { id: "HS-A22", scent: "high", falseScent: true , durationSec: 79, src: null, cues: [] },
      { id: "HS-A23", scent: "high", falseScent: false, durationSec: 69, src: null, cues: [] },
      { id: "HS-A24", scent: "high", falseScent: false, durationSec: 86, src: null, cues: [] },
      { id: "HS-A25", scent: "high", falseScent: true , durationSec: 89, src: null, cues: [] },
      { id: "HS-A26", scent: "high", falseScent: false, durationSec: 78, src: null, cues: [] },
      { id: "HS-A27", scent: "high", falseScent: false, durationSec: 79, src: null, cues: [] },
      { id: "HS-A28", scent: "high", falseScent: true , durationSec: 77, src: null, cues: [] },
      { id: "HS-A29", scent: "high", falseScent: false, durationSec: 71, src: null, cues: [] },
      { id: "HS-A30", scent: "high", falseScent: true , durationSec: 67, src: null, cues: [] }
    ],
    "HS-B": [
      { id: "HS-B01", scent: "high", falseScent: true , durationSec: 75, src: null, cues: [] },
      { id: "HS-B02", scent: "high", falseScent: true , durationSec: 70, src: null, cues: [] },
      { id: "HS-B03", scent: "high", falseScent: false, durationSec: 73, src: null, cues: [] },
      { id: "HS-B04", scent: "high", falseScent: true , durationSec: 85, src: null, cues: [] },
      { id: "HS-B05", scent: "high", falseScent: false, durationSec: 68, src: null, cues: [] },
      { id: "HS-B06", scent: "high", falseScent: true , durationSec: 75, src: null, cues: [] },
      { id: "HS-B07", scent: "high", falseScent: true , durationSec: 68, src: null, cues: [] },
      { id: "HS-B08", scent: "high", falseScent: false, durationSec: 65, src: null, cues: [] },
      { id: "HS-B09", scent: "high", falseScent: true , durationSec: 70, src: null, cues: [] },
      { id: "HS-B10", scent: "high", falseScent: false, durationSec: 77, src: null, cues: [] },
      { id: "HS-B11", scent: "high", falseScent: true , durationSec: 64, src: null, cues: [] },
      { id: "HS-B12", scent: "high", falseScent: false, durationSec: 69, src: null, cues: [] },
      { id: "HS-B13", scent: "high", falseScent: true , durationSec: 69, src: null, cues: [] },
      { id: "HS-B14", scent: "high", falseScent: false, durationSec: 72, src: null, cues: [] },
      { id: "HS-B15", scent: "high", falseScent: true , durationSec: 62, src: null, cues: [] },
      { id: "HS-B16", scent: "high", falseScent: false, durationSec: 80, src: null, cues: [] },
      { id: "HS-B17", scent: "high", falseScent: false, durationSec: 85, src: null, cues: [] },
      { id: "HS-B18", scent: "high", falseScent: true , durationSec: 89, src: null, cues: [] },
      { id: "HS-B19", scent: "high", falseScent: false, durationSec: 90, src: null, cues: [] },
      { id: "HS-B20", scent: "high", falseScent: false, durationSec: 89, src: null, cues: [] },
      { id: "HS-B21", scent: "high", falseScent: true , durationSec: 67, src: null, cues: [] },
      { id: "HS-B22", scent: "high", falseScent: true , durationSec: 81, src: null, cues: [] },
      { id: "HS-B23", scent: "high", falseScent: false, durationSec: 89, src: null, cues: [] },
      { id: "HS-B24", scent: "high", falseScent: false, durationSec: 86, src: null, cues: [] },
      { id: "HS-B25", scent: "high", falseScent: true , durationSec: 66, src: null, cues: [] },
      { id: "HS-B26", scent: "high", falseScent: false, durationSec: 74, src: null, cues: [] },
      { id: "HS-B27", scent: "high", falseScent: false, durationSec: 62, src: null, cues: [] },
      { id: "HS-B28", scent: "high", falseScent: true , durationSec: 84, src: null, cues: [] },
      { id: "HS-B29", scent: "high", falseScent: false, durationSec: 65, src: null, cues: [] },
      { id: "HS-B30", scent: "high", falseScent: true , durationSec: 86, src: null, cues: [] }
    ],
    "LS-A": [
      { id: "LS-A01", scent: "low", falseScent: false, durationSec: 68, src: null, cues: [] },
      { id: "LS-A02", scent: "low", falseScent: false, durationSec: 76, src: null, cues: [] },
      { id: "LS-A03", scent: "low", falseScent: false, durationSec: 61, src: null, cues: [] },
      { id: "LS-A04", scent: "low", falseScent: false, durationSec: 89, src: null, cues: [] },
      { id: "LS-A05", scent: "low", falseScent: false, durationSec: 72, src: null, cues: [] },
      { id: "LS-A06", scent: "low", falseScent: false, durationSec: 61, src: null, cues: [] },
      { id: "LS-A07", scent: "low", falseScent: false, durationSec: 84, src: null, cues: [] },
      { id: "LS-A08", scent: "low", falseScent: false, durationSec: 68, src: null, cues: [] },
      { id: "LS-A09", scent: "low", falseScent: false, durationSec: 67, src: null, cues: [] },
      { id: "LS-A10", scent: "low", falseScent: false, durationSec: 74, src: null, cues: [] },
      { id: "LS-A11", scent: "low", falseScent: false, durationSec: 60, src: null, cues: [] },
      { id: "LS-A12", scent: "low", falseScent: false, durationSec: 69, src: null, cues: [] },
      { id: "LS-A13", scent: "low", falseScent: false, durationSec: 79, src: null, cues: [] },
      { id: "LS-A14", scent: "low", falseScent: false, durationSec: 84, src: null, cues: [] },
      { id: "LS-A15", scent: "low", falseScent: false, durationSec: 67, src: null, cues: [] },
      { id: "LS-A16", scent: "low", falseScent: false, durationSec: 67, src: null, cues: [] },
      { id: "LS-A17", scent: "low", falseScent: false, durationSec: 74, src: null, cues: [] },
      { id: "LS-A18", scent: "low", falseScent: false, durationSec: 85, src: null, cues: [] },
      { id: "LS-A19", scent: "low", falseScent: false, durationSec: 62, src: null, cues: [] },
      { id: "LS-A20", scent: "low", falseScent: false, durationSec: 78, src: null, cues: [] },
      { id: "LS-A21", scent: "low", falseScent: false, durationSec: 78, src: null, cues: [] },
      { id: "LS-A22", scent: "low", falseScent: false, durationSec: 76, src: null, cues: [] },
      { id: "LS-A23", scent: "low", falseScent: false, durationSec: 77, src: null, cues: [] },
      { id: "LS-A24", scent: "low", falseScent: false, durationSec: 60, src: null, cues: [] },
      { id: "LS-A25", scent: "low", falseScent: false, durationSec: 66, src: null, cues: [] },
      { id: "LS-A26", scent: "low", falseScent: false, durationSec: 77, src: null, cues: [] },
      { id: "LS-A27", scent: "low", falseScent: false, durationSec: 70, src: null, cues: [] },
      { id: "LS-A28", scent: "low", falseScent: false, durationSec: 78, src: null, cues: [] },
      { id: "LS-A29", scent: "low", falseScent: false, durationSec: 68, src: null, cues: [] },
      { id: "LS-A30", scent: "low", falseScent: false, durationSec: 80, src: null, cues: [] }
    ],
    "LS-B": [
      { id: "LS-B01", scent: "low", falseScent: false, durationSec: 74, src: null, cues: [] },
      { id: "LS-B02", scent: "low", falseScent: false, durationSec: 84, src: null, cues: [] },
      { id: "LS-B03", scent: "low", falseScent: false, durationSec: 65, src: null, cues: [] },
      { id: "LS-B04", scent: "low", falseScent: false, durationSec: 73, src: null, cues: [] },
      { id: "LS-B05", scent: "low", falseScent: false, durationSec: 88, src: null, cues: [] },
      { id: "LS-B06", scent: "low", falseScent: false, durationSec: 62, src: null, cues: [] },
      { id: "LS-B07", scent: "low", falseScent: false, durationSec: 78, src: null, cues: [] },
      { id: "LS-B08", scent: "low", falseScent: false, durationSec: 89, src: null, cues: [] },
      { id: "LS-B09", scent: "low", falseScent: false, durationSec: 79, src: null, cues: [] },
      { id: "LS-B10", scent: "low", falseScent: false, durationSec: 82, src: null, cues: [] },
      { id: "LS-B11", scent: "low", falseScent: false, durationSec: 90, src: null, cues: [] },
      { id: "LS-B12", scent: "low", falseScent: false, durationSec: 63, src: null, cues: [] },
      { id: "LS-B13", scent: "low", falseScent: false, durationSec: 85, src: null, cues: [] },
      { id: "LS-B14", scent: "low", falseScent: false, durationSec: 81, src: null, cues: [] },
      { id: "LS-B15", scent: "low", falseScent: false, durationSec: 66, src: null, cues: [] },
      { id: "LS-B16", scent: "low", falseScent: false, durationSec: 72, src: null, cues: [] },
      { id: "LS-B17", scent: "low", falseScent: false, durationSec: 78, src: null, cues: [] },
      { id: "LS-B18", scent: "low", falseScent: false, durationSec: 66, src: null, cues: [] },
      { id: "LS-B19", scent: "low", falseScent: false, durationSec: 79, src: null, cues: [] },
      { id: "LS-B20", scent: "low", falseScent: false, durationSec: 65, src: null, cues: [] },
      { id: "LS-B21", scent: "low", falseScent: false, durationSec: 69, src: null, cues: [] },
      { id: "LS-B22", scent: "low", falseScent: false, durationSec: 69, src: null, cues: [] },
      { id: "LS-B23", scent: "low", falseScent: false, durationSec: 82, src: null, cues: [] },
      { id: "LS-B24", scent: "low", falseScent: false, durationSec: 74, src: null, cues: [] },
      { id: "LS-B25", scent: "low", falseScent: false, durationSec: 89, src: null, cues: [] },
      { id: "LS-B26", scent: "low", falseScent: false, durationSec: 80, src: null, cues: [] },
      { id: "LS-B27", scent: "low", falseScent: false, durationSec: 60, src: null, cues: [] },
      { id: "LS-B28", scent: "low", falseScent: false, durationSec: 81, src: null, cues: [] },
      { id: "LS-B29", scent: "low", falseScent: false, durationSec: 78, src: null, cues: [] },
      { id: "LS-B30", scent: "low", falseScent: false, durationSec: 79, src: null, cues: [] }
    ]
  }
};
