import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CloudUpload, 
  FileText, 
  Upload, 
  Loader2, 
  Trash2, 
  FolderPlus, 
  Folder,
  MoreVertical,
  X
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Template, Folder as FolderType } from "@/../../shared/schema";

export default function PersistentFolderManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [file, setFile] = useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>("General");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState<Template | null>(null);
  const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
    enabled: !!user,
  });

  // Fetch folders
  const { data: persistentFolders = [], isLoading: foldersLoading } = useQuery<FolderType[]>({
    queryKey: ['/api/folders'],
    enabled: !!user,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { formData: FormData; folder: string }) => {
      data.formData.append('folder', data.folder);
      
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
      toast({ title: "Template uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setFile(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Authentication required", variant: "destructive" });
      } else {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      }
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/folders", { name });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Folder created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      setNewFolderName("");
      setShowNewFolder(false);
    },
    onError: (error) => {
      toast({ title: "Failed to create folder", description: error.message, variant: "destructive" });
    },
  });

  // Move template mutation
  const moveTemplateMutation = useMutation({
    mutationFn: async ({ templateId, newFolder }: { templateId: number; newFolder: string }) => {
      const response = await apiRequest("PATCH", `/api/templates/${templateId}/folder`, { folder: newFolder });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Template moved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setDraggedTemplate(null);
      setDraggedOverFolder(null);
    },
    onError: (error) => {
      toast({ title: "Move failed", description: error.message, variant: "destructive" });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/templates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Template deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      const response = await apiRequest("DELETE", `/api/folders/${encodeURIComponent(folderName)}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Folder deleted", description: "Templates moved to General folder" });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
    },
    onError: (error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  // Combine persistent folders with template-based folders
  const templatesByFolder = templates.reduce((acc, template) => {
    const folder = template.folder || "General";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  // All folder names from persistent folders and templates
  const allFolderNames = new Set([
    ...persistentFolders.map(f => f.name),
    ...Object.keys(templatesByFolder)
  ]);

  const sortedFolders = Array.from(allFolderNames).sort();

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a .docx, .doc, or .txt file.",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) return;
    const folder = showNewFolder ? newFolderName : selectedFolder;
    uploadMutation.mutate({ formData: createFormData(file), folder });
  };

  const createFormData = (file: File) => {
    const formData = new FormData();
    formData.append('template', file);
    return formData;
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName.trim());
    }
  };

  const handleDragStart = (e: React.DragEvent, template: Template) => {
    setDraggedTemplate(template);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOverFolder(folderName);
  };

  const handleDragLeave = () => {
    setDraggedOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    setDraggedOverFolder(null);
    
    if (draggedTemplate && draggedTemplate.folder !== targetFolder) {
      moveTemplateMutation.mutate({
        templateId: draggedTemplate.id,
        newFolder: targetFolder
      });
    }
  };

  const handleDeleteFolder = (folderName: string) => {
    if (window.confirm(`Delete folder "${folderName}"? All templates will be moved to General.`)) {
      deleteFolderMutation.mutate(folderName);
    }
  };

  const handleDeleteTemplate = (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id);
    }
  };

  if (templatesLoading || foldersLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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
                      {sortedFolders.map(folder => (
                        <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                      ))}
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
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim() || createFolderMutation.isPending}
                  >
                    {createFolderMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewFolder(false);
                      setNewFolderName("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {file ? file.name : "Choose file"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".docx,.doc,.txt"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileSelect(selectedFile);
              }}
            />
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

      {/* Folders and Templates */}
      <div className="grid gap-4">
        {sortedFolders.map(folderName => {
          const templatesInFolder = templatesByFolder[folderName] || [];
          return (
            <Card 
              key={folderName} 
              className={cn(
                "transition-all duration-200",
                draggedOverFolder === folderName && "ring-2 ring-nhs-blue bg-nhs-blue/5"
              )}
              onDragOver={(e) => handleDragOver(e, folderName)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, folderName)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="w-5 h-5" />
                    {folderName}
                    <Badge variant="secondary" className="ml-2">
                      {templatesInFolder.length}
                    </Badge>
                  </CardTitle>
                  {folderName !== "General" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFolder(folderName)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {templatesInFolder.length > 0 ? (
                  <div className="space-y-2">
                    {templatesInFolder.map((template) => (
                      <div
                        key={template.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, template)}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-move"
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
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No templates in this folder</p>
                    <p className="text-sm">Drag templates here or upload new ones</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedFolders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium">No folders or templates yet</p>
            <p className="text-gray-600">Create your first folder or upload a template to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}