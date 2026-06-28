interface BatchResult {
  fileName: string;
  label: string;
  confidence: number;
  probability: number;
  gradcam: string | null;
}

interface Props {
  results: BatchResult[];
  onClose: () => void;
}

export default function BatchResults({ results, onClose }: Props) {
  const pneumoniaCount = results.filter(r => r.label === "PNEUMONIA").length;
  const normalCount = results.filter(r => r.label === "NORMAL").length;
  const errorCount = results.filter(r => r.label === "ERROR").length;

  const exportCSV = () => {
    const headers = ["File,Label,Confidence,Probability"];
    const rows = results.map(r => `${r.fileName},${r.label},${r.confidence},${r.probability}`);
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pixelmind-batch-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FAF8F5', border: '1px solid #DDD1C0' }}>
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #EDE6DA' }}>
        <div>
          <h3 className="font-semibold" style={{ color: '#5C4A3A' }}>Batch Results</h3>
          <p className="text-xs mt-0.5" style={{ color: '#A89278' }}>{results.length} images analyzed</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={{ backgroundColor: '#EDE6DA', color: '#5C4A3A' }}
          >
            Export CSV
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={{ backgroundColor: '#EDE6DA', color: '#5C4A3A' }}
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex gap-4 p-4" style={{ borderBottom: '1px solid #EDE6DA' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#43A047' }} />
          <span className="text-sm" style={{ color: '#5C4A3A' }}>Normal: {normalCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C62828' }} />
          <span className="text-sm" style={{ color: '#5C4A3A' }}>Pneumonia: {pneumoniaCount}</span>
        </div>
        {errorCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A89278' }} />
            <span className="text-sm" style={{ color: '#5C4A3A' }}>Errors: {errorCount}</span>
          </div>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        {results.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderBottom: '1px solid #EDE6DA' }}
          >
            <img
              src={r.gradcam ? `data:image/png;base64,${r.gradcam}` : ""}
              alt=""
              className="w-8 h-8 rounded object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate" style={{ color: '#5C4A3A' }}>{r.fileName}</div>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{
                backgroundColor: r.label === 'PNEUMONIA' ? '#FDEAEA' : r.label === 'NORMAL' ? '#E8F5E9' : '#EDE6DA',
                color: r.label === 'PNEUMONIA' ? '#9B2C2C' : r.label === 'NORMAL' ? '#2E7D32' : '#8B7355',
              }}
            >
              {r.label}
            </span>
            <span className="text-xs font-medium" style={{ color: '#5C4A3A' }}>{r.confidence}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
