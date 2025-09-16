import React, { useState } from 'react';
import { FileText, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface GenerateDocumentButtonProps {
  selectedCountries: string[];
  selectedRisks: string[];
  timeObjective: number;
  onGenerate?: () => void;
}

interface ReportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  downloadUrl?: string;
}

export const GenerateDocumentButton: React.FC<GenerateDocumentButtonProps> = ({
  selectedCountries,
  selectedRisks,
  timeObjective,
  onGenerate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);

  const isEnabled = selectedCountries.length > 0 && selectedRisks.length > 0 && timeObjective > 0;

  const handleGenerate = async () => {
    if (!isEnabled) return;

    setIsGenerating(true);
    setReportStatus(null);

    try {
      // Call backend API to generate report
      const response = await fetch('http://localhost:8000/api/reports/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countries: selectedCountries,
          risk_categories: selectedRisks,
          start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
          end_date: new Date().toISOString().split('T')[0], // today
          forecast_horizon: timeObjective,
          format: 'pdf'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start report generation');
      }

      const data = await response.json();
      
      setReportStatus({
        id: data.report_id,
        status: 'processing',
        message: 'Report generation started. This may take a few minutes...'
      });

      // Poll for completion
      pollReportStatus(data.report_id);

      if (onGenerate) {
        onGenerate();
      }

    } catch (error) {
      console.error('Error generating report:', error);
      setReportStatus({
        id: '',
        status: 'failed',
        message: 'Failed to generate report. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const pollReportStatus = async (reportId: string) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/reports/${reportId}/`);
        if (!response.ok) {
          throw new Error('Failed to check report status');
        }

        const data = await response.json();
        
        setReportStatus({
          id: reportId,
          status: data.status,
          message: getStatusMessage(data.status),
          downloadUrl: data.status === 'completed' ? `http://localhost:8000/api/reports/${reportId}/download/` : undefined
        });

        if (data.status === 'completed' || data.status === 'failed') {
          return; // Stop polling
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setReportStatus({
            id: reportId,
            status: 'failed',
            message: 'Report generation timed out. Please try again.'
          });
        }

      } catch (error) {
        console.error('Error polling report status:', error);
        setReportStatus({
          id: reportId,
          status: 'failed',
          message: 'Error checking report status.'
        });
      }
    };

    poll();
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Report queued for generation...';
      case 'processing':
        return 'Generating report with AI analysis...';
      case 'completed':
        return 'Report ready for download!';
      case 'failed':
        return 'Report generation failed. Please try again.';
      default:
        return 'Unknown status';
    }
  };

  const handleDownload = () => {
    if (reportStatus?.downloadUrl) {
      window.open(reportStatus.downloadUrl, '_blank');
    }
  };

  const getStatusIcon = () => {
    if (!reportStatus) return null;

    switch (reportStatus.status) {
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={!isEnabled || isGenerating}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isEnabled && !isGenerating
            ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }
        `}
      >
        <FileText className="w-5 h-5" />
        <span>
          {isGenerating ? 'Generating...' : 'Generate Document'}
        </span>
      </button>

      {/* Status Display */}
      {reportStatus && (
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 space-y-2">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-white text-sm font-medium">
              {reportStatus.message}
            </span>
          </div>

          {reportStatus.status === 'completed' && reportStatus.downloadUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          )}
        </div>
      )}

      {/* Requirements Display */}
      {!isEnabled && (
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <p className="text-yellow-400 text-sm font-medium mb-2">Requirements:</p>
          <ul className="text-gray-300 text-xs space-y-1">
            <li className={selectedCountries.length > 0 ? 'text-green-400' : 'text-gray-400'}>
              ✓ Select at least one country
            </li>
            <li className={selectedRisks.length > 0 ? 'text-green-400' : 'text-gray-400'}>
              ✓ Select at least one risk category
            </li>
            <li className={timeObjective > 0 ? 'text-green-400' : 'text-gray-400'}>
              ✓ Set forecast time objective
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};