import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function postWithRetry(url: string, form: FormData, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.post(url, form, { timeout: 60000 });
      return data;
    } catch (err: any) {
      const status = err.response?.status;
      if (status && status >= 400 && status < 500) throw err;
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

export async function classifyImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  return postWithRetry(`${BASE}/api/predict`, form);
}
