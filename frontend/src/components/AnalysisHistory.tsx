import { useState, useEffect } from "react";

interface HistoryItem {
  id: string;
  fileName: string;
  label: string;
  confidence: number;
  timestamp: string;
  gradcam: string;
}

interface Props {
  onSelect: (item: HistoryItem) => void;
  currentId: string | null;
}

export default function AnalysisHistory({ onSelect, currentId }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pixelmind_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("pixelmind_history");
  };

  if (history.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
        style={{ backgroundColor: '#EDE6DA', color: '#5C4A3A' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History ({history.length})
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
          style={{ backgroundColor: '#FAF8F5', border: '1px solid #DDD1C0' }}
        >
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#DDD1C0' }}>
            <span className="text-sm font-medium" style={{ color: '#5C4A3A' }}>Past Analyses</span>
            <button
              onClick={clearHistory}
              className="text-xs px-2 py-1 rounded transition"
              style={{ color: '#9B2C2C' }}
            >
              Clear All
            </button>
          </div>
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => { onSelect(item); setIsOpen(false); }}
              className="w-full text-left p-3 flex items-center gap-3 transition hover:opacity-80"
              style={{
                borderBottom: '1px solid #EDE6DA',
                backgroundColor: currentId === item.id ? '#EDE6DA' : 'transparent',
              }}
            >
              <img
                src={`data:image/png;base64,${item.gradcam}`}
                alt=""
                className="w-10 h-10 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate" style={{ color: '#5C4A3A' }}>{item.fileName}</div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#8B7355' }}>
                  <span style={{ color: item.label === 'PNEUMONIA' ? '#9B2C2C' : '#2E7D32' }}>
                    {item.label}
                  </span>
                  <span>{item.confidence}%</span>
                </div>
              </div>
              <span className="text-xs" style={{ color: '#A89278' }}>
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function addToHistory(item: Omit<HistoryItem, "id" | "timestamp">) {
  const saved = localStorage.getItem("pixelmind_history");
  const history: HistoryItem[] = saved ? JSON.parse(saved) : [];
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  history.unshift(newItem);
  if (history.length > 20) history.pop();
  localStorage.setItem("pixelmind_history", JSON.stringify(history));
}
