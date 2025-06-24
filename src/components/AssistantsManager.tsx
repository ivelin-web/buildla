'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { createAssistant, updateAssistant, deleteAssistant } from '@/lib/actions/assistants';
import { showSuccess, showError } from '@/lib/toast';
import { type Assistant } from '@/types';

interface AssistantsManagerProps {
  assistants: Assistant[];
}

export default function AssistantsManager({ assistants }: AssistantsManagerProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAssistant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    
    try {
      const formData = new FormData(form);
      await createAssistant(formData);
      setCreateDialogOpen(false);
      form.reset();
      showSuccess('Assistant created successfully!', 'Your new AI assistant is ready to use.');
    } catch (error) {
      console.error('Error creating assistant:', error);
      showError('Failed to create assistant', 'Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (assistantId: string) => {
    try {
      await deleteAssistant(assistantId);
      showSuccess('Assistant deleted successfully!', 'The assistant has been permanently removed.');
    } catch (error) {
      console.error('Error deleting assistant:', error);
      showError('Failed to delete assistant', 'Please try again.');
    }
  };

  const handleEditAssistant = (assistant: Assistant) => {
    setEditingAssistant(assistant);
    setEditDialogOpen(true);
  };

  const handleUpdateAssistant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAssistant) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateAssistant(editingAssistant.id, formData);
      setEditingAssistant(null);
      setEditDialogOpen(false);
      showSuccess('Assistant updated successfully!', 'Your changes have been saved.');
    } catch (error) {
      console.error('Error updating assistant:', error);
      showError('Failed to update assistant', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistants</CardTitle>
        <CardDescription>
          Manage your AI assistants and their configurations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assistants.map((assistant) => (
            <div
              key={assistant.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{assistant.name}</h3>
                <p className="text-gray-600 text-sm">{assistant.description}</p>
                {assistant.category && (
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                    {assistant.category}
                  </span>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Created: {new Date(assistant.created_at).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="cursor-pointer"
                  onClick={() => handleEditAssistant(assistant)}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 cursor-pointer"
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{assistant.name}&quot;? This action cannot be undone and will permanently remove the assistant and all its configuration.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleConfirmDelete(assistant.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Assistant
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          
          {assistants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No assistants created yet. Create your first AI assistant to get started.
            </div>
          )}
          
          {/* Create Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer">
                + Create New Assistant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Assistant</DialogTitle>
                <DialogDescription>
                  Create a new AI assistant with custom instructions and behavior.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAssistant} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input name="name" placeholder="e.g., Bathroom Renovation Expert" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input name="description" placeholder="Brief description of what this assistant does" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input name="category" placeholder="e.g., Renovation, Construction, Consultation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea 
                    name="systemPrompt" 
                    rows={8} 
                    placeholder="Define how your AI assistant should behave and respond..."
                    required 
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Assistant'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Assistant</DialogTitle>
                <DialogDescription>
                  Update your AI assistant&apos;s configuration and behavior.
                </DialogDescription>
              </DialogHeader>
              {editingAssistant && (
                <form onSubmit={handleUpdateAssistant} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input name="name" defaultValue={editingAssistant.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input name="description" defaultValue={editingAssistant.description} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input name="category" defaultValue={editingAssistant.category || ''} placeholder="e.g., Renovation, Construction, Consultation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea 
                      name="systemPrompt" 
                      rows={8} 
                      defaultValue={editingAssistant.system_prompt} 
                      required 
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Assistant'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="cursor-pointer"
                      onClick={() => {
                        setEditingAssistant(null);
                        setEditDialogOpen(false);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
} 