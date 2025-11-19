// src/types/voice.ts
export interface VoiceSession {
  session_id: string;
  active: boolean;
}

export interface VoiceResponse {
  success: boolean;
  transcribed_text?: string;
  intent?: { name: string };
  response?: string;
  action?: string;
  error?: string;
}

export type VoiceCommandHandler = (transcription: string, action: string) => void;
