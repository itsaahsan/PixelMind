interface Props {
  label: string;
  confidence: number;
}

export default function ResultCard({ label, confidence }: Props) {
  const isPneumonia = label === "PNEUMONIA";

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ border: "1px solid #DDD1C0", backgroundColor: "#FAF8F5" }}
    >
      <div
        className="flex items-center gap-3 p-3 rounded-lg"
        style={
          isPneumonia
            ? { backgroundColor: "#FDEAEA", border: "1px solid #F5C6C6" }
            : { backgroundColor: "#E8F5E9", border: "1px solid #A5D6A7" }
        }
      >
        <span className="text-2xl">
          {isPneumonia ? "\u26A0\uFE0F" : "\u2705"}
        </span>
        <div>
          <div
            className="text-lg font-bold"
            style={{ color: isPneumonia ? "#9B2C2C" : "#2E7D32" }}
          >
            {label}
          </div>
          <div className="text-sm" style={{ color: "#8B7355" }}>
            Confidence: {confidence}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span style={{ color: "#8B7355" }}>
            {isPneumonia ? "Pneumonia" : "Normal"}
          </span>
          <span className="font-medium" style={{ color: "#5C4A3A" }}>
            {confidence}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "#EDE6DA" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${confidence}%`,
              backgroundColor: isPneumonia ? "#C62828" : "#43A047",
            }}
          />
        </div>
      </div>
    </div>
  );
}
