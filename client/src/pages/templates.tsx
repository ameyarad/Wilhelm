import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TemplateUpload from "@/components/templates/TemplateUpload";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Trash2 } from "lucide-react";
import { Template } from "@shared/schema";

export default function Templates() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/templates'],
    enabled: isAuthenticated,
  });

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

  if (isLoading || templatesLoading) {
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

  const defaultTemplates: Template[] = templates?.default || [];
  const userTemplates: Template[] = templates?.user || [];

  return (
    <div className="flex h-screen bg-nhs-light-grey">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-semibold text-nhs-dark-grey mb-2">
                Template Management
              </h1>
              <p className="text-nhs-dark-grey/70">
                Manage your custom templates and browse the default library
              </p>
            </div>

            {/* Upload Section */}
            <TemplateUpload />

            {/* User Templates */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-nhs-dark-grey mb-4">
                Your Templates
              </h2>
              {userTemplates.length === 0 ? (
                <p className="text-nhs-dark-grey/70 text-center py-8">
                  No custom templates yet. Upload your first template above.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-nhs-blue" />
                          <span>{template.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-nhs-dark-grey/70 mb-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-nhs-blue bg-nhs-blue/10 px-2 py-1 rounded">
                            {template.category}
                          </span>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-nhs-red hover:text-nhs-red">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Default Templates */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-nhs-dark-grey mb-4">
                Default Templates
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaultTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-nhs-green" />
                        <span>{template.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-nhs-dark-grey/70 mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-nhs-green bg-nhs-green/10 px-2 py-1 rounded">
                          {template.category}
                        </span>
                        <Button size="sm" variant="outline">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-2 text-center">
          <div className="text-xs text-nhs-dark-grey/70">
            <p>© 2025 Ameya Kawthalkar. Wilhelm is for educational and research purposes only. Not for clinical use.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
