import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, FileText, Upload, Loader2, Trash2, FolderPlus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Template } from "@/../../shared/schema";

export default function FolderTemplateManager() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("General");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  // Fetch templates
  const { data: templates = [], isLoading, error } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
    enabled: !!user,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { formData: FormData; folder: string }) => {
      // Add folder to FormData
      data.formData.append('folder', data.folder);
      
      // Use fetch directly for file uploads to avoid JSON serialization
      const response = await fetch("/api/templates/upload", {
        method: "POST",
        body: data.formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setFiles([]);
      // Don't reset folder selection after upload
    },
    onError: (error) => {
      console.error('Upload error:', error);
      if (isUnauthorizedError(error)) {
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/templates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
    },
  });

  // Group templates by folder
  const templatesByFolder = templates.reduce((acc, template) => {
    const folder = template.folder || "General";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  const folders = Object.keys(templatesByFolder).length > 0 
    ? Object.keys(templatesByFolder).sort() 
    : ["General"];

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('template', file);
    
    // Uploading template file
    
    const folder = showNewFolder ? newFolderName : selectedFolder;
    uploadMutation.mutate({ formData, folder });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setSelectedFolder(newFolderName.trim());
      setShowNewFolder(false);
      setNewFolderName("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading templates: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5" />
            Upload Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Folder Selection */}
          <div className="space-y-2">
            <Label>Select Folder</Label>
            <div className="flex gap-2">
              {!showNewFolder ? (
                <>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.length > 0 ? (
                        folders.map(folder => (
                          <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="General">General</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewFolder(true)}
                  >
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    placeholder="New folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                  >
                    Create
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewFolder(false);
                      setNewFolderName("");
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragOver ? "border-nhs-blue bg-nhs-blue/5" : "border-gray-300",
              file ? "border-nhs-blue bg-nhs-blue/5" : ""
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {file ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 mx-auto text-nhs-blue" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <CloudUpload className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-lg font-medium">Drop your template here</p>
                <p className="text-sm text-gray-600">
                  or{" "}
                  <label className="text-nhs-blue cursor-pointer hover:underline">
                    browse files
                    <input
                      type="file"
                      className="hidden"
                      accept=".docx,.doc,.txt"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) handleFileSelect(selectedFile);
                      }}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  Supports .docx, .doc, and .txt files
                </p>
              </div>
            )}
          </div>

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

      {/* Templates by Folder */}
      <div className="space-y-4">
        {folders.map(folderName => (
          <Card key={folderName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                {folderName}
                <Badge variant="secondary" className="ml-2">
                  {templatesByFolder[folderName].length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templatesByFolder[folderName].map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-nhs-blue" />
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-gray-600">
                          {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {folders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium">No templates yet</p>
            <p className="text-gray-600">Upload your first template to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}