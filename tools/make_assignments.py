"""
產生受試者指派表（v1.0 起：2 個 block，4 個序列）。

  序列 = block 順序（零摩擦先／微摩擦先）× 影片組對應（零摩擦用 A 組／用 B 組）
  每 4 人一輪區組隨機化，序列 1–4 在每輪內隨機打亂（亂數種子 SEQ_SEED，可重現）。
  檢查碼 k = sha1("{K_SEED}-{編號}") 前 4 碼；沿用 v0.3 的種子，所以每位受試者的網址不變。

用法：python3 tools/make_assignments.py 24
輸出：貼進 js/config.js 的 assignments，以及 docs/ASSIGNMENTS.md 的表格。
"""
import hashlib, random, sys

K_SEED = 20260927      # 檢查碼種子（不要改，改了網址會變）
SEQ_SEED = 20261007    # 序列指派種子（v1.0）
BASE = "https://81315003e-stack.github.io/shortvideo-foraging-feed/"
LABEL = {"1": "零摩擦(A) → 微摩擦(B)", "2": "微摩擦(B) → 零摩擦(A)",
         "3": "零摩擦(B) → 微摩擦(A)", "4": "微摩擦(A) → 零摩擦(B)"}

def make(n):
    rng = random.Random(SEQ_SEED)
    seqs = []
    while len(seqs) < n:
        r = list(LABEL); rng.shuffle(r); seqs += r
    out = []
    for i in range(n):
        pid = f"P{i+1:02d}"
        k = hashlib.sha1(f"{K_SEED}-{pid}".encode()).hexdigest()[:4]
        out.append((pid, seqs[i], k))
    return out

if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 24
    rows = make(n)
    print("  assignments: {")
    print(",\n".join(f'    "{p}": {{ seq: "{s}", k: "{k}" }}' for p, s, k in rows))
    print("  },\n")
    print("| 編號 | 輪 | 序列 | 順序 | 網址 |\n|---|---|---|---|---|")
    for i, (p, s, k) in enumerate(rows):
        print(f"| {p} | {i//4+1} | {s} | {LABEL[s]} | {BASE}?p={p}&k={k} |")
