// src/components/GenerateMedia.tsx
import React, { useState } from 'react';
import { generateReport } from '../services/reportService';
import { generatePodcast } from '../services/podcastService';
import { ReportRequest } from '../types/reports';

// Préviews
const PDF_PREVIEW = 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg';

interface GeneratedMediaProps {
  selectedCountry: { properties: { NAME?: string; name?: string } } | null;
  selectedRisks: string[];
  year: number;
}

export const GeneratedMedia: React.FC<GeneratedMediaProps> = ({
  selectedCountry,
  selectedRisks,
  year
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);

  // 🔹 Génération du Report
  const handleGenerateReport = async () => {
    if (!selectedCountry || selectedRisks.length === 0 || !year) return;
    if (selectedRisks.length > 3) {
      setErrorMessage("You can select a maximum of 3 risks.");
      return;
    }
    const countryName = selectedCountry.properties?.NAME || selectedCountry.properties?.name || '';
    setLoading(true);
    setErrorMessage(null);

    const data: ReportRequest = {
      country: countryName,
      risks: selectedRisks,
      year: year.toString(),
    };

    try {
      console.log("[Report] Payload:", data);
      const response = await generateReport(data);
      console.log("[Report] Backend response:", response);
      setReportUrl(`http://localhost:8000${response.download_url}`);
    } catch (error: any) {
      console.error('[Report] Error:', error);
      setErrorMessage(error.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Téléchargement du Report
  const handleDownloadReport = () => {
    if (!reportUrl) return;
    const link = document.createElement('a');
    link.href = reportUrl;
    link.download = reportUrl.split('/').pop() || 'report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🔹 Génération du Podcast
  const handleGeneratePodcast = async () => {
    if (!selectedCountry || selectedRisks.length === 0 || !year) return;
    setLoading(true);
    setErrorMessage(null);

    const countryName = selectedCountry.properties?.NAME || selectedCountry.properties?.name || '';
    const data = {
      country: countryName,
      risks: selectedRisks,
      year: year.toString(),
    };

    try {
      console.log("[Podcast] Payload:", data);
      const response = await generatePodcast(data);
      console.log("[Podcast] Backend response:", response);
      setPodcastUrl(`http://localhost:8000${response.podcast_url}`);
    } catch (error: any) {
      console.error('[Podcast] Error:', error);
      setErrorMessage(error.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ajout en bibliothèque (dummy)
  const handleAddToLibrary = (type: string) => {
    console.log(`Add to library: ${type}`);
  };

  if (!selectedCountry || selectedRisks.length === 0 || !year) return null;

  const baseRectStyle =
    "bg-black/70 backdrop-blur-md p-4 rounded-xl shadow-lg z-50 flex flex-col items-center gap-3 w-64 min-h-[220px]";

  return (
    <>
      {/* Report Rectangle - Bottom Left */}
      <div className="fixed bottom-6 left-8" style={{ zIndex: 50 }}>
        <div className={baseRectStyle}>
          <div className="text-lg font-bold text-white mb-1">Report</div>
          <div className="w-full flex justify-center mb-2">
            {!reportUrl ? (
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow w-full mb-2"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            ) : (
              <div
                className="w-24 h-32 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer border-2 border-blue-500"
                onClick={handleDownloadReport}
                title="Download PDF"
              >
                <img src={PDF_PREVIEW} alt="PDF preview" className="w-16 h-16" />
              </div>
            )}
          </div>
          <button
            onClick={() => handleAddToLibrary('report')}
            className="bg-white/20 hover:bg-blue-100 text-white font-medium px-3 py-1 rounded w-full border border-white"
          >
            Add to library
          </button>
        </div>
      </div>

      {/* Podcast Rectangle - Bottom Center */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2" style={{ zIndex: 50 }}>
        <div className={baseRectStyle}>
          <div className="text-lg font-bold text-white mb-1">Podcast</div>
          <div className="w-full flex justify-center mb-2">
            {!podcastUrl ? (
              <button
                onClick={handleGeneratePodcast}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow w-full mb-2"
              >
                {loading ? 'Generating...' : 'Generate Podcast'}
              </button>
            ) : (
              <div
                className="w-24 h-32 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer border-2 border-blue-500"
                onClick={() => {
                  // Download the podcast file
                  if (podcastUrl) {
                    const link = document.createElement('a');
                    link.href = podcastUrl;
                    link.download = podcastUrl.split('/').pop() || 'podcast.mp3';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    console.log('[Podcast] Download triggered:', podcastUrl);
                  }
                  // Open the podcast in a new tab
                  window.open(podcastUrl, '_blank');
                  console.log('[Podcast] Play logo clicked, opening:', podcastUrl);
                }}
                title="Play & Download Podcast"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16 text-blue-400">
                  <circle cx="12" cy="12" r="10" fill="#2563eb" />
                  <polygon points="10,8 16,12 10,16" fill="white" />
                </svg>
              </div>
            )}
          </div>
          <button
            onClick={() => handleAddToLibrary('podcast')}
            className="bg-white/20 hover:bg-blue-100 text-white font-medium px-3 py-1 rounded w-full border border-white"
          >
            Add to library
          </button>
        </div>
      </div>

      {/* Video Rectangle - Bottom Right (disabled) */}
      <div className="fixed bottom-6 right-8" style={{ zIndex: 50 }}>
        <div className={baseRectStyle + ' opacity-60 pointer-events-none'}>
          <div className="text-lg font-bold text-white mb-1">Video</div>
          <div className="w-full flex justify-center mb-2">
            <div className="w-24 h-32 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-300">Coming soon</span>
            </div>
          </div>
          <button
            disabled
            className="bg-white/20 text-white font-medium px-3 py-1 rounded w-full cursor-not-allowed border border-white"
          >
            Add to library
          </button>
        </div>
      </div>
    </>
  );
};
