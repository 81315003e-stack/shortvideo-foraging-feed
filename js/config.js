/*
 * 實驗設定檔：所有可調參數集中在這裡，改參數不需要動 app.js。
 * 每次正式施測前，請把 version 改成新的值；它會寫進每一份資料的 meta。
 */
window.EXP_CONFIG = {
  version: "1.1.0-prototype",

  // 每個正式 block 的時間預算（秒）。時間到就結束 block，不論看到第幾支。
  // proposal v3：2 個 block（零摩擦、微摩擦），每個 15 分鐘，接近長者平常一次滑短影音的時間，讓沉浸有機會出現。
  blockDurationSec: 900,

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

  // 正式施測必須為 true：受試者需要的影片沒有全部匯入（設定頁「影片」）就不能開始。
  // 測試模式（?debug=1）不受限制，缺的影片以色塊代替。
  requireMedia: true,

  allowRevisit: true,   // 可否往下滑回上一支（re-visiting patch；RQ1 的主要行為之一）
  tapToPause: true,     // 輕點畫面暫停／繼續（仿真實平台）

  // 觸控判定門檻（CSS px / ms）。CSS px 已經過裝置像素比換算，但不同手機的螢幕高度不同；
  // 每份資料的 meta 會記錄施測時的畫面尺寸（viewport），分析時可換算成占螢幕高度的比例。
  // 高齡者手勢差異大，pilot 後請用 events.csv 的 dy 分布校正。
  gesture: {
    advancePx: 80,      // 垂直位移超過此值才算滑動換片
    abortMinPx: 20,     // 介於 abortMinPx 與 advancePx 之間 = 放棄的滑動（猶豫）
    tapMaxPx: 12,       // 位移小於此值且時間短於 tapMaxMs = 輕點
    tapMaxMs: 350,
    edgeGuardPx: 24     // 從螢幕最上或最下這個範圍內開始的手勢，可能是系統手勢（下拉通知、回主畫面），記錄 edge_start
  },

  // 顯示模式檢查：正式施測應從主畫面捷徑（standalone）或全螢幕開啟，避免網址列與導航列忽隱忽現。
  //   warnIfBrowserTab: true → 在一般瀏覽器分頁中開啟時，設定頁顯示警告（不阻擋）
  display: {
    warnIfBrowserTab: true
  },

  // 練習 block：不計時，看完這幾支就結束，資料標記 practice = true。
  practice: {
    enabled: true,
    friction: "zero",
    items: [
      { id: "P01", endType: "closed", durationSec: 60, src: null, cues: [] },
      { id: "P02", endType: "open"  , durationSec: 60, src: null, cues: [] }
    ]
  },

  /*
   * 受試者指派表：每位受試者一個專屬網址 index.html?p={編號}&k={檢查碼}。
   *   由 tools/make_assignments.py 產生：每 4 人一輪，序列 1–4 在每輪內隨機打亂（種子 20261007）。
   *   檢查碼沿用 v0.3 的種子，所以每位受試者的網址與先前相同，只有序列改變。
   *   檢查碼只用來防止網址打錯，不是密碼（這個檔案是公開的）。
   *   受試者退出或資料排除時，新增一個補位編號沿用同一個序列，例如
   *     "P03R": { seq: "4", k: "xxxx" }
   *   編號不可包含姓名等可識別資訊；編號與真實身分的對照表另外保存，不放進 repo。
   */
  assignments: {
    "P01": { seq: "3", k: "6737" },
    "P02": { seq: "1", k: "4346" },
    "P03": { seq: "4", k: "29d0" },
    "P04": { seq: "2", k: "c1f3" },
    "P05": { seq: "2", k: "9738" },
    "P06": { seq: "1", k: "c2a3" },
    "P07": { seq: "4", k: "8a6f" },
    "P08": { seq: "3", k: "6a46" },
    "P09": { seq: "2", k: "9c15" },
    "P10": { seq: "4", k: "d8c9" },
    "P11": { seq: "1", k: "2e75" },
    "P12": { seq: "3", k: "aa6d" },
    "P13": { seq: "3", k: "664e" },
    "P14": { seq: "4", k: "bab1" },
    "P15": { seq: "2", k: "f372" },
    "P16": { seq: "1", k: "26a6" },
    "P17": { seq: "4", k: "aaf3" },
    "P18": { seq: "1", k: "1ebb" },
    "P19": { seq: "3", k: "3143" },
    "P20": { seq: "2", k: "26dc" },
    "P21": { seq: "4", k: "61bb" },
    "P22": { seq: "3", k: "b278" },
    "P23": { seq: "1", k: "605d" },
    "P24": { seq: "2", k: "93cd" }
  },

  /*
   * 平衡設計（proposal v3）：唯一操弄是介面摩擦，2 個 block。
   *   block 順序（零摩擦先／微摩擦先）× 影片組對應（零摩擦用 A 組／用 B 組）= 4 個序列
   *   受試者人數為 4 的倍數時完全平衡（例如 12、16、20 人）
   *   結尾類型（open／closed）不操弄，在兩組影片內各約一半，隨影片自然出現
   */
  sequences: {
    "1": [ { friction: "zero",  set: "A" }, { friction: "micro", set: "B" } ],
    "2": [ { friction: "micro", set: "B" }, { friction: "zero",  set: "A" } ],
    "3": [ { friction: "zero",  set: "B" }, { friction: "micro", set: "A" } ],
    "4": [ { friction: "micro", set: "A" }, { friction: "zero",  set: "B" } ]
  },

  /*
   * 刺激材料：兩組（A、B），每組 45 支 60–180 秒的 AI 微短劇（pilot 可先用 30 支）。
   * 影片不放在網站上：在施測手機的設定頁「影片」匯入（檔名 = id，例如 A01.mp4、P01.mp4），存進本機 IndexedDB。
   * src 保持 null 即可；匯入後介面會自動使用本機影片，並以影片實際長度取代 durationSec。
   * 欄位來源見 docs/CODEBOOK.md：
   *   endType ← end_type（open／closed，兩位編碼者共識後的值）
   *   cues    ← 需要對齊的時間點（選填），例如 [{ t: 12.5, label: "event" }]
   * 目前的長度與結尾類型是 prototype 用的假資料。
   */
  stimulusSets: {
    "A": [
      { id: "A01", endType: "closed", durationSec: 116, src: null, cues: [] },
      { id: "A02", endType: "open" , durationSec: 79, src: null, cues: [] },
      { id: "A03", endType: "open" , durationSec: 71, src: null, cues: [] },
      { id: "A04", endType: "closed", durationSec: 87, src: null, cues: [] },
      { id: "A05", endType: "closed", durationSec: 146, src: null, cues: [] },
      { id: "A06", endType: "closed", durationSec: 112, src: null, cues: [] },
      { id: "A07", endType: "open" , durationSec: 155, src: null, cues: [] },
      { id: "A08", endType: "closed", durationSec: 111, src: null, cues: [] },
      { id: "A09", endType: "open" , durationSec: 90, src: null, cues: [] },
      { id: "A10", endType: "open" , durationSec: 117, src: null, cues: [] },
      { id: "A11", endType: "closed", durationSec: 71, src: null, cues: [] },
      { id: "A12", endType: "closed", durationSec: 170, src: null, cues: [] },
      { id: "A13", endType: "open" , durationSec: 144, src: null, cues: [] },
      { id: "A14", endType: "open" , durationSec: 119, src: null, cues: [] },
      { id: "A15", endType: "open" , durationSec: 67, src: null, cues: [] },
      { id: "A16", endType: "closed", durationSec: 105, src: null, cues: [] },
      { id: "A17", endType: "open" , durationSec: 122, src: null, cues: [] },
      { id: "A18", endType: "open" , durationSec: 162, src: null, cues: [] },
      { id: "A19", endType: "closed", durationSec: 137, src: null, cues: [] },
      { id: "A20", endType: "closed", durationSec: 76, src: null, cues: [] },
      { id: "A21", endType: "open" , durationSec: 66, src: null, cues: [] },
      { id: "A22", endType: "closed", durationSec: 75, src: null, cues: [] },
      { id: "A23", endType: "closed", durationSec: 97, src: null, cues: [] },
      { id: "A24", endType: "closed", durationSec: 92, src: null, cues: [] },
      { id: "A25", endType: "open" , durationSec: 81, src: null, cues: [] },
      { id: "A26", endType: "open" , durationSec: 163, src: null, cues: [] },
      { id: "A27", endType: "closed", durationSec: 159, src: null, cues: [] },
      { id: "A28", endType: "open" , durationSec: 127, src: null, cues: [] },
      { id: "A29", endType: "closed", durationSec: 63, src: null, cues: [] },
      { id: "A30", endType: "closed", durationSec: 169, src: null, cues: [] },
      { id: "A31", endType: "closed", durationSec: 70, src: null, cues: [] },
      { id: "A32", endType: "open" , durationSec: 72, src: null, cues: [] },
      { id: "A33", endType: "open" , durationSec: 115, src: null, cues: [] },
      { id: "A34", endType: "open" , durationSec: 83, src: null, cues: [] },
      { id: "A35", endType: "closed", durationSec: 115, src: null, cues: [] },
      { id: "A36", endType: "open" , durationSec: 69, src: null, cues: [] },
      { id: "A37", endType: "closed", durationSec: 172, src: null, cues: [] },
      { id: "A38", endType: "open" , durationSec: 133, src: null, cues: [] },
      { id: "A39", endType: "open" , durationSec: 106, src: null, cues: [] },
      { id: "A40", endType: "open" , durationSec: 155, src: null, cues: [] },
      { id: "A41", endType: "closed", durationSec: 141, src: null, cues: [] },
      { id: "A42", endType: "closed", durationSec: 98, src: null, cues: [] },
      { id: "A43", endType: "open" , durationSec: 77, src: null, cues: [] },
      { id: "A44", endType: "closed", durationSec: 62, src: null, cues: [] },
      { id: "A45", endType: "open" , durationSec: 131, src: null, cues: [] }
    ],
    "B": [
      { id: "B01", endType: "closed", durationSec: 60, src: null, cues: [] },
      { id: "B02", endType: "closed", durationSec: 154, src: null, cues: [] },
      { id: "B03", endType: "open" , durationSec: 137, src: null, cues: [] },
      { id: "B04", endType: "closed", durationSec: 176, src: null, cues: [] },
      { id: "B05", endType: "open" , durationSec: 96, src: null, cues: [] },
      { id: "B06", endType: "closed", durationSec: 65, src: null, cues: [] },
      { id: "B07", endType: "closed", durationSec: 67, src: null, cues: [] },
      { id: "B08", endType: "open" , durationSec: 64, src: null, cues: [] },
      { id: "B09", endType: "closed", durationSec: 61, src: null, cues: [] },
      { id: "B10", endType: "closed", durationSec: 113, src: null, cues: [] },
      { id: "B11", endType: "open" , durationSec: 157, src: null, cues: [] },
      { id: "B12", endType: "open" , durationSec: 78, src: null, cues: [] },
      { id: "B13", endType: "closed", durationSec: 165, src: null, cues: [] },
      { id: "B14", endType: "closed", durationSec: 180, src: null, cues: [] },
      { id: "B15", endType: "closed", durationSec: 162, src: null, cues: [] },
      { id: "B16", endType: "open" , durationSec: 112, src: null, cues: [] },
      { id: "B17", endType: "open" , durationSec: 86, src: null, cues: [] },
      { id: "B18", endType: "closed", durationSec: 154, src: null, cues: [] },
      { id: "B19", endType: "open" , durationSec: 66, src: null, cues: [] },
      { id: "B20", endType: "open" , durationSec: 77, src: null, cues: [] },
      { id: "B21", endType: "closed", durationSec: 166, src: null, cues: [] },
      { id: "B22", endType: "open" , durationSec: 77, src: null, cues: [] },
      { id: "B23", endType: "closed", durationSec: 106, src: null, cues: [] },
      { id: "B24", endType: "closed", durationSec: 144, src: null, cues: [] },
      { id: "B25", endType: "open" , durationSec: 65, src: null, cues: [] },
      { id: "B26", endType: "open" , durationSec: 174, src: null, cues: [] },
      { id: "B27", endType: "closed", durationSec: 82, src: null, cues: [] },
      { id: "B28", endType: "closed", durationSec: 128, src: null, cues: [] },
      { id: "B29", endType: "open" , durationSec: 60, src: null, cues: [] },
      { id: "B30", endType: "open" , durationSec: 178, src: null, cues: [] },
      { id: "B31", endType: "closed", durationSec: 139, src: null, cues: [] },
      { id: "B32", endType: "open" , durationSec: 155, src: null, cues: [] },
      { id: "B33", endType: "closed", durationSec: 149, src: null, cues: [] },
      { id: "B34", endType: "closed", durationSec: 119, src: null, cues: [] },
      { id: "B35", endType: "open" , durationSec: 84, src: null, cues: [] },
      { id: "B36", endType: "closed", durationSec: 91, src: null, cues: [] },
      { id: "B37", endType: "open" , durationSec: 101, src: null, cues: [] },
      { id: "B38", endType: "closed", durationSec: 109, src: null, cues: [] },
      { id: "B39", endType: "open" , durationSec: 176, src: null, cues: [] },
      { id: "B40", endType: "open" , durationSec: 154, src: null, cues: [] },
      { id: "B41", endType: "open" , durationSec: 119, src: null, cues: [] },
      { id: "B42", endType: "closed", durationSec: 113, src: null, cues: [] },
      { id: "B43", endType: "open" , durationSec: 135, src: null, cues: [] },
      { id: "B44", endType: "open" , durationSec: 153, src: null, cues: [] },
      { id: "B45", endType: "closed", durationSec: 137, src: null, cues: [] }
    ]
  }
};
