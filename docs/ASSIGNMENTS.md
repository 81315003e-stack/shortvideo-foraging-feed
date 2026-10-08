# 受試者指派與專屬網址

版本：v1.3（2026-10-08）｜對應 proposal v3（2 個 block，序列 1–4 × 播放順序 1–2）

每位受試者有一個專屬網址或代碼。它決定受試者編號、平衡序列與播放順序，研究者不需要、也不能在現場選擇。

## 網址與代碼

```
https://81315003e-stack.github.io/shortvideo-foraging-feed/?p={編號}&k={檢查碼}
```

- `p`：受試者編號（不含姓名等可識別資訊）
- `k`：4 碼檢查碼，只用來防止打錯；`js/config.js` 是公開檔案，所以**不是密碼**
- **從主畫面開啟時**（正式施測的方式，見 README「施測手機設定」），網址帶不進參數。請在設定頁「受試者代碼」輸入 `編號 檢查碼`（例如 `P05 9738`），或貼上整個專屬網址，按「載入」。驗證方式與網址相同，網址會加上 `&via=code` 以便事後辨識
- 測試時可以加上 `&debug=1`（顯示條件、可加速播放）；正式施測不要加

檢查碼沿用 v0.3 的種子，所以每位受試者的網址與先前相同；v1.3 重新指派了**序列與播放順序**。

## 序列

| 序列 | Block 1 | Block 2 |
|---|---|---|
| 1 | 零摩擦（A 組） | 微摩擦（B 組） |
| 2 | 微摩擦（B 組） | 零摩擦（A 組） |
| 3 | 零摩擦（B 組） | 微摩擦（A 組） |
| 4 | 微摩擦（A 組） | 零摩擦（B 組） |

block 順序 × 影片組對應 = 4 個序列。

## 播放順序

每組影片有兩種受限制的播放順序（`js/config.js` 的 `stimulusOrders`，規則見選片標準第 4 節），避免每支影片永遠接在同一支後面。序列 4 種 × 播放順序 2 種 = 8 種組合；受試者人數為 8 的倍數時完全平衡。

## 開啟後的行為

| 情況 | 設定頁顯示 | 可以開始嗎 |
|---|---|---|
| 編號與檢查碼正確 | 綠色框：編號、序列、2 個 block 的順序與播放順序 | 可以 |
| 這台裝置已有同一編號的資料 | 黃色警告：已有幾份、完成幾份 | 勾選「我確認要重新施測」後才可以 |
| 檢查碼錯誤、編號不在指派表 | 紅色錯誤訊息 | 不行 |
| 沒有網址參數 | 紅色訊息與「受試者代碼」輸入欄 | 輸入正確代碼後才可以（`?debug=1` 測試模式除外） |

每份資料的 meta 會記錄：`participant`、`sequence`、`order`、`assignmentSource`（`url` 或 `manual_debug`）、`attempt`（同一編號在這台裝置第幾次施測）、`url`（完整網址，代碼輸入者含 `via=code`）、`debug`、`viewport`。

## 指派方式

- 每 8 人一輪，8 種組合（序列 × 播放順序）在每輪內隨機打亂（區組隨機化）。招募在任何時候停止，各組合人數最多只差 1 人
- 依報到順序給編號：第 1 位報到的受試者用 P01，第 2 位用 P02，以此類推，**不跳號、不依受試者特性挑選**
- 產生方式：`python3 tools/make_assignments.py 24`（指派種子 20261008，檢查碼種子 20260927），同樣的參數永遠產生同一張表；人數加大時前面的指派不會改變

## 退出、排除與補位

受試者中途退出或資料需排除時：

1. 在研究日誌記錄編號、原因、日期
2. 在 `js/config.js` 的 `assignments` 新增補位編號，**沿用同一個序列與播放順序**，例如 P03 退出：
   ```js
   "P03R": { seq: "3", order: "2", k: "自訂4碼" },
   ```
3. 下一位報到的受試者使用補位代碼，之後再繼續原本的順序

## 編號與真實身分的對照

編號與姓名、聯絡方式的對照表**另外保存**在有權限控管的地方（例如紙本或加密檔案），不放進這個 repo。

## 資料在哪裡

網址或代碼只決定「這是誰、用哪個序列與播放順序」，**不會把資料上傳到任何地方**。資料只存在施測手機，每位受試者結束後要在該手機上匯出（見 README「資料」一節）。

## 指派表（P01–P24）

| 編號 | 輪 | 序列 | block 順序 | 播放順序 | 網址 |
|---|---|---|---|---|---|
| P01 | 1 | 2 | 微摩擦(B) → 零摩擦(A) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P01&k=6737 |
| P02 | 1 | 4 | 微摩擦(A) → 零摩擦(B) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P02&k=4346 |
| P03 | 1 | 3 | 零摩擦(B) → 微摩擦(A) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P03&k=29d0 |
| P04 | 1 | 4 | 微摩擦(A) → 零摩擦(B) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P04&k=c1f3 |
| P05 | 1 | 1 | 零摩擦(A) → 微摩擦(B) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P05&k=9738 |
| P06 | 1 | 2 | 微摩擦(B) → 零摩擦(A) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P06&k=c2a3 |
| P07 | 1 | 1 | 零摩擦(A) → 微摩擦(B) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P07&k=8a6f |
| P08 | 1 | 3 | 零摩擦(B) → 微摩擦(A) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P08&k=6a46 |
| P09 | 2 | 4 | 微摩擦(A) → 零摩擦(B) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P09&k=9c15 |
| P10 | 2 | 3 | 零摩擦(B) → 微摩擦(A) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P10&k=d8c9 |
| P11 | 2 | 1 | 零摩擦(A) → 微摩擦(B) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P11&k=2e75 |
| P12 | 2 | 4 | 微摩擦(A) → 零摩擦(B) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P12&k=aa6d |
| P13 | 2 | 1 | 零摩擦(A) → 微摩擦(B) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P13&k=664e |
| P14 | 2 | 3 | 零摩擦(B) → 微摩擦(A) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P14&k=bab1 |
| P15 | 2 | 2 | 微摩擦(B) → 零摩擦(A) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P15&k=f372 |
| P16 | 2 | 2 | 微摩擦(B) → 零摩擦(A) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P16&k=26a6 |
| P17 | 3 | 4 | 微摩擦(A) → 零摩擦(B) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P17&k=aaf3 |
| P18 | 3 | 3 | 零摩擦(B) → 微摩擦(A) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P18&k=1ebb |
| P19 | 3 | 4 | 微摩擦(A) → 零摩擦(B) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P19&k=3143 |
| P20 | 3 | 3 | 零摩擦(B) → 微摩擦(A) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P20&k=26dc |
| P21 | 3 | 1 | 零摩擦(A) → 微摩擦(B) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P21&k=61bb |
| P22 | 3 | 2 | 微摩擦(B) → 零摩擦(A) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P22&k=b278 |
| P23 | 3 | 2 | 微摩擦(B) → 零摩擦(A) | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P23&k=605d |
| P24 | 3 | 1 | 零摩擦(A) → 微摩擦(B) | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P24&k=93cd |
