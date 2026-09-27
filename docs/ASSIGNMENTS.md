# 受試者指派與專屬網址

每位受試者有一個專屬網址。網址決定受試者編號與平衡序列，研究者不需要、也不能在現場選序列。

## 網址格式

```
https://81315003e-stack.github.io/shortvideo-foraging-feed/?p={編號}&k={檢查碼}
```

- `p`：受試者編號（不含姓名等可識別資訊）
- `k`：4 碼檢查碼，只用來防止網址打錯；`js/config.js` 是公開檔案，所以**不是密碼**
- 測試時可以加上 `&debug=1`（顯示條件、可加速播放）；正式施測不要加

## 開啟網址後的行為

| 情況 | 設定頁顯示 | 可以開始嗎 |
|---|---|---|
| 編號與檢查碼正確 | 綠色框：編號、序列與 4 個 block 的順序 | 可以 |
| 這台裝置已有同一編號的資料 | 黃色警告：已有幾份、完成幾份 | 勾選「我確認要重新施測」後才可以 |
| 檢查碼錯誤 | 紅色錯誤訊息 | 不行 |
| 編號不在指派表 | 紅色錯誤訊息 | 不行 |
| 沒有網址參數 | 紅色錯誤訊息 | 不行（`?debug=1` 測試模式除外） |

每份資料的 meta 會記錄：`participant`、`sequence`、`assignmentSource`（`url` 或 `manual_debug`）、`attempt`（同一編號在這台裝置第幾次施測）、`url`（完整網址）、`debug`。

## 資料在哪裡

網址只決定「這是誰、用哪個序列」，**不會把資料上傳到任何地方**。資料仍然只存在施測手機的瀏覽器裡，每位受試者結束後要在該手機上匯出（見 README「資料」一節）。

## 指派方式

- 每 8 人一輪，序列 1–8 在每輪內隨機打亂（區組隨機化）。招募在任何時候停止，各序列人數最多只差 1 人
- 依報到順序給編號：第 1 位報到的受試者用 P01，第 2 位用 P02，以此類推，**不跳號、不依受試者特性挑選**
- 產生方式：`python3 tools/make_assignments.py`（亂數種子 20260927），同樣的參數永遠產生同一張表

## 退出、排除與補位

受試者中途退出或資料需排除時：

1. 在研究日誌記錄編號、原因、日期
2. 在 `js/config.js` 的 `assignments` 新增補位編號，**沿用同一個序列**，例如 P03 退出：
   ```js
   "P03R": { seq: "7", k: "自訂4碼" },
   ```
3. 下一位報到的受試者使用補位網址，之後再繼續原本的順序

## 編號與真實身分的對照

編號與姓名、聯絡方式的對照表**另外保存**在有權限控管的地方（例如紙本或加密檔案），不放進這個 repo。

## 指派表（P01–P24）

| 輪次 | 編號 | 序列 | 專屬網址 |
|---|---|---|---|
| 1 | P01 | 6 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P01&k=6737 |
| 1 | P02 | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P02&k=4346 |
| 1 | P03 | 7 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P03&k=29d0 |
| 1 | P04 | 5 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P04&k=c1f3 |
| 1 | P05 | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P05&k=9738 |
| 1 | P06 | 3 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P06&k=c2a3 |
| 1 | P07 | 8 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P07&k=8a6f |
| 1 | P08 | 4 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P08&k=6a46 |
| 2 | P09 | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P09&k=9c15 |
| 2 | P10 | 4 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P10&k=d8c9 |
| 2 | P11 | 5 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P11&k=2e75 |
| 2 | P12 | 8 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P12&k=aa6d |
| 2 | P13 | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P13&k=664e |
| 2 | P14 | 6 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P14&k=bab1 |
| 2 | P15 | 3 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P15&k=f372 |
| 2 | P16 | 7 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P16&k=26a6 |
| 3 | P17 | 6 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P17&k=aaf3 |
| 3 | P18 | 5 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P18&k=1ebb |
| 3 | P19 | 4 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P19&k=3143 |
| 3 | P20 | 2 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P20&k=26dc |
| 3 | P21 | 1 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P21&k=61bb |
| 3 | P22 | 7 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P22&k=b278 |
| 3 | P23 | 3 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P23&k=605d |
| 3 | P24 | 8 | https://81315003e-stack.github.io/shortvideo-foraging-feed/?p=P24&k=93cd |

需要更多人時：`python3 tools/make_assignments.py --n 32`，把輸出的 `assignments` 區塊貼回 `js/config.js`（前 24 人不會改變）。
