import { useState } from "react";
import { classifyImage } from "./api";
import UploadZone from "./components/UploadZone";
import ResultCard from "./components/ResultCard";
import XRayViewer from "./components/XRayViewer";
import AnalysisHistory, { addToHistory } from "./components/AnalysisHistory";
import ModelInfo from "./components/ModelInfo";
import BatchUpload from "./components/BatchUpload";
import BatchResults from "./components/BatchResults";
import ComparisonView from "./components/ComparisonView";
import DownloadReport from "./components/DownloadReport";

interface Result {
  label: string;
  confidence: number;
  probability: number;
  gradcam: string;
}

interface HistoryItem {
  id: string;
  fileName: string;
  label: string;
  confidence: number;
  timestamp: string;
  gradcam: string;
}

interface BatchResult {
  fileName: string;
  label: string;
  confidence: number;
  probability: number;
  gradcam: string;
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [showComparison, setShowComparison] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchResult[] | null>(null);
  const [activeView, setActiveView] = useState<"single" | "batch">("single");

  const handleFile = async (file: File) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setFileName(file.name);
    setOriginalUrl(URL.createObjectURL(file));

    try {
      const data = await classifyImage(file);
      setResult(data);
      addToHistory({ fileName: file.name, label: data.label, confidence: data.confidence, gradcam: data.gradcam });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Classification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelect = async (item: HistoryItem) => {
    setResult({ label: item.label, confidence: item.confidence, probability: 0, gradcam: item.gradcam });
    setFileName(item.fileName);
    setOriginalUrl(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2EEE6' }}>
      <header className="border-b" style={{ backgroundColor: '#FAF8F5', borderColor: '#DDD1C0' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#5C4A3A' }}>PixelMind</h1>
              <p className="text-sm mt-0.5" style={{ color: '#8B7355' }}>
                Chest X-Ray Pneumonia Classifier with Grad-CAM
              </p>
            </div>
            <div className="flex items-center gap-3">
              <AnalysisHistory onSelect={handleHistorySelect} currentId={null} />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveView("single")}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: activeView === "single" ? '#5C4A3A' : '#EDE6DA',
                color: activeView === "single" ? '#FAF8F5' : '#5C4A3A',
              }}
            >
              Single Image
            </button>
            <button
              onClick={() => setActiveView("batch")}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: activeView === "batch" ? '#5C4A3A' : '#EDE6DA',
                color: activeView === "batch" ? '#FAF8F5' : '#5C4A3A',
              }}
            >
              Batch Upload
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {activeView === "single" ? (
          <UploadZone onFileSelect={handleFile} loading={loading} />
        ) : (
          <BatchUpload onBatchComplete={setBatchResults} />
        )}

        {error && (
          <div className="border rounded-xl p-4 text-sm" style={{ backgroundColor: '#FDEAEA', borderColor: '#F5C6C6', color: '#9B2C2C' }}>
            {error}
          </div>
        )}

        {batchResults && (
          <BatchResults results={batchResults} onClose={() => setBatchResults(null)} />
        )}

        {result && activeView === "single" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold" style={{ color: '#5C4A3A' }}>{fileName}</h2>
              <DownloadReport
                label={result.label}
                confidence={result.confidence}
                probability={result.probability}
                gradcam={result.gradcam}
                originalUrl={originalUrl || ""}
              />
              {originalUrl && (
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition"
                  style={{ backgroundColor: '#EDE6DA', color: '#5C4A3A' }}
                >
                  {showComparison ? "Side by Side" : "Slider Compare"}
                </button>
              )}
            </div>

            {showComparison && originalUrl ? (
              <ComparisonView originalUrl={originalUrl} gradcam={result.gradcam} />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <ResultCard
                  label={result.label}
                  confidence={result.confidence}
                  gradcam={result.gradcam}
                />
                <div className="space-y-4">
                  {originalUrl && (
                    <XRayViewer originalUrl={originalUrl} gradcam={result.gradcam} />
                  )}
                  {result.probability > 0 && (
                    <ModelInfo
                      label={result.label}
                      confidence={result.confidence}
                      probability={result.probability}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
