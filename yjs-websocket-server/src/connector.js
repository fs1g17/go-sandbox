import fetch from "node-fetch";

const remoteExecutionUrl =
  process.env.REMOTE_EXECUTION_URL || "http://localhost:8000";

/**
 * @param {string} sessionId
 * @returns {Promise<Record<string, string>>}
 */
export async function fetchSessionFiles(sessionId) {
  const response = await fetch(
    `${remoteExecutionUrl}/session-files?session_id=${sessionId}`,
  );

  if (!response.ok) {
    const data = /** @type {{ error: string }} */ (await response.json());
    throw new Error(data.error);
  }

  const data = /** @type {{ fileMap: Record<string, string> }} */ (
    await response.json()
  );
  return data.fileMap;
}

/**
 *
 * @param {string} sessionId
 * @param {Record<string,string>} fileMap
 * @returns {Promise<void>}
 */
export async function saveSessionFiles(sessionId, fileMap) {
  const response = await fetch(`${remoteExecutionUrl}/session-files`, {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      files: fileMap,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const data = /** @type {{ error: string }} */ (await response.json());
    throw new Error(data.error);
  }
}
