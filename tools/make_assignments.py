"""
產生受試者指派表與專屬網址。

用法：
    python3 tools/make_assignments.py            # 印出 config.js 用的 assignments 區塊與網址表
    python3 tools/make_assignments.py --n 32     # 產生 32 人（4 輪）

規則：
- 每 8 人一輪，序列 1–8 在每輪內隨機打亂（區組隨機化），招募中途停止時各序列人數最多差 1
- 亂數種子固定，同樣的參數永遠產生同樣的表，可供審查或複製研究
- 檢查碼 k = sha1("{種子}-{編號}") 的前 4 碼，只用來防止網址打錯，不是密碼
- 補位編號（例如 P03R）請手動加進 config.js，沿用被補位者的序列
"""
import argparse
import hashlib
import random

SEED = 20260927
N_SEQ = 8
BASE = "https://81315003e-stack.github.io/shortvideo-foraging-feed/"


def make(n):
    rng = random.Random(SEED)
    rows = []
    rounds = -(-n // N_SEQ)
    for r in range(rounds):
        seqs = list(range(1, N_SEQ + 1))
        rng.shuffle(seqs)
        for i, s in enumerate(seqs):
            idx = r * N_SEQ + i + 1
            if idx > n:
                break
            pid = "P%02d" % idx
            k = hashlib.sha1(f"{SEED}-{pid}".encode()).hexdigest()[:4]
            rows.append((r + 1, pid, s, k))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=24)
    n = ap.parse_args().n
    rows = make(n)
    print("  assignments: {")
    print(",\n".join('    "%s": { seq: "%d", k: "%s" }' % (p, s, k) for _, p, s, k in rows))
    print("  },\n")
    print("| 輪次 | 編號 | 序列 | 專屬網址 |")
    print("|---|---|---|---|")
    for r, p, s, k in rows:
        print(f"| {r} | {p} | {s} | {BASE}?p={p}&k={k} |")


if __name__ == "__main__":
    main()
