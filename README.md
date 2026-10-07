# Short-Video Foraging Feed（短影音瀏覽實驗介面）

高齡者觀看 AI 微短劇的資訊覓食研究（Information Foraging Theory）實驗介面。以網頁仿製全螢幕直式滑動 feed，記錄每一次觸碰、滑動與每支影片（patch）的離開方式，供 stimulated recall 訪談與行為分析使用。

**研究設計（proposal v3：*No Ending in Sight*）**：受試者內設計，唯一操弄是介面摩擦（零摩擦／微摩擦），各一個 5 分鐘 block。每支影片的結尾類型（open／closed ending）不操弄，由編碼決定，自然出現在 feed 中；研究問題是故事沒有走到結局就停住時，長者會回訪、延遲離開，還是繼續往下滑。

目前是 **prototype**。影片不放在網站上，施測前在手機的設定頁匯入（見「放入影片」）；測試模式下缺的影片以色塊與計時模擬播放。

## 執行

- 本機：在專案資料夾執行 `python3 -m http.server 8000`，開 `http://localhost:8000`
- 手機施測：見下一節「施測手機設定」
- 測試模式：網址加 `?debug=1`（可與專屬網址併用，例如 `?p=P01&k=6737&debug=1`）。頂端顯示目前影片、結尾類型、狀態與畫面尺寸，可設定播放加速；沒有專屬網址時可手動輸入編號與序列；影片沒匯入也可以開始
- 桌機測試：方向鍵上／下 = 滑動，空白鍵 = 輕點

## 施測手機設定

手機瀏覽器的網址列與底部導航列會占去高度，而且不同手機、不同瀏覽器的行為不同：有些在捲動時會隱藏網址列，有些不會。如果直接在瀏覽器分頁裡施測，同一個介面在不同時刻的可視高度可能不一樣。因此：

1. **固定一支施測手機、一個瀏覽器**。所有受試者用同一台、同一個瀏覽器，尺寸差異就只剩下面兩點要處理
2. **從主畫面開啟**：用瀏覽器開 `https://81315003e-stack.github.io/shortvideo-foraging-feed/`，選「加入主畫面」（Android Chrome：選單 →「加到主畫面」或「安裝應用程式」；iPhone Safari：分享 →「加入主畫面」）。之後**都從主畫面圖示開啟**：Android 會以全螢幕顯示，iPhone 會以獨立 App 顯示，都沒有網址列
3. **受試者代碼**：從主畫面開啟時網址固定，帶不進 `?p=&k=`。設定頁會出現「受試者代碼」欄，輸入編號與檢查碼（例如 `P05 9738`），或貼上整個專屬網址，按「載入」。驗證方式與專屬網址相同
4. **顯示模式檢查**：設定頁上方會顯示目前的顯示模式與畫面尺寸。顯示 `browser`（黃色）代表仍在一般分頁中，正式施測前要改從主畫面開啟
5. **開始時進入全螢幕**：按「開始」時，Android 會再進入全螢幕，隱藏系統導航列；iPhone 不支援，但從主畫面開啟已經沒有網址列
6. **系統手勢**：Android 的手勢導航（從螢幕最下緣往上滑 = 回主畫面）可能和「往上滑換片」衝突。建議施測手機改用三按鈕導航；介面也會記錄從螢幕上下緣 24 px 內開始的手勢（`edge_start`），分析時可另外檢查
7. **影片要在主畫面開啟的狀態下匯入**：iPhone 的主畫面 App 和 Safari 分頁的儲存空間是分開的

介面也會在資料裡記錄畫面狀態，萬一施測中尺寸改變可以查到：

- session 開始與每個 block 開始時記錄 `viewport`（顯示模式、可視寬高、螢幕寬高、裝置像素比、瀏覽器版本）
- 施測中畫面尺寸改變記錄 `viewport_change`；全螢幕進出記錄 `fullscreen_change`
- 每支影片的資料列記錄當下可視高度 `vp_h`，可把滑動距離換算成占螢幕高度的比例
- feed 期間整頁鎖定、不能捲動，所以觀看中途網址列不會被捲出或捲回

## 流程

設定頁（研究者） → 說明 → 練習（2 支，不計時） → Block 1 → 時間估計 → 休息 → Block 2 → 時間估計 → 結束與匯出

- 2 個 block：零摩擦、微摩擦，各 5 分鐘（時間到即結束）
- 兩組影片 A、B，每組 30 支 15–60 秒；每組 open 與 closed 結尾各約一半
- 序列 1–4：block 順序（零摩擦先／微摩擦先）× 影片組對應（零摩擦用 A 組／用 B 組）。受試者人數為 4 的倍數時完全平衡
- 序列由指派表決定（每 4 人一輪隨機打亂），研究者不在現場選擇
- 每個 block 開始時有 300 ms 白色閃光（`sync_flash`），用來和螢幕錄影、攝影機畫面對時
- 研究者選單：左上角 1.5 秒內點三下（匯出、結束 block、中止）

