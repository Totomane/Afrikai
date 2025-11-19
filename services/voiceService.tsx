// src/services/voiceService.ts
const BASE_URL = "http://localhost:8000/voice";

export interface VoiceSession {
  session_id: string;
  active: boolean;
}

export async function startVoiceSession(): Promise<VoiceSession> {
  const response = await fetch(`${BASE_URL}/start-session/`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to start voice session");
  return response.json();
}

export async function processVoiceInput(
  sessionId: string,
  audioBlob: Blob
): Promise<any> {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("audio", audioBlob, "voice_input.wav");

  const response = await fetch(`${BASE_URL}/process-input/`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to process voice input");
  return response.json();
}

export async function endVoiceSession(sessionId: string): Promise<void> {
  await fetch(`${BASE_URL}/end-session/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
}
