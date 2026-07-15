import axios, { AxiosInstance } from "axios";

export const normalizeApiBaseUrl = (value?: string) => {
  if (!value) return "";

  return value.replace(/\/+$/, "");
};

export const DEFAULT_BACK_URL =
  normalizeApiBaseUrl(process.env.VUE_APP_BACK_URL) ||
  "https://chatterwily.diegoarturosilvarojas.ovh";
const DEFAULT_CHATTERWILLY_BACK_URL =
  "https://chatbot.diegoarturosilvarojas.ovh";

export const CHATTERWILLY_BACK_URL =
  normalizeApiBaseUrl(process.env.VUE_APP_CHATTERWILLY_BACK_URL) ||
  DEFAULT_CHATTERWILLY_BACK_URL;

export const backendApi: AxiosInstance = axios.create({
  baseURL: `${DEFAULT_BACK_URL}/api`,
});

export const chatterwillyApi: AxiosInstance = axios.create({
  baseURL: CHATTERWILLY_BACK_URL,
});
