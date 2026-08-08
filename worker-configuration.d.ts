export interface Env {
  DB: D1Database;
}

export type WorkerEntrypoint = {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};

interface D1Result<T = unknown> {
  success: boolean;
  meta: {
    last_row_id?: number;
    changes?: number;
  };
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = Record<string, any>>(param?: any): Promise<T | null>;
  all<T = Record<string, any>>(): Promise<{ results: T[] }>;
  run<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

declare global {
  const DB: D1Database;
}
