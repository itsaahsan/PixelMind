import { useRef } from "react";

interface Props {
  label: string;
  confidence: number;
  probability: number;
  gradcam: string;
  originalUrl: string;
}

export default function DownloadReport({ label, confidence, probability, gradcam, originalUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateReport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = "#5C4A3A";
    ctx.font = "bold 24px Arial";
    ctx.fillText("PixelMind Analysis Report", 30, 45);

    ctx.fillStyle = "#A89278";
    ctx.font = "12px Arial";
    ctx.fillText(new Date().toLocaleString(), 30, 65);

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = originalUrl;
    });
    ctx.drawImage(img, 30, 85, 300, 300);

    const gradImg = new Image();
    gradImg.src = `data:image/png;base64,${gradcam}`;
    await new Promise<void>((resolve) => {
      gradImg.onload = () => resolve();
    });
    ctx.drawImage(gradImg, 350, 85, 300, 300);

    ctx.fillStyle = "#5C4A3A";
    ctx.font = "bold 18px Arial";
    ctx.fillText("Diagnosis", 30, 420);

    ctx.fillStyle = label === "PNEUMONIA" ? "#C62828" : "#2E7D32";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`${label} (${confidence}% confidence)`, 30, 445);

    ctx.fillStyle = "#5C4A3A";
    ctx.font = "14px Arial";
    ctx.fillText(`Pneumonia Probability: ${probability}%`, 30, 475);
    ctx.fillText(`Normal Probability: ${(100 - probability).toFixed(1)}%`, 30, 495);

    ctx.fillStyle = "#A89278";
    ctx.font = "11px Arial";
    ctx.fillText("Model: ResNet-50 (Transfer Learning) | Grad-CAM: layer4[-1]", 30, 530);
    ctx.fillText("Disclaimer: This is an AI-assisted analysis. Please consult a medical professional.", 30, 550);

    const link = document.createElement("a");
    link.download = `pixelmind-report-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={generateReport}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
        style={{ backgroundColor: '#7A6350', color: '#FAF8F5' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Report
      </button>
    </>
  );
}
