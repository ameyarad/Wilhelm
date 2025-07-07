import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Template } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Edit, Trash2, Plus, Folder, FolderPlus } from "lucide-react";
import TemplateUpload from "./TemplateUpload";

export default function TemplateManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['/api/templates'],
  });

  const { data: templatesByFolder = {} } = useQuery({
    queryKey: ['/api/templates/folders'],
  });

  const folders = Object.keys(templatesByFolder);
  const filteredTemplates = selectedFolder === "All" 
    ? templates 
    : templates.filter((t: Template) => (t.folder || "General") === selectedFolder);

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Template> }) => {
      const response = await apiRequest("PUT", `/api/templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates/folders'] });
      setEditingTemplate(null);
      toast({
        title: "Template Updated",
        description: "Template has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates/folders'] });
      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/templates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates/folders'] });
      toast({
        title: "Template Created",
        description: "New template has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // Create a template in the new folder to establish it
      createTemplateMutation.mutate({
        name: `${newFolderName} Template`,
        description: `Default template for ${newFolderName} folder`,
        content: "Template content goes here...",
        category: "Custom",
        folder: newFolderName,
      });
      setNewFolderName("");
      setShowNewFolderDialog(false);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        data: editingTemplate,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with folder filter and actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Templates</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    {folder}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewFolderDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TemplateUpload compact />
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template: Template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{template.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteTemplateMutation.mutate(template.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{template.category}</span>
                {template.folder && (
                  <>
                    <span>•</span>
                    <Folder className="h-4 w-4" />
                    <span>{template.folder}</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>
              <div className="text-xs text-gray-500 truncate">
                {template.content.substring(0, 100)}...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {selectedFolder === "All" 
              ? "Upload your first template to get started"
              : `No templates in "${selectedFolder}" folder`
            }
          </p>
          <TemplateUpload />
        </div>
      )}

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">Name</Label>
                <Input
                  id="templateName"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value,
                  })}
                />
              </div>
              <div>
                <Label htmlFor="templateDescription">Description</Label>
                <Input
                  id="templateDescription"
                  value={editingTemplate.description || ""}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    description: e.target.value,
                  })}
                />
              </div>
              <div>
                <Label htmlFor="templateCategory">Category</Label>
                <Input
                  id="templateCategory"
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    category: e.target.value,
                  })}
                />
              </div>
              <div>
                <Label htmlFor="templateFolder">Folder</Label>
                <Select
                  value={editingTemplate.folder || "General"}
                  onValueChange={(value) => setEditingTemplate({
                    ...editingTemplate,
                    folder: value,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="templateContent">Content</Label>
                <Textarea
                  id="templateContent"
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    content: e.target.value,
                  })}
                  rows={8}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingTemplate(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}