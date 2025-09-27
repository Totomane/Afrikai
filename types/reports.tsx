// src/types/report.ts
export interface ReportRequest {
  country: string;
  risks: string[];
  year: string;
}

export interface ReportResponse {
  message: string;
  download_url: string;
}
