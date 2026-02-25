export interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  errors: string;
}
