import axios from "axios";

export const normalizeApiBaseUrl = (value?: string) => {
  if (!value) return "";

  return value.replace(/\/+$/, "");
};

const instance = axios.create({
  baseURL: normalizeApiBaseUrl(process.env.VUE_APP_BACK_URL) || undefined,
});
export default instance;
