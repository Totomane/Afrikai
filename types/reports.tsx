// src/types/report.ts
export interface ReportRequest {
  country: string;
  iso3: string;
  risks: string[];
  year: string;
}

export interface ReportResponse {
  message: string;
  download_url: string;
}
