import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SimpleTemplateManager from "@/components/templates/SimpleTemplateManager";

export default function Templates() {
  const { isAuthenticated, isLoading } = useAuth();
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
    <div className="min-h-screen bg-nhs-light-grey">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-16 lg:ml-64 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-nhs-blue mb-2">My Templates</h1>
              <p className="text-gray-600">
                Upload and manage your radiology report templates
              </p>
            </div>

            <SimpleTemplateManager />
          </div>
        </main>
      </div>
    </div>
  );
}