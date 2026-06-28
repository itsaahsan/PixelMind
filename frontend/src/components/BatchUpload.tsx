import { useCallback, useState, useRef } from "react";
import { classifyImage } from "../api";

interface BatchResult {
  fileName: string;
  label: string;
  confidence: number;
  probability: number;
  gradcam: string | null;
}

interface Props {
  onBatchComplete: (results: BatchResult[]) => void;
}

export default function BatchUpload({ onBatchComplete }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f =>
      f.type === "image/jpeg" || f.type === "image/png"
    );
    if (imageFiles.length === 0) return;

    setBatchLoading(true);
    setProgress({ current: 0, total: imageFiles.length });
    const results: BatchResult[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      setProgress({ current: i + 1, total: imageFiles.length });
      try {
        const data = await classifyImage(imageFiles[i]);
        results.push({ fileName: imageFiles[i].name, ...data });
      } catch {
        results.push({
          fileName: imageFiles[i].name,
          label: "ERROR",
          confidence: 0,
          probability: 0,
          gradcam: "",
        });
      }
    }

    setBatchLoading(false);
    onBatchComplete(results);
  }, [onBatchComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer"
      style={{
        borderColor: isDragging ? '#8B7355' : '#C4B39A',
        backgroundColor: isDragging ? '#EDE6DA' : 'transparent',
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {batchLoading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div
              className="animate-spin w-5 h-5 border-2 rounded-full"
              style={{ borderColor: '#C4B39A', borderTopColor: '#8B7355' }}
            />
            <span className="text-sm" style={{ color: '#5C4A3A' }}>
              Processing {progress.current}/{progress.total}...
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mx-auto max-w-xs" style={{ backgroundColor: '#EDE6DA' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
                backgroundColor: '#7A6350',
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#8B7355' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Drop multiple X-rays or click to batch upload</span>
        </div>
      )}
    </div>
  );
}
