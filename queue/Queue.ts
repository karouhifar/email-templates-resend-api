import { isEmpty } from "@/utils/lib";

type Job<T, C> = {
  id: string;
  data: T;
  model: C;
  retries: number;
  maxRetries: number;
};

type JobHandler<T, C> = (data: T, Model: C) => Promise<void>;

export class InMemoryQueue<T, C> {
  private queue: Job<T, C>[] = [];
  private handler: JobHandler<T, C>;
  private isRunning = false;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(
    handler: JobHandler<T, C>,
    options: { maxRetries?: number; retryDelayMs?: number } = {},
  ) {
    this.handler = handler;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 2000;
  }

  enqueue(data: T, model: C): void {
    const job: Job<T, C> = {
      id: crypto.randomUUID(),
      data,
      model,
      retries: 0,
      maxRetries: this.maxRetries,
    };

    this.queue.push(job);
    console.log(
      `[Queue] Job ${job.id} enqueued. Queue size: ${this.queue.length}`,
    );

    if (!this.isRunning) this.process();
  }

  private async process(): Promise<void> {
    this.isRunning = true;

    while (this.queue.length > 0) {
      const job = this.queue[0];
      if (!isEmpty(job) && job)
        try {
          console.log(
            `[Queue] Processing job ${job.id}... (attempt ${job.retries + 1})`,
          );
          await this.handler(job.data, job.model);
          console.log(`[Queue] Job ${job.id} completed ✅`);
          this.queue.shift();
        } catch (error) {
          job.retries++;
          console.error(
            `[Queue] Job ${job.id} failed ❌ (${job.retries}/${job.maxRetries})`,
          );

          if (job.retries >= job.maxRetries) {
            console.error(`[Queue] Job ${job.id} dropped after max retries.`);
            this.queue.shift();
          } else {
            await new Promise((res) => setTimeout(res, this.retryDelayMs));
          }
        }
      else {
        console.warn(`[Queue] Encountered empty job, skipping...`);
        this.queue.shift();
      }
    }

    this.isRunning = false;
  }

  get size(): number {
    return this.queue.length;
  }
}
