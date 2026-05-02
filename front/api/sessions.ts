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

export async function deleteSession(id: string): Promise<void> {
  await axiosInstance.delete("/session", {
    data: { session_id: id },
  });
}

interface NewSessionResponse {
  session_id: string;
}

export async function createSession(): Promise<NewSessionResponse> {
  const response = await axiosInstance.get<NewSessionResponse>("/new-session");
  return response.data;
}
