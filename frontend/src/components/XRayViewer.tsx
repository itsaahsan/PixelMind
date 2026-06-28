import { useState } from "react";

interface Props {
  originalUrl: string;
  gradcam: string | null;
}

export default function XRayViewer({ originalUrl, gradcam }: Props) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  const hasGradcam = !!gradcam;

  return (
    <div className="space-y-3">
      {hasGradcam && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowHeatmap(false)}
            className="px-3 py-1 rounded text-sm font-medium transition"
            style={!showHeatmap
              ? { backgroundColor: '#5C4A3A', color: '#FAF8F5' }
              : { backgroundColor: '#EDE6DA', color: '#7A6350' }
            }
          >
            Original
          </button>
          <button
            onClick={() => setShowHeatmap(true)}
            className="px-3 py-1 rounded text-sm font-medium transition"
            style={showHeatmap
              ? { backgroundColor: '#5C4A3A', color: '#FAF8F5' }
              : { backgroundColor: '#EDE6DA', color: '#7A6350' }
            }
          >
            Grad-CAM
          </button>
        </div>
      )}
      <img
        src={hasGradcam && showHeatmap ? `data:image/png;base64,${gradcam}` : originalUrl}
        alt={hasGradcam && showHeatmap ? "Grad-CAM overlay" : "Original X-ray"}
        className="rounded-lg w-full"
      />
    </div>
  );
}
