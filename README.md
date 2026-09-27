# Short-Video Foraging Feed（短影音瀏覽實驗介面）

高齡者短影音資訊覓食研究（Information Foraging Theory）的實驗介面。以網頁仿製全螢幕直式滑動 feed，記錄每一次觸碰、滑動與每支影片（patch）的離開方式，供 2×2 受試者內設計（介面摩擦 × 開場 scent）與 stimulated recall 訪談使用。

目前是 **prototype**：沒有真實影片，以色塊與計時模擬播放。

## 執行

- 本機：直接用瀏覽器開 `index.html`，或在專案資料夾執行 `python3 -m http.server 8000` 後開 `http://localhost:8000`
- 手機施測：用**受試者專屬網址**開啟，例如 `https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P01&k=6737`。網址決定編號與平衡序列，清單見 `docs/ASSIGNMENTS.md`
- 測試模式：網址加 `?debug=1`，頂端顯示目前影片、scent、狀態，並可設定播放加速；沒有專屬網址時可手動輸入編號與序列
- 桌機測試：方向鍵上／下 = 滑動，空白鍵 = 輕點

## 流程

設定頁（研究者） → 說明 → 練習（2 支，不計時） → Block 1 → 時間估計 → 休息 → Block 2 → … → Block 4 → 時間估計 → 結束與匯出

- 4 個條件各一個 block：零摩擦／微摩擦 × 高 scent／低 scent
- 四組影片：HS-A、HS-B（高 scent）、LS-A、LS-B（低 scent），每組 30 支
- 平衡序列 1–8：Williams 平衡拉丁方格（4 種條件順序）× 影片組對應（α：零摩擦用 A 組；β：對調）。受試者人數為 8 的倍數時完全平衡
- 序列由指派表決定（每 8 人一輪隨機打亂），研究者不在現場選擇
- 每個正式 block 有時間預算（預設 5 分鐘），時間到即結束
- 每個 block 開始時有 300 ms 白色閃光（`sync_flash`），用來和螢幕錄影、攝影機畫面對時
- 研究者選單：左上角 1.5 秒內點三下（匯出、結束 block、中止）

## Patch outcome

| outcome | 定義 | 詮釋 |
|---|---|---|
| `swipe_early` | 未播完就往上滑走（微摩擦下為確認後離開） | 主動離開 |
| `end_click` | 播完，倒數內點「下一支」 | 主動繼續 |
| `end_swipe` | 播完，倒數內往上滑 | 主動繼續 |
| `end_timeout` | 播完，倒數結束未動作，自動播下一支 | 沒有在做決定 |
| `end_auto` | 播完，結束畫面關閉時直接自動播 | （依設定） |
| `swipe_back` | 往下滑回上一支 | re-visit |
| `block_timeout` | block 時間到 | 截尾，分析時排除或另計 |

## 資料

匯出三個檔案（檔名 `P{編號}_seq{序列}_{時間戳}`）：

- `.json`：完整資料（meta、設定快照、blocks、patches、events）
- `_patches.csv`：每支影片一列，主要分析單位
- `_events.csv`：每個事件一列，時間序列分析與回看片段挑選用

### patches.csv 主要欄位

| 欄位 | 說明 |
|---|---|
| `trial` / `feed_pos` / `visit_n` | 第幾個 patch／在 feed 中的位置／第幾次造訪 |
| `block_scent` / `set` | 該 block 的 scent 條件與影片組 |
| `scent` / `false_scent` | 該支影片的刺激編碼（見 `js/config.js`、`docs/CODEBOOK.md`） |
| `dwell_ms` | 停留時間（含暫停與結束畫面） |
| `watched_ms` / `prop_watched` / `completed` | 實際播放長度、觀看比例、是否播完 |
| `first_touch_ms` | 進入 patch 到第一次觸碰（沒碰就是空值） |
| `n_aborted_swipes` | 有位移但未達換片門檻的滑動（猶豫） |
| `n_taps` / `n_pauses` | 輕點、暫停次數 |
| `friction_shown` / `friction_cancelled` | 摩擦提示出現與取消次數 |
| `end_screen_ms` / `end_decision_ms` | 結束畫面停留時間／主動決定的反應時間 |
| `leave_swipe_px` / `leave_swipe_ms` / `leave_swipe_v` | 離開那一下滑動的距離、時間、速度（px/ms） |

### events 共同欄位

`t`（ms，自 session 開始）、`wall`（epoch ms，對時用）、`type`、`block`、`friction`、`trial`、`video_id`、`pos_ms`（影片內位置）

## 設定

所有參數在 `js/config.js`：block 時間、結束畫面（依條件開關與秒數）、摩擦類型（`none` / `confirm` / `delay`）、是否允許回看、觸控門檻、刺激清單。改設定後請更新 `version`，它會寫進每份資料。

放入影片：把檔案放到 `stimuli/`，在 config 的 `src` 填路徑，並填 `cues`（影片內 scent 事件時間點）。

## 資料安全

- 資料只存在施測裝置的瀏覽器（localStorage），不會上傳
- **受試者資料不要 commit 進這個 repo**；`data/` 與匯出檔已列入 `.gitignore`
- 真實影片可能涉及著作權，repo 若公開，`stimuli/` 也不要上傳

## 相關文件

- `docs/DESIGN_NOTES.md`：設計決策紀錄
- `docs/STIMULI_CRITERIA.md`：刺激影片選片標準（片庫規模、納入排除、配對、剪輯轉檔、前測）
- `docs/CODEBOOK.md`：刺激影片編碼簿（開場 scent、scent–yield mismatch、信度程序）
- `docs/coding_sheet_template.csv`：編碼表範本（每位編碼者一份，一支影片一列）
- `docs/ASSIGNMENTS.md`：受試者指派表與專屬網址、補位規則
- `tools/make_assignments.py`：產生指派表（固定亂數種子，可重現）
