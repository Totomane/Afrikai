// src/components/GeneratedDocumentButton.tsx
import React, { useState } from 'react';

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

  const handleGenerate = async () => {
    if (!selectedCountry || selectedRisks.length === 0 || !year) return;

    const countryName = selectedCountry.properties?.NAME || selectedCountry.properties?.name;

    console.log("Pays sélectionné :", countryName);
    console.log("Risques sélectionnés :", selectedRisks);
    console.log("Objectif temps :", year);

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:8000/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: countryName,
          risks: selectedRisks,
          year: year.toString()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur génération rapport');
      }

      const data = await response.json();

      setSuccess(true);
      console.log('Fichier généré:', data.filename);
      // Télécharger le fichier généré
      const link = document.createElement('a');
      link.href = `http://localhost:8000/${data.filename}`;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCountry || selectedRisks.length === 0 &&  selectedRisks.length<=3 || !year) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md p-3 rounded-xl shadow-lg z-50 flex items-center gap-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg shadow"
      >
        {loading ? 'Generating...' : 'Generate Report'}
      </button>
      {success && <span className="text-emerald-400 font-medium">Report generated successfully!</span>}
    </div>
  );
};
