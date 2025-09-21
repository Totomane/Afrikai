import React, { useState } from 'react';
import { generateReport } from '../services/reportService';
import { ReportRequest } from '../types/reports';

interface GeneratedDocumentProps {
  selectedCountry: { properties: { NAME?: string; name?: string } } | null;
  selectedRisks: string[];
  year: number;
}

export const GeneratedDocument: React.FC<GeneratedDocumentProps> = ({
  selectedCountry,
  selectedRisks,
  year
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedCountry || selectedRisks.length === 0 || !year) return;

    if (selectedRisks.length > 3) {
      setErrorMessage("You can select a maximum of 3 risks.");
      return;
    }

    const countryName = selectedCountry.properties?.NAME || selectedCountry.properties?.name || '';
    setLoading(true);
    setSuccess(false);
    setErrorMessage(null);

    const data: ReportRequest = {
      country: countryName,
      risks: selectedRisks,
      year: year.toString(),
    };

    console.log("=== Sending report request ===");
    console.log("Payload:", data);

    try {
      const response = await generateReport(data);
      console.log("Report response:", response);
      setSuccess(true);

      // Télécharger le fichier
      const link = document.createElement('a');
      link.href = `http://localhost:8000${response.download_url}`;
      link.download = response.download_url.split('/').pop() || 'report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error: any) {
      console.error('Erreur génération rapport:', error);
      setErrorMessage(error.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCountry || selectedRisks.length === 0 || !year) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md p-3 rounded-xl shadow-lg z-50 flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg shadow"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        {success && <span className="text-emerald-400 font-medium">Report generated successfully!</span>}
      </div>
      {errorMessage && <span className="text-red-400 font-medium">{errorMessage}</span>}
    </div>
  );
};
