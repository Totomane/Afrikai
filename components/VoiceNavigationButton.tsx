// src/components/VoiceNavigationButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceNavigationButtonProps {
  onVoiceCommand?: (command: string, action: string) => void;
  onTranscription?: (text: string) => void;
}

interface VoiceSession {
  session_id: string;
  active: boolean;
}


export const VoiceNavigationButton: React.FC<VoiceNavigationButtonProps> = ({
  onVoiceCommand,
  onTranscription
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [lastTranscription, setLastTranscription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Start voice session when component mounts
    startVoiceSession();
    
    return () => {
      // End session when component unmounts
      if (session) {
        endVoiceSession();
      }
    };
  }, []);

  const startVoiceSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/voice/start-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to start voice session');
      }

      const data = await response.json();
      setSession({
        session_id: data.session_id,
        active: true
      });

    } catch (error) {
      console.error('Error starting voice session:', error);
      setError('Failed to initialize voice system');
    }
  };

  const endVoiceSession = async () => {
    if (!session) return;

    try {
      await fetch('http://localhost:8000/voice/end-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session.session_id
        })
      });

      setSession(null);
    } catch (error) {
      console.error('Error ending voice session:', error);
    }
  };

  const startListening = async () => {
    if (!session) {
      setError('Voice session not initialized');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioInput(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      setError('');

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isListening && mediaRecorderRef.current?.state === 'recording') {
          stopListening();
        }
      }, 10000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Microphone access denied or not available');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const processAudioInput = async (audioBlob: Blob) => {
    if (!session) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('session_id', session.session_id);
      formData.append('audio', audioBlob, 'voice_input.wav');

      const response = await fetch('http://localhost:8000/voice/process-input/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process voice input');
      }

      const data = await response.json();

      if (data.success) {
        const transcription = data.transcribed_text;
        const intent = data.intent?.name || 'unknown';
        const response_text = data.response || '';

        setLastTranscription(transcription);
        
        // Call callbacks
        if (onTranscription) {
          onTranscription(transcription);
        }
        
        if (onVoiceCommand) {
          onVoiceCommand(transcription, data.action || intent);
        }

        // Speak response if not muted
        if (!isMuted && response_text) {
          speakText(response_text);
        }

        setError('');
      } else {
        setError(data.error || 'Failed to process voice input');
      }

    } catch (error) {
      console.error('Error processing voice input:', error);
      setError('Failed to process voice command');
    } finally {
      setIsProcessing(false);
    }
  };

  const processTextInput = async (text: string) => {
    if (!session || !text.trim()) return;

    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:8000/voice/process-input/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session.session_id,
          text: text
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process text input');
      }

      const data = await response.json();

      if (data.success) {
        const intent = data.intent?.name || 'unknown';
        const response_text = data.response || '';

        setLastTranscription(text);
        
        if (onVoiceCommand) {
          onVoiceCommand(text, data.action || intent);
        }

        // Speak response if not muted
        if (!isMuted && response_text) {
          speakText(response_text);
        }

        setError('');
      } else {
        setError(data.error || 'Failed to process text input');
      }

    } catch (error) {
      console.error('Error processing text input:', error);
      setError('Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Stop any current speech
      speechSynthesis.cancel();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Voice Control Buttons */}
      <div className="flex items-center space-x-2">
        {/* Main Voice Button */}
        <button
          onClick={handleVoiceToggle}
          disabled={isProcessing || !session}
          className={`
            relative p-3 rounded-full transition-all duration-200 shadow-lg
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : isProcessing
              ? 'bg-yellow-500 animate-spin'
              : 'bg-blue-500 hover:bg-blue-600'
            }
            ${!session ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
          `}
          title={isListening ? 'Stop listening' : isProcessing ? 'Processing...' : 'Start voice command'}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
          
          {/* Recording indicator */}
          {isListening && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
          )}
        </button>

        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className={`
            p-2 rounded-full transition-all duration-200
            ${isMuted ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'}
          `}
          title={isMuted ? 'Unmute responses' : 'Mute responses'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Status Display */}
      <div className="text-center">
        {isListening && (
          <p className="text-green-400 text-sm font-medium animate-pulse">
            Listening... (speak now)
          </p>
        )}
        
        {isProcessing && (
          <p className="text-yellow-400 text-sm font-medium">
            Processing voice command...
          </p>
        )}
        
        {error && (
          <p className="text-red-400 text-xs max-w-xs">
            {error}
          </p>
        )}
        
        {lastTranscription && !isProcessing && !error && (
          <p className="text-gray-300 text-xs max-w-xs">
            "{lastTranscription}"
          </p>
        )}
      </div>

      {/* Quick Text Input for Testing */}
      <div className="mt-2">
        <input
          type="text"
          placeholder="Type a command..."
          className="px-3 py-1 bg-black/50 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLInputElement;
              processTextInput(target.value);
              target.value = '';
            }
          }}
        />
      </div>
    </div>
  );
};