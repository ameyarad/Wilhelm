import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { 
  Upload, 
  Mic, 
  FileText, 
  Eye,
  Save,
  Users,
  Settings
} from "lucide-react";

export default function HowToUse() {
  const { isAuthenticated, isLoading } = useAuth();

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
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-nhs-dark-blue mb-2 text-center">How To Use Wilhelm</h1>
              <p className="text-nhs-dark-grey/70 text-lg text-center">Step-By-Step Guide For Creating AI-powered Radiology Reports</p>
            </div>

            {/* Step 1: Template Upload */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <Upload className="w-6 h-6 text-nhs-blue" />
                  <span>Upload Your Templates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                  Before generating reports, upload your radiology templates to the system.
                </p>
                <ul className="text-sm text-nhs-dark-grey/80 space-y-2 ml-4">
                  <li>• Navigate to "My Templates" in the sidebar</li>
                  <li>• Click "Upload Template" and select your .doc or .docx files</li>
                  <li>• Name templates clearly by modality and scan type (e.g., "CT Chest", "MRI Brain")</li>
                  <li>• Wilhelm selects templates based on their names, like a real transcriptionist</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2: Voice Recording */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <Mic className="w-6 h-6 text-nhs-blue" />
                  <span>Record or Type Your Findings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                  Input your clinical findings using voice recording or text input.
                </p>
                <ul className="text-sm text-nhs-dark-grey/80 space-y-2 ml-4">
                  <li>• Go to the "Report" page (main page)</li>
                  <li>• Click the microphone icon to start voice recording</li>
                  <li>• Speak clearly about your radiological findings</li>
                  <li>• Alternatively, type directly into the text area</li>
                  
                </ul>
              </CardContent>
            </Card>

            {/* Step 3: Generate Report */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <FileText className="w-6 h-6 text-nhs-blue" />
                  <span>Generate Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                  Let Wilhelm's AI create a structured report from your findings.
                </p>
                <ul className="text-sm text-nhs-dark-grey/80 space-y-2 ml-4">
                  <li>• Click "Generate Report" after entering your findings</li>
                  <li>• Wilhelm's AI analyzes your text and selects the best template</li>
                  <li>• The system merges your findings with the chosen template</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 4: Review and Edit */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <Eye className="w-6 h-6 text-nhs-blue" />
                  <span>Review and Edit</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                  Review the generated report and make any necessary edits.
                </p>
                <ul className="text-sm text-nhs-dark-grey/80 space-y-2 ml-4">
                  <li>• Click "View & Edit" to open the rich text editor</li>
                  <li>• Use formatting tools (bold, italic, headers, lists)</li>
                  <li>• Add or modify content as needed</li>
                  <li>• The editor preserves all HTML formatting</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 5: Save Report */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <Save className="w-6 h-6 text-nhs-blue" />
                  <span>Save Your Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                  Save your finalized report for future reference.
                </p>
                <ul className="text-sm text-nhs-dark-grey/80 space-y-2 ml-4">
                  <li>• Click "Save Report" in the editor</li>
                  <li>• Reports are automatically organized by date</li>
                  <li>• Access saved reports via "Saved Reports" in the sidebar</li>
                  <li>• Copy reports to clipboard for use in other systems</li>
                  <li>• Delete reports you no longer need</li>
                </ul>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-6 h-6 text-nhs-blue" />
                  <span>Tips for Best Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-nhs-dark-grey/80 space-y-2 ml-4">
                  <li>• Use clear, descriptive template names that include modality and anatomy</li>
                  <li>• Speak clearly when using voice recording for better transcription accuracy</li>
                  <li>• Wilhelm works best on desktop/laptop computers</li>
                  <li>• For mobile use, select "Request Desktop Site" for optimal performance</li>
                  <li>• Include specific anatomical details in your findings for more accurate template selection</li>
                  <li>• Review generated reports carefully as this is for educational use only</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-2 text-center">
          <div className="text-xs text-nhs-dark-grey/70">
            <p className="font-bold">© 2025 Ameya Kawthalkar. Wilhelm is for educational and research purposes only. Not for clinical use.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}