import { useState } from "react";
import { classifyImage } from "./api";
import ResultCard from "./components/ResultCard";
import ModelInfo from "./components/ModelInfo";

interface Result {
  label: string;
  confidence: number;
  probability: number;
  gradcam: string | null;
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setFileName(file.name);
    setOriginalUrl(URL.createObjectURL(file));

    try {
      const data = await classifyImage(file);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Classification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2EEE6" }}>
      <header
        className="border-b"
        style={{ backgroundColor: "#FAF8F5", borderColor: "#DDD1C0" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1
            className="text-2xl font-bold"
            style={{ color: "#5C4A3A" }}
          >
            PixelMind
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B7355" }}>
            Chest X-Ray Pneumonia Classifier
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className="border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer"
          style={{
            borderColor: isDragging ? "#8B7355" : "#C4B39A",
            backgroundColor: isDragging ? "#EDE6DA" : "transparent",
          }}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div
                className="animate-spin w-6 h-6 border-2 rounded-full"
                style={{
                  borderColor: "#C4B39A",
                  borderTopColor: "#8B7355",
                }}
              />
              <span className="text-sm" style={{ color: "#5C4A3A" }}>
                Analyzing...
              </span>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-3">🫁</div>
              <div
                className="text-sm font-medium"
                style={{ color: "#5C4A3A" }}
              >
                Upload Chest X-Ray
              </div>
              <div className="text-xs mt-1" style={{ color: "#A89278" }}>
                JPEG or PNG · Drag & drop or click
              </div>
            </>
          )}
        </div>

        {error && (
          <div
            className="border rounded-xl p-4 text-sm"
            style={{
              backgroundColor: "#FDEAEA",
              borderColor: "#F5C6C6",
              color: "#9B2C2C",
            }}
          >
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <h2
              className="text-lg font-semibold"
              style={{ color: "#5C4A3A" }}
            >
              {fileName}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ResultCard
                label={result.label}
                confidence={result.confidence}
              />
              <div className="space-y-4">
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Uploaded X-ray"
                    className="rounded-xl w-full border"
                    style={{ borderColor: "#DDD1C0" }}
                  />
                )}
                {result.probability > 0 && (
                  <ModelInfo
                    label={result.label}
                    probability={result.probability}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
