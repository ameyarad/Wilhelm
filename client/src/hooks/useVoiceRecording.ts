import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Check if browser supports MediaRecorder
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media recording not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        
        // Convert to WAV format for better compatibility
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);
        
        // Send to transcription service
        await transcribeAudio(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start recording";
      setError(errorMessage);
      toast({
        title: "Recording Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Processing your audio...",
      });
    }
  }, [isRecording, toast]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTranscript(result.text);
      
      toast({
        title: "Transcription Complete",
        description: "Your audio has been converted to text",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to transcribe audio";
      setError(errorMessage);
      toast({
        title: "Transcription Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

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
