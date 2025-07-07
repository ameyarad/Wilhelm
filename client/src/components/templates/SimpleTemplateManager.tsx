import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, FileText, Upload, Loader2, Trash2, Plus, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Template } from "@shared/schema";
import TemplateViewer from "./TemplateViewer";
import RichTextEditor from "./RichTextEditor";

export default function SimpleTemplateManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Rich text editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Get templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/templates'],
    enabled: !!user,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Use fetch directly for file uploads to avoid JSON serialization
      const response = await fetch("/api/templates/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template uploaded successfully",
      });
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload template",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/templates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('template', file);
    
    console.log('Uploading file:', file.name, file.size, file.type);
    console.log('FormData entries:', Array.from(formData.entries()));
    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingTemplate(null);
  };

  // Display templates directly (no folder grouping)
  const sortedTemplates = templates.sort((a: Template, b: Template) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-nhs-blue">Upload Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              dragOver 
                ? "border-nhs-blue bg-nhs-blue/5" 
                : "border-gray-300 hover:border-nhs-blue"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <CloudUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              {file ? file.name : "Drop files here or click to browse"}
            </p>
            <p className="text-xs text-gray-400">
              Supports .docx, .doc, .txt files
            </p>
          </div>
          
          <input
            id="file-input"
            type="file"
            accept=".docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          

          
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploadMutation.isPending}
            className="w-full bg-nhs-blue hover:bg-nhs-blue/90 text-white"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload Template
          </Button>
        </CardContent>
      </Card>

      {/* Templates Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-nhs-blue">My Templates</CardTitle>
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="bg-nhs-blue hover:bg-nhs-blue/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No templates uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTemplates.map((template: Template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-nhs-blue" />
                    <div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="text-nhs-blue hover:text-nhs-blue/80 h-8 w-8 p-0"
                      title="View and Edit Template"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rich Text Editor Modal */}
      <RichTextEditor
        template={editingTemplate}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
      />
    </div>
  );
}