import React, { useState, useRef, useEffect } from "react";
import { Mic } from "lucide-react";

/* === 🌊 Siri-like Wave Animation === */
const SiriWave: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let frame = 0;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();

      const mid = canvas.height / 2;
      const width = canvas.width;
      const step = width / 64;
      const time = frame / 10;

      for (let i = 0; i <= 64; i++) {
        const x = i * step;
        const amplitude = 15 + Math.sin(time / 5 + i) * 10;
        const frequency = 0.04 + i * 0.01;
        const y =
          mid +
          Math.sin(x * frequency + time + i * 1.5) * amplitude * (1 - i / 80);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#60a5fa";
      ctx.stroke();

      frame++;
    };

    draw();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return <canvas ref={canvasRef} width={220} height={70} className="mt-2" />;
};

/* === 🎤 Main Component === */
interface Props {
  onVoiceResult: (country: string, risk?: string, year?: number) => void;
}

export const VoiceNavigationButton: React.FC<Props> = ({ onVoiceResult }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "conversation" | "done">("idle");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* === 🎧 Play Pre-Recorded Prompts === */
  const playPrompt = async (file: string): Promise<void> => {
    if (!file) return;
    const audioUrl = `http://localhost:8000/static/voicecmd/${file}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setSpeaking(true);

    return new Promise((resolve) => {
      audio.onended = () => {
        setSpeaking(false);
        resolve();
      };
      audio.onerror = () => {
        setSpeaking(false);
        setTranscription("⚠️ Could not load prompt audio.");
        setTimeout(() => setTranscription(null), 3000);
        resolve();
      };
      audio.play();
    });
  };

  /* === 🎙️ Record User Response === */
  const recordAnswer = async (currentSession = sessionId) => {
    if (!currentSession) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "voice_input.webm");

        try {
          const res = await fetch(
            `http://localhost:8000/voice/conversation/${currentSession}/`,
            { method: "POST", body: formData }
          );
          const data = await res.json();
          if (data.transcription)
            setTranscription(`🗣️ ${data.transcription}`);

          if (data.play) await playPrompt(data.play);

          // If final data received → zoom on country
          if (data.data) {
            console.log("✅ Final data:", data.data);
            onVoiceResult(data.data.country, data.data.risk, data.data.year);
            setStage("done");
            return;
          }

          // Retry if flow continues or error
          if (!data.data && !data.play?.includes("error")) {
            setTimeout(() => recordAnswer(currentSession), 400);
          } else if (data.play?.includes("error")) {
            // Play error.mp3 and retry
            await playPrompt("error.mp3");
            setTimeout(() => recordAnswer(currentSession), 400);
          }
        } catch (err) {
          console.error("⚠️ Voice flow failed:", err);
          await playPrompt("error.mp3");
          setTimeout(() => recordAnswer(currentSession), 400);
        } finally {
          setListening(false);
          setTimeout(() => setTranscription(null), 3000);
        }
      };

      mediaRecorderRef.current.start();
      setListening(true);
      setTranscription("🎧 Listening...");
      setTimeout(() => mediaRecorderRef.current?.stop(), 5000);
    } catch (err) {
      console.error("🎙️ Mic error:", err);
      setTranscription("⚠️ Microphone access denied.");
      setListening(false);
      setTimeout(() => setTranscription(null), 3000);
    }
  };

  /* === 🚀 Start Voice Flow === */
  const startVoiceAssistant = async () => {
    try {
      const res = await fetch("http://localhost:8000/voice/conversation/start/");
      const data = await res.json();

      if (data.session_id) setSessionId(data.session_id);
      if (data.next?.play) await playPrompt(data.next.play);

      setStage("conversation");
      recordAnswer(data.session_id);
    } catch (err) {
      console.error("❌ Could not start conversation:", err);
      setTranscription("⚠️ Could not start voice assistant.");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
      <button
        onClick={() =>
          stage === "idle" ? startVoiceAssistant() : recordAnswer()
        }
        disabled={listening || speaking}
        className={`relative transition-all duration-300 backdrop-blur-sm border rounded-full p-3 ${
          speaking
            ? "bg-blue-500/20 border-blue-400"
            : listening
            ? "bg-red-500/20 border-red-400 scale-110 animate-pulse"
            : "bg-white/10 border-white/20 hover:bg-white/20"
        }`}
      >
        <Mic className={`w-5 h-5 ${listening ? "text-red-400" : "text-white"}`} />
      </button>

      {/* 🌊 Siri-style Wave */}
      {speaking && <SiriWave isActive={speaking} />}

      {/* 📝 Live Transcription */}
      {transcription && (
        <div className="mt-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
          <p className="text-white text-xs max-w-64 break-words">
            {transcription}
          </p>
        </div>
      )}
    </div>
  );
};
