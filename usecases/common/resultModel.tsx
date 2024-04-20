export interface SuccessResult<T> {
  error?: never;
  data: T;
}

export interface FailResult<T> {
  error: T;
  data?: never;
}

export type Result<T, K> = SuccessResult<T> | FailResult<K>;

export interface APIError extends Error {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export type APIResult<T> = Result<T, APIError>;
