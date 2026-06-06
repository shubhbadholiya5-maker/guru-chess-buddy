// Lightweight Stockfish wrapper using a Web Worker loading public/stockfish.js
export type EngineLine = { bestmove: string; ponder?: string; evalCp?: number; mate?: number; depth?: number };

export class StockfishEngine {
  private worker: Worker | null = null;
  private ready = false;
  private listeners: Array<(line: string) => void> = [];

  async init(): Promise<void> {
    if (this.worker) return;
    this.worker = new Worker("/stockfish.js");
    this.worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === "string" ? e.data : String(e.data ?? "");
      this.listeners.forEach((l) => l(line));
    };
    await this.send("uci", (l) => l.includes("uciok"));
    await this.send("isready", (l) => l.includes("readyok"));
    this.ready = true;
  }

  private send(cmd: string, until?: (line: string) => boolean): Promise<string[]> {
    return new Promise((resolve) => {
      const collected: string[] = [];
      const handler = (line: string) => {
        collected.push(line);
        if (until && until(line)) {
          this.listeners = this.listeners.filter((l) => l !== handler);
          resolve(collected);
        }
      };
      this.listeners.push(handler);
      this.worker!.postMessage(cmd);
      if (!until) {
        setTimeout(() => {
          this.listeners = this.listeners.filter((l) => l !== handler);
          resolve(collected);
        }, 50);
      }
    });
  }

  setSkillLevel(level: number): void {
    // 0-20
    this.worker?.postMessage(`setoption name Skill Level value ${Math.max(0, Math.min(20, level))}`);
  }

  async bestMove(fen: string, opts: { depth?: number; movetime?: number } = {}): Promise<EngineLine> {
    if (!this.ready) await this.init();
    const limit = opts.movetime ? `movetime ${opts.movetime}` : `depth ${opts.depth ?? 12}`;
    this.worker!.postMessage("ucinewgame");
    this.worker!.postMessage(`position fen ${fen}`);
    const lines = await this.send(`go ${limit}`, (l) => l.startsWith("bestmove"));
    let evalCp: number | undefined;
    let mate: number | undefined;
    let depth: number | undefined;
    for (const l of lines) {
      if (l.startsWith("info")) {
        const dm = l.match(/depth (\d+)/);
        if (dm) depth = Number(dm[1]);
        const cp = l.match(/score cp (-?\d+)/);
        if (cp) { evalCp = Number(cp[1]); mate = undefined; }
        const mt = l.match(/score mate (-?\d+)/);
        if (mt) { mate = Number(mt[1]); evalCp = undefined; }
      }
    }
    const bm = lines.find((l) => l.startsWith("bestmove"))?.split(" ") ?? [];
    return { bestmove: bm[1] ?? "", ponder: bm[3], evalCp, mate, depth };
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
  }
}
