import axios from "axios";
import { clientEnv } from "@/clientEnv";

const axiosInstance = axios.create({
  baseURL: clientEnv.API_BASE,
});

interface SessionsResponse {
  session_ids: string[];
}

export async function getSessions(): Promise<SessionsResponse> {
  const response = await axiosInstance.get<SessionsResponse>("/sessions");
  return response.data;
}
