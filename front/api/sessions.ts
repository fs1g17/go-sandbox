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

interface SessionFilesResponse {
  fileMap: Record<string, string>;
}

export async function getSessionFiles(
  sessionId: string,
): Promise<SessionFilesResponse> {
  const response = await axiosInstance.get<SessionFilesResponse>(
    `/session-files`,
    { params: { session_id: sessionId } },
  );
  return response.data;
}

export async function executeCode(
  files: Record<string, string>,
): Promise<void> {
  await axiosInstance.post("/execute", { files });
}

export async function deleteFile(
  sessionId: string,
  name: string,
): Promise<void> {
  await axiosInstance.delete("/file", {
    data: { session_id: sessionId, name },
  });
}