## Patch outcome

| outcome | 定義 |
|---|---|
| `swipe_early` | 未播完就往上滑走（微摩擦下為確認後離開） |
| `end_click` | 播完，倒數內點「下一支」 |
| `end_swipe` | 播完，倒數內往上滑 |
| `end_timeout` | 播完，倒數結束未動作，自動播下一支 |
| `end_auto` | 播完，結束畫面關閉時直接自動播（依設定） |
| `swipe_back` | 往下滑回上一支（回訪 patch） |
| `block_timeout` | block 時間到，截尾，分析時排除或另計 |

`end_timeout` 只描述「等到自動播放」這個行為；受試者當時在想什麼，由回看訪談判斷。

## 資料

匯出三個檔案（檔名 `P{編號}_seq{序列}_{時間戳}`）：

- `.json`：完整資料（meta、設定快照、blocks、patches、events）
- `_patches.csv`：每支影片一列，主要分析單位
- `_events.csv`：每個事件一列，時間序列分析與回看片段挑選用

### patches.csv 主要欄位

| 欄位 | 說明 |
|---|---|
| `trial` / `feed_pos` / `visit_n` | 第幾個 patch／在 feed 中的位置／第幾次造訪（`visit_n` > 1 即回訪） |
| `friction` / `set` | 該 block 的摩擦條件與影片組 |
| `end_type` | 該支影片的結尾類型 `open`／`closed`（見 `docs/CODEBOOK.md`） |
| `dwell_ms` | 停留時間（含暫停與結束畫面） |
| `watched_ms` / `prop_watched` / `completed` | 實際播放長度、觀看比例、是否播完 |
| `first_touch_ms` | 進入 patch 到第一次觸碰（沒碰就是空值） |
| `n_aborted_swipes` | 有位移但未達換片門檻的滑動（猶豫） |
| `n_taps` / `n_pauses` | 輕點、暫停次數 |
| `friction_shown` / `friction_cancelled` | 摩擦提示出現與取消次數 |
| `end_screen_ms` / `end_decision_ms` | 結束畫面停留時間／主動決定的反應時間 |
| `leave_swipe_px` / `leave_swipe_ms` / `leave_swipe_v` | 離開那一下滑動的距離、時間、速度（px/ms） |
| `vp_h` | 進入 patch 時的可視高度（CSS px） |
| `is_placeholder` | 是否為色塊模擬（測試模式缺片時） |

### events 共同欄位

`t`（ms，自 session 開始）、`wall`（epoch ms，對時用）、`type`、`block`、`friction`、`trial`、`video_id`、`pos_ms`（影片內位置）

## 設定

所有參數在 `js/config.js`：block 時間、結束畫面（依條件開關與秒數）、摩擦類型（`none` / `confirm` / `delay`）、是否允許回看、觸控門檻、顯示模式警告、刺激清單。改設定後請更新 `version`，它會寫進每份資料。

### 放入影片

影片只存在施測手機，不放進 repo，也不放在 GitHub Pages。

1. 影片依 `docs/STIMULI_CRITERIA.md` 轉檔，檔名等於 config 的影片編號：`P01.mp4`、`P02.mp4`、`A01.mp4` … `B30.mp4`
2. 把影片複製到施測手機（iPhone：「檔案」App；Android：檔案管理員）
3. **從主畫面開啟**本介面（見「施測手機設定」）
4. 在設定頁「影片」按「匯入影片」，一次選取全部檔案。介面會顯示每組匯入幾支、缺哪些
5. 正式施測時（`requireMedia: true`），受試者需要的影片沒有全部匯入就不能開始

匯入的影片存在瀏覽器的 IndexedDB，換手機、換瀏覽器或清除網站資料後要重新匯入。介面使用影片的實際長度，config 的 `durationSec` 只在缺片時使用。

## 資料安全

- 資料只存在施測裝置的瀏覽器（localStorage），不會上傳
- **受試者資料不要 commit 進這個 repo**；`data/` 與匯出檔已列入 `.gitignore`
- 真實影片可能涉及著作權，**不要上傳到 repo**；只存在施測手機與有權限控管的研究雲端

## 相關文件

- `docs/DESIGN_NOTES.md`：設計決策紀錄
- `docs/STIMULI_CRITERIA.md`：刺激影片選片標準（片庫、納入排除、結尾類型比例、配對、剪輯轉檔）
- `docs/CODEBOOK.md`：刺激影片編碼簿（基本資訊、結尾類型、信度程序）
- `docs/coding_sheet_template.csv`：編碼表範本（每位編碼者一份，一支影片一列）
- `docs/CANDIDATES.md`：候選影片搜尋紀錄與清單
- `docs/ASSIGNMENTS.md`：受試者指派表與專屬網址、補位規則
- `docs/archive/`：先前以開場 scent 為主軸的編碼簿與選片標準（v0.5），留給後續研究
- `tools/make_assignments.py`：產生指派表（固定亂數種子，可重現）
