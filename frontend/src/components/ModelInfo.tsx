interface Props {
  label: string;
  probability: number;
}

export default function ModelInfo({ label, probability }: Props) {
  const isPneumonia = label === "PNEUMONIA";
  const normalProb = isPneumonia ? (1 - probability) * 100 : probability * 100;
  const pneumoniaProb = isPneumonia ? probability * 100 : (1 - probability) * 100;

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#FAF8F5', border: '1px solid #DDD1C0' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#5C4A3A' }}>
        Model Breakdown
      </h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: '#8B7355' }}>NORMAL</span>
            <span className="font-medium" style={{ color: '#5C4A3A' }}>{normalProb.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE6DA' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${normalProb}%`, backgroundColor: '#43A047' }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: '#8B7355' }}>PNEUMONIA</span>
            <span className="font-medium" style={{ color: '#5C4A3A' }}>{pneumoniaProb.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE6DA' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pneumoniaProb}%`, backgroundColor: '#C62828' }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 space-y-2 text-xs" style={{ borderTop: '1px solid #EDE6DA' }}>
        <div className="flex justify-between">
          <span style={{ color: '#A89278' }}>Model</span>
          <span style={{ color: '#5C4A3A' }}>MobileNetV2</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#A89278' }}>Architecture</span>
          <span style={{ color: '#5C4A3A' }}>Transfer Learning</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#A89278' }}>Input Size</span>
          <span style={{ color: '#5C4A3A' }}>224 x 224 px</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#A89278' }}>Grad-CAM Layer</span>
          <span style={{ color: '#5C4A3A' }}>features[-1]</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#A89278' }}>Threshold</span>
          <span style={{ color: '#5C4A3A' }}>0.5 (sigmoid)</span>
        </div>
      </div>
    </div>
  );
}
