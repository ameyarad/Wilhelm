import { useState, useCallback, useRef } from "react";

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript(""); // Clear any previous transcript
      
      // Check if browser supports MediaRecorder
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media recording not supported in this browser");
      }

      // Stop any existing recording and clean up
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // First, check if we can query permissions
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('Microphone permission state:', result.state);
          
          // If permission was previously denied, prompt user to reset
          if (result.state === 'denied') {
            console.log('Permission previously denied - user needs to manually reset in browser settings');
          }
        } catch (e) {
          console.log('Cannot query microphone permission:', e);
        }
      }
      
      // Log current location for debugging
      console.log('Current location:', {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        href: window.location.href,
        isSecure: window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      });

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      }).catch((err) => {
        console.error('Microphone access error:', err.name, err.message);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error("Microphone permission denied. If you don't see the permission option in your address bar, try: 1) Open browser settings, 2) Search for 'Site Settings' or 'Privacy', 3) Find 'Microphone' permissions, 4) Allow this site to use microphone.");
        } else if (err.name === 'NotFoundError') {
          throw new Error("No microphone found. Please connect a microphone and try again.");
        } else if (err.name === 'NotReadableError') {
          throw new Error("Microphone is being used by another application. Please close other apps using the microphone.");
        } else if (err.name === 'AbortError') {
          throw new Error("Microphone access was aborted. Please try again.");
        } else if (err.name === 'NotSupportedError') {
          throw new Error("Microphone access is not supported in this browser. Please use Chrome, Firefox, or Edge.");
        } else if (err.name === 'SecurityError') {
          throw new Error("Microphone access blocked due to security settings. Please ensure you're using HTTPS.");
        } else {
          throw new Error(`Failed to access microphone: ${err.name} - ${err.message}`);
        }
      });

      // Create fresh MediaRecorder instance for complete isolation
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = []; // Reset chunks array

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        
        // Send to transcription service immediately without audio processing
        await transcribeAudio(audioBlob);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
        
        // Clear the recorder reference
        mediaRecorderRef.current = null;
      };

      mediaRecorder.start(); // Record continuously without chunking
      setIsRecording(true);
      // Recording started successfully
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start recording";
      setError(errorMessage);
      // Recording initialization failed
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Recording stopped, processing audio
    }
  }, [isRecording]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      // Generate unique filename to prevent any caching or context issues
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      formData.append('audio', audioBlob, `recording_${timestamp}_${randomId}.webm`);

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Add cache-busting headers to ensure fresh requests
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Transcription failed:', {
          status: response.status,
          error: errorData
        });
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTranscript(result.text.trim()); // Trim whitespace
      console.log('Transcription successful'); // Transcription completed successfully
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to transcribe audio";
      setError(errorMessage);
      // Transcription failed
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
  };
}
