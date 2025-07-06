import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MessageSquare, FileText, History, Settings } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-semibold text-nhs-dark-grey mb-2">
                Welcome back, {user?.firstName || "Doctor"}
              </h1>
              <p className="text-nhs-dark-grey/70">
                Ready to create professional radiology reports with AI assistance
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/chat")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Report</CardTitle>
                  <MessageSquare className="h-4 w-4 text-nhs-blue" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-nhs-dark-grey/70">
                    Start dictating or typing findings
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/templates")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Templates</CardTitle>
                  <FileText className="h-4 w-4 text-nhs-green" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-nhs-dark-grey/70">
                    Manage report templates
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/reports")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
                  <History className="h-4 w-4 text-nhs-light-blue" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-nhs-dark-grey/70">
                    View report history
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Settings</CardTitle>
                  <Settings className="h-4 w-4 text-nhs-dark-grey" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-nhs-dark-grey/70">
                    Configure preferences
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-nhs-dark-grey mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-nhs-dark-grey">AI Models</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nhs-green rounded-full"></div>
                    <span className="text-xs text-nhs-green">Active</span>
                  </div>
                </div>
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
