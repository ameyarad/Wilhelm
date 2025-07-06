import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";
import { 
  Mic, 
  MicOff, 
  Circle,
  Loader2,
  FileText,
  Brain,
  Copy
} from "lucide-react";

export default function Home() {
  const { user: userData, isAuthenticated, isLoading } = useAuth();
  const user = userData as User;
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    isRecording,
    startRecording,
    stopRecording,
    transcript,
    error: recordingError,
  } = useVoiceRecording();

  // AI report generation mutation
  const generateReportMutation = useMutation({
    mutationFn: async (findings: string) => {
      const response = await apiRequest("POST", "/api/ai/generate-report", { findings });
      return response.json();
    },
    onSuccess: (result) => {
      setGeneratedReport(result.report);
      setIsProcessing(false);
      toast({
        title: "Report Generated",
        description: `Using template: ${result.templateUsed}`,
      });
    },
    onError: (error) => {
      setIsProcessing(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle voice recording
  useEffect(() => {
    if (transcript && !isRecording) {
      setMessage(prev => prev + (prev ? " " : "") + transcript);
    }
  }, [transcript, isRecording]);

  useEffect(() => {
    if (recordingError) {
      toast({
        title: "Recording Error",
        description: recordingError,
        variant: "destructive",
      });
    }
  }, [recordingError, toast]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleGenerateReport = () => {
    if (!message.trim()) {
      toast({
        title: "No Findings",
        description: "Please enter or dictate your findings first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    generateReportMutation.mutate(message.trim());
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(generatedReport);
      toast({
        title: "Copied",
        description: "Report copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy report",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nhs-light-grey flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-nhs-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-nhs-dark-grey">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-nhs-light-grey">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-semibold text-nhs-dark-grey mb-2">
                Welcome back, {(user && user.firstName) || "Doctor"}
              </h1>
              <p className="text-nhs-dark-grey/70">
                Dictate or type your findings to generate professional radiology reports with AI assistance
              </p>
            </div>

            {/* Chat Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-nhs-blue" />
                  <span>AI Report Generator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-nhs-dark-grey">
                      Clinical Findings
                    </label>
                    <div className="flex items-center space-x-2">
                      {isRecording && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Circle className="w-2 h-2 mr-1 fill-current" />
                          Recording
                        </Badge>
                      )}
                      <div className="flex items-center space-x-1 text-xs text-nhs-green">
                        <Circle className="w-2 h-2 fill-current" />
                        <span>Whisper Ready</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your clinical findings here or use voice dictation..."
                      className="min-h-[120px] pr-16"
                      disabled={isProcessing}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleRecording}
                      className={`absolute bottom-3 right-3 p-2 h-8 w-8 ${
                        isRecording 
                          ? "text-nhs-red hover:text-nhs-red" 
                          : "text-gray-400 hover:text-nhs-blue"
                      }`}
                      disabled={isProcessing}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Press the microphone to start dictation or type directly
                  </p>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={!message.trim() || isProcessing}
                  className="w-full bg-nhs-blue hover:bg-nhs-blue/90 text-white"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Report */}
            {generatedReport && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-nhs-green" />
                      <span>Generated Report</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyReport}
                      className="text-nhs-green"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <pre className="whitespace-pre-wrap text-sm text-nhs-dark-grey">
                      {generatedReport}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-nhs-dark-grey mb-4">System Status</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-nhs-dark-grey">Whisper Turbo</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nhs-green rounded-full"></div>
                    <span className="text-xs text-nhs-green">Ready</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-nhs-dark-grey">Llama 3.1 8B</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nhs-green rounded-full"></div>
                    <span className="text-xs text-nhs-green">Ready</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-nhs-dark-grey">Templates</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nhs-green rounded-full"></div>
                    <span className="text-xs text-nhs-green">Loaded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
