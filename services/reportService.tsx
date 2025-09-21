// src/services/reportService.ts
import { ReportRequest, ReportResponse } from '../types/reports';

// Récupérer le CSRF token depuis le cookie
export const getCSRFToken = (): string | null => {
  const match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
  return match ? match[2] : null;
};

// Générer le rapport via l'API
export const generateReport = async (data: ReportRequest): Promise<ReportResponse> => {
  console.log("=== Sending report generation request ===");
  console.log("Payload:", data);

  const csrfToken = getCSRFToken();
  console.log("CSRF Token:", csrfToken);

  try {
    const response = await fetch('http://localhost:8000/api/report/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '',
      },
      body: JSON.stringify(data),
      credentials: 'include', // envoie les cookies
    });

    console.log("Response status:", response.status);
    const resData = await response.json();
    console.log("Response data:", resData);

    if (!response.ok) {
      throw new Error('Erreur génération rapport');
    }

    return resData;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
