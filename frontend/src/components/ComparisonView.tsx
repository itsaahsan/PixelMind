import { useState, useRef } from "react";

interface Props {
  originalUrl: string;
  gradcam: string | null;
}

export default function ComparisonView({ originalUrl, gradcam }: Props) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const rightSrc = gradcam ? `data:image/png;base64,${gradcam}` : originalUrl;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-xl overflow-hidden cursor-ew-resize select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleMouseUp}
    >
      <img
        src={originalUrl}
        alt="Original"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={rightSrc}
          alt={gradcam ? "Grad-CAM" : "Original"}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${100 / (position / 100)}%`, maxWidth: 'none' }}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-0.5"
        style={{ left: `${position}%`, backgroundColor: '#5C4A3A' }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#FAF8F5', border: '2px solid #5C4A3A' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="#5C4A3A" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>

      <div
        className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium"
        style={{ backgroundColor: '#FAF8F5', color: '#5C4A3A' }}
      >
        Original
      </div>
      <div
        className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium"
        style={{ backgroundColor: '#FAF8F5', color: '#5C4A3A' }}
      >
        Grad-CAM
      </div>
    </div>
  );
}
