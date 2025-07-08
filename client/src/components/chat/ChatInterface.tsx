import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import MessageBubble from "./MessageBubble";
import { ChatMessage, InsertChatMessage } from "@shared/schema";
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Circle,
  Loader2 
} from "lucide-react";

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const {
    isRecording,
    startRecording,
    stopRecording,
    transcript,
    error: recordingError,
    clearTranscript,
  } = useVoiceRecording();

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/chat/messages'],
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: InsertChatMessage) => {
      const response = await apiRequest("POST", "/api/chat/message", messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      setMessage("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        setError("Unauthorized access. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      setError("Failed to send message. Please try again.");
    },
  });

  // AI report generation mutation
  const generateReportMutation = useMutation({
    mutationFn: async (findings: string) => {
      const response = await apiRequest("POST", "/api/ai/generate-report", { findings });
      return response.json();
    },
    onSuccess: async (result) => {
      // Add AI response with generated report
      await sendMessageMutation.mutateAsync({
        content: `I've analyzed your findings and generated a report:\n\n${result.report}`,
        role: "assistant",
        messageType: "report",
        metadata: {
          templateUsed: result.templateUsed,
          confidence: result.confidence,
          originalFindings: message,
        },
      });
      setIsProcessing(false);
    },
    onError: (error) => {
      setIsProcessing(false);
      if (isUnauthorizedError(error)) {
        setError("Unauthorized access. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      setError("Failed to generate report. Please try again.");
    },
  });

  // Handle voice recording
  useEffect(() => {
    if (transcript && !isRecording) {
      setMessage(prev => prev + (prev ? " " : "") + transcript);
      // Clear the transcript after using it to prevent re-adding deleted text
      clearTranscript();
    }
  }, [transcript, isRecording, clearTranscript]);

  useEffect(() => {
    if (recordingError) {
      setError(recordingError);
    }
  }, [recordingError]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setIsProcessing(true);

    // Send user message
    await sendMessageMutation.mutateAsync({
      content: userMessage,
      role: "user",
      messageType: "text",
    });

    // Generate AI report
    generateReportMutation.mutate(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-nhs-blue mx-auto mb-2" />
          <p className="text-nhs-dark-grey/70">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-nhs-blue rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <div className="flex-1">
              <div className="bg-nhs-light-grey rounded-lg p-4">
                <p className="text-sm text-nhs-dark-grey">
                  Welcome to Wilhelm AI Radiology Agent. I'm ready to help you transcribe findings and generate professional radiology reports. 
                  You can dictate your findings using the microphone or type them directly.
                </p>
              </div>
              <div className="text-xs text-gray-500 mt-2">AI Assistant • Just now</div>
            </div>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => (
            <MessageBubble key={msg.id} message={msg} user={user} />
          ))
        )}
        
        {isProcessing && (
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-nhs-blue rounded-full flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-nhs-light-grey rounded-lg p-4">
                <p className="text-sm text-nhs-dark-grey">
                  Processing your findings and generating report...
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-6 border-t border-gray-200">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your findings here or use voice dictation..."
                className="min-h-[80px] resize-none pr-20"
                disabled={sendMessageMutation.isPending || isProcessing}
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleRecording}
                  className={cn(
                    "p-2 h-8 w-8",
                    isRecording 
                      ? "text-nhs-red hover:text-nhs-red" 
                      : "text-gray-400 hover:text-nhs-blue"
                  )}
                  disabled={sendMessageMutation.isPending || isProcessing}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-8 w-8 text-gray-400 hover:text-nhs-blue"
                  disabled={sendMessageMutation.isPending || isProcessing}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending || isProcessing}
            className="bg-nhs-blue hover:bg-nhs-blue/90 text-white px-6"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Press Enter to send • Shift+Enter for new line</span>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <Circle className="w-2 h-2 mr-1 fill-current" />
                Recording
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="w-2 h-2 fill-nhs-green text-nhs-green" />
            <span>Whisper Turbo Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
