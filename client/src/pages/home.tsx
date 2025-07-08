import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { Link } from "wouter";
import { 
  Mic, 
  MicOff, 
  Circle,
  Loader2,
  FileText,
  Brain,
  Eye
} from "lucide-react";

export default function Home() {
  const { user: userData, isAuthenticated, isLoading } = useAuth();
  const user = userData as User;
  const [message, setMessage] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [error, setError] = useState("");
  
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
      setError("");
      console.log("Report generated successfully using template:", result.templateUsed);
    },
    onError: (error) => {
      setIsProcessing(false);
      if (isUnauthorizedError(error)) {
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      setError("Failed to generate report. Please try again.");
      // Report generation failed
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
      setError("Recording error: " + recordingError);
      // Recording failed
    }
  }, [recordingError]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading]);

  const handleGenerateReport = () => {
    if (!message.trim()) {
      setError("Please enter or dictate your findings first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    generateReportMutation.mutate(message.trim());
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Check if we're on HTTPS (required for microphone access)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError("Microphone access requires HTTPS. Please use a secure connection.");
        return;
      }
      startRecording();
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
    <div className="flex h-screen bg-nhs-light-grey overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden">
        <Header />
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">


            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-red-700">{error}</span>
                      {error.includes("Microphone permission denied") && (
                        <div className="mt-2 text-xs text-red-600 space-y-2">
                          <p className="font-medium">To enable microphone access:</p>
                          
                          <div className="border-l-2 border-red-400 pl-3">
                            <p className="font-medium text-red-700">Quick Fix:</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Look for a microphone icon in your address bar (right side)</li>
                              <li>If blocked, click it and select "Allow"</li>
                              <li>Refresh the page</li>
                            </ol>
                          </div>

                          <div className="border-l-2 border-red-400 pl-3">
                            <p className="font-medium text-red-700">Chrome/Edge:</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Click the three dots menu → Settings</li>
                              <li>Search for "Site Settings" → Microphone</li>
                              <li>Add this site to "Allowed" list</li>
                            </ol>
                          </div>

                          <div className="border-l-2 border-red-400 pl-3">
                            <p className="font-medium text-red-700">Firefox:</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Click the menu → Settings</li>
                              <li>Privacy & Security → Permissions → Microphone</li>
                              <li>Click "Settings" and allow this site</li>
                            </ol>
                          </div>

                          <div className="border-l-2 border-red-400 pl-3">
                            <p className="font-medium text-red-700">Safari:</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Safari menu → Settings for This Website</li>
                              <li>Set Microphone to "Allow"</li>
                            </ol>
                          </div>

                          <div className="mt-3 p-2 bg-red-100 rounded">
                            <p className="text-xs font-medium text-red-800">
                              💡 Tip: After allowing microphone access, you may need to refresh this page or close and reopen your browser for the changes to take effect.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setError("")}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      placeholder="Type or dictate your findings here. Ignore spelling errors in dictation, Wilhelm will correct them in the final report."
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
                      title={isRecording ? "Stop recording" : "Start voice recording"}
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
                    <Button
                      onClick={() => setIsReportViewerOpen(true)}
                      className="bg-nhs-blue hover:bg-nhs-blue/90 text-white"
                      size="sm"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View & Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-sm text-nhs-dark-grey">Report generated successfully. Click "View & Edit" to see the full report.</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Important Warning Text */}
            <Card className="mt-4 border-nhs-dark-blue bg-nhs-pale-blue">
              <CardContent className="p-3 md:p-4">
                <div className="text-nhs-dark-blue space-y-1 md:space-y-2">
                  <p className="font-medium text-center text-xs md:text-sm">
                    <strong>Important:</strong> Wilhelm will not work without appropriate report templates. 
                    Please upload report templates related to your dictation or create new templates in the 
                    My Templates section first! Ensure templates are named by modality and scan type 
                    (eg MRI Knee)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Optimization Notice */}
            <Card className="mt-3 border-nhs-dark-blue bg-nhs-pale-blue">
              <CardContent className="p-3 md:p-4">
                <div className="text-nhs-dark-blue space-y-1 md:space-y-2">
                  <p className="font-medium text-center text-xs md:text-sm">
                    Wilhelm is optimized for use on desktops, Macs, laptops, Macbooks and does not function on mobile devices. 
                    If using on a smartphone please click on your browser's menu and select "Desktop site".
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Templates Button */}
            <div className="mt-4 flex justify-center">
              <Link href="/templates">
                <button className="bg-nhs-blue hover:bg-nhs-dark-blue text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-sm md:text-base">
                  Upload Templates
                </button>
              </Link>
            </div>

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
