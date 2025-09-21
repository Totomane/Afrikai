export interface ReportRequest {
  countries: string[];         // <-- tableau de pays
  risk_categories: string[];   // <-- tableau de risques
  end_date: string;            // YYYY-MM-DD
  format?: "pdf" | "docx";     // optionnel
}

export interface ReportResponse {
  message: string;
  download_url: string;
}
