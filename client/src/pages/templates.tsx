import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SimpleTemplateManager from "@/components/templates/SimpleTemplateManager";

export default function Templates() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading]);

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
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-2 text-center">
          <div className="text-xs text-nhs-dark-grey/70">
            <p className="font-normal">© 2025 Ameya Kawthalkar. Wilhelm is for educational and research purposes only. Not for clinical use.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}