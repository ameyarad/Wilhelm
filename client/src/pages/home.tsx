import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import GeneratedReportViewer from "@/components/reports/GeneratedReportViewer";
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
  Copy,
  Eye
} from "lucide-react";

export default function Home() {
  const { user: userData, isAuthenticated, isLoading } = useAuth();
  const user = userData as User;
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  
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
      setIsReportViewerOpen(true);
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
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-4xl space-y-4 md:space-y-6">


            {/* Chat Interface */}
            <Card>
              <CardContent className="space-y-4 p-4 md:p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center space-x-2">
                      {isRecording && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Circle className="w-2 h-2 mr-1 fill-current" />
                          Recording
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type or dictate your findings here"
                      className="min-h-[120px] pr-12 md:pr-16"
                      disabled={isProcessing}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleRecording}
                      className={`absolute bottom-3 right-3 p-2 h-8 w-8 ${
                        isRecording 
                          ? "text-nhs-red hover:text-nhs-red" 
                          : "text-nhs-blue hover:text-nhs-dark-blue"
                      }`}
                      disabled={isProcessing}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </div>

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
                      <span className="hidden sm:inline">Generate Report</span>
                      <span className="sm:hidden">Generate</span>
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
                      <span>Your Report</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyReport}
                        className="text-nhs-green"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        onClick={() => setIsReportViewerOpen(true)}
                        className="bg-nhs-blue hover:bg-nhs-blue/90 text-white"
                        size="sm"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View & Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-sm text-nhs-dark-grey">Report generated successfully. Click "View & Edit" to see the full report.</div>
                  </div>
                </CardContent>
              </Card>
            )}


          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-2 text-center">
          <div className="text-xs text-nhs-dark-grey/70">
            <p className="font-normal">© 2025 Ameya Kawthalkar. Wilhelm is for educational and research purposes only. Not for clinical use.</p>
          </div>
        </footer>

        {/* Generated Report Viewer */}
        <GeneratedReportViewer
          report={generatedReport}
          isOpen={isReportViewerOpen}
          onClose={() => setIsReportViewerOpen(false)}
        />
      </div>
    </div>
  );
}
