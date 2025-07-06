import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import TemplateUpload from "./TemplateUpload";
import { Template } from "@shared/schema";
import { FileText, ChevronRight, ExternalLink, Settings } from "lucide-react";

export default function TemplateManager() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/templates'],
  });

  const defaultTemplates: Template[] = templates?.default || [];
  const userTemplates: Template[] = templates?.user || [];

  if (isLoading) {
    return (
      <div className="flex-none w-96 bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-4 border-nhs-blue border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-nhs-dark-grey/70">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-none w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Panel Header */}
      <div className="flex-none p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-nhs-dark-grey">Templates & Reports</h2>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-nhs-blue">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates" className="flex-1 flex flex-col">
        <div className="flex-none border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-2 bg-transparent h-12 rounded-none">
            <TabsTrigger 
              value="templates" 
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-nhs-blue rounded-none"
            >
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="editor" 
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-nhs-blue rounded-none"
            >
              Report Editor
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="templates" className="flex-1 flex flex-col m-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Upload Templates */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Upload Custom Template</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <TemplateUpload compact />
                </CardContent>
              </Card>

              {/* User Templates */}
              {userTemplates.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Your Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {userTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-nhs-blue" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-gray-500">{template.category}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Default Templates */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Default Templates</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {defaultTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-nhs-green" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.category}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recent Reports</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-nhs-light-blue" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Chest X-ray Report</div>
                        <div className="text-xs text-gray-500">2 hours ago</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-nhs-light-blue" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">CT Abdomen Report</div>
                        <div className="text-xs text-gray-500">1 day ago</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="editor" className="flex-1 flex flex-col m-0">
          <div className="flex-1 p-4">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{selectedTemplate.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplate.category}
                  </Badge>
                </div>
                <div className="bg-white border rounded-lg p-4 text-sm">
                  <pre className="whitespace-pre-wrap text-xs">
                    {selectedTemplate.content}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-nhs-blue hover:bg-nhs-blue/90">
                    Use Template
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">
                    Select a template to view or edit
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
