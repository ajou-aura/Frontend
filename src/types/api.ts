export type ApiFieldError = {
  code?: string;
  field?: string;
  message?: string;
};

export type ApiEnvelope<T> = {
  status: "success" | "error";
  code: number;
  message?: string;
  data: T;
};
