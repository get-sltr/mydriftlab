/**
 * Generic circular (ring) buffer for memory-safe all-night recording.
 * Fixed capacity prevents unbounded memory growth over 8+ hour sessions.
 *
 * Default capacity: 6,000 entries (~10 min at 10Hz, ~24 bytes/entry = ~144KB max)
 */

export class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private count = 0;
  readonly capacity: number;

  constructor(capacity = 6000) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  /** Get the last N entries (most recent first) */
  getLast(n: number): T[] {
    const count = Math.min(n, this.count);
    const result: T[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (this.head - 1 - i + this.capacity) % this.capacity;
      result.push(this.buffer[idx] as T);
    }
    return result;
  }

  /** Get all entries in chronological order (oldest first) */
  getAll(): T[] {
    if (this.count === 0) return [];
    const result: T[] = [];
    const start = this.count < this.capacity ? 0 : this.head;
    for (let i = 0; i < this.count; i++) {
      const idx = (start + i) % this.capacity;
      result.push(this.buffer[idx] as T);
    }
    return result;
  }

  /** Compute average of numeric values extracted by selector */
  average(selector: (item: T) => number): number {
    if (this.count === 0) return 0;
    let sum = 0;
    const start = this.count < this.capacity ? 0 : this.head;
    for (let i = 0; i < this.count; i++) {
      const idx = (start + i) % this.capacity;
      sum += selector(this.buffer[idx] as T);
    }
    return sum / this.count;
  }

  /** Compute percentile (0-100) of numeric values extracted by selector */
  percentile(p: number, selector: (item: T) => number): number {
    if (this.count === 0) return 0;
    const values: number[] = [];
    const start = this.count < this.capacity ? 0 : this.head;
    for (let i = 0; i < this.count; i++) {
      const idx = (start + i) % this.capacity;
      values.push(selector(this.buffer[idx] as T));
    }
    values.sort((a, b) => a - b);
    const rank = (p / 100) * (values.length - 1);
    const lower = Math.floor(rank);
    const upper = Math.ceil(rank);
    if (lower === upper) return values[lower];
    return values[lower] + (values[upper] - values[lower]) * (rank - lower);
  }

  get size(): number {
    return this.count;
  }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.count = 0;
  }
}
