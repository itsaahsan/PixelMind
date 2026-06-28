import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function classifyImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await axios.post(`${BASE}/api/predict`, form);
  return data;
}
