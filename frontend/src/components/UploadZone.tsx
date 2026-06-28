import { useCallback, useState } from "react";

interface Props {
  onFileSelect: (file: File) => void;
  loading: boolean;
}

export default function UploadZone({ onFileSelect, loading }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className="border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer"
      style={{
        borderColor: dragOver ? '#8B7355' : '#C4B39A',
        backgroundColor: dragOver ? '#EDE6DA' : '#FAF8F5',
      }}
    >
      {loading ? (
        <div className="space-y-3">
          <div className="animate-spin w-10 h-10 border-4 rounded-full mx-auto" style={{ borderColor: '#C4B39A', borderTopColor: '#8B7355' }} />
          <p style={{ color: '#8B7355' }}>Analyzing X-ray...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-4xl">{"\uD83D\uDCA4"}</div>
          <p className="font-medium" style={{ color: '#5C4A3A' }}>
            Drop a chest X-ray here
          </p>
          <p className="text-sm" style={{ color: '#A89278' }}>or click to browse</p>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            style={{ backgroundColor: '#7A6350', color: '#FAF8F5' }}
          >
            Choose File
          </label>
        </div>
      )}
    </div>
  );
}
