import axios from "axios";

function resolveBaseUrl() {
  const raw = String(import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  if (!raw) return raw;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

const API = axios.create({
  baseURL: resolveBaseUrl(),
});

export default API;
