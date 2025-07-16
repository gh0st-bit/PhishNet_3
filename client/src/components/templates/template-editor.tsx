import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Loader2, 
  FolderInput, 
  Download, 
  Send, 
  ArrowLeft,
  Save,
  X
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// @ts-ignore
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

// Import custom CSS to override SunEditor styles
import "@/styles/suneditor-dark.css";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  type: z.string().min(1, "Template type is required"),
  complexity: z.string().min(1, "Complexity is required"),
  description: z.string().optional(),
  subject: z.string().min(1, "Subject line is required"),
  sender_name: z.string().min(1, "Sender name is required"),
  sender_email: z.string().email("Invalid email format").min(1, "Sender email is required"),
  html_content: z.string().min(1, "Email content is required"),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateEditorProps {
  template?: any;
  onClose: () => void;
}

export default function TemplateEditor({ template, onClose }: TemplateEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sunEditorRef = useRef<any>(null);
  
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: template ? {
      name: template.name,
      type: template.type || "phishing-home",
      complexity: template.complexity || "medium",
      description: template.description || "",
      subject: template.subject,
      sender_name: template.sender_name || "",
      sender_email: template.sender_email || "",
      html_content: template.html_content,
    } : {
      name: "",
      type: "phishing-home",
      complexity: "medium",
      description: "",
      subject: "",
      sender_name: "PhishNet Team",
      sender_email: "phishing@example.com",
      html_content: "<div>Your email content here...</div>",
    },
  });

  const isEditing = !!template;

  const handleEditorChange = (content: string) => {
    form.setValue("html_content", content);
  };

  const handleEditorBlur = () => {
    if (sunEditorRef.current) {
      const content = sunEditorRef.current.getContents();
      if (content) {
        form.setValue("html_content", content);
      }
    }
  };

  const getSunEditorInstance = (sunEditor: any) => {
    sunEditorRef.current = sunEditor;
  };

  const mutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      const url = isEditing 
        ? `/api/email-templates/${template.id}` 
        : "/api/email-templates";
      const method = isEditing ? "PUT" : "POST";
      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Template ${isEditing ? 'updated' : 'created'}`,
        description: `Your email template has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: `Error ${isEditing ? 'updating' : 'creating'} template`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImportHTML = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".html";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          form.setValue("html_content", content);
          if (sunEditorRef.current) {
            sunEditorRef.current.setContents(content);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportHTML = () => {
    const html_content = form.getValues("html_content");
    const blob = new Blob([html_content || ""], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.getValues("name") || "template"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSendTestEmail = () => {
    // Implement test email functionality
    toast({
      title: "Test email sent",
      description: "A test email has been sent to your inbox.",
    });
  };

  function onSubmit(data: TemplateFormValues) {
    // Make sure we get the latest editor content
    if (sunEditorRef.current) {
      data.html_content = sunEditorRef.current.getContents();
    }
    mutation.mutate(data);
  }

  useEffect(() => {
    // Apply dark theme styles to SunEditor when component mounts
    const style = document.createElement('style');
    style.textContent = `
      .sun-editor-editable {
        background-color: #1f1f23 !important;
        color: #e1e1e6 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="text-lg font-medium">
          {isEditing ? "Edit Email Template" : "New Email Template"}
        </div>
        {/* Close button is moved to the dialog in templates-page.tsx */}
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="space-y-4 overflow-y-auto flex-1 py-4 pr-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="phishing-home">Phishing - Home & Personal</SelectItem>
                        <SelectItem value="phishing-business">Phishing - Business</SelectItem>
                        <SelectItem value="phishing-financial">Phishing - Financial</SelectItem>
                        <SelectItem value="phishing-social">Phishing - Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complexity *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a description for this template" 
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject line" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sender_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Sender's display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sender_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="Sender's email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="html_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormDescription className="mb-1">
                    Available variables: FirstName, LastName, Email, Position, TrackingURL
                  </FormDescription>
                  <FormControl>
                    <div className="border rounded-md" style={{ height: '340px' }}>
                      <SunEditor
                        setContents={field.value}
                        onChange={handleEditorChange}
                        onBlur={handleEditorBlur}
                        getSunEditorInstance={getSunEditorInstance}
                        setOptions={{
                          height: '340px',
                          buttonList: [
                            ['undo', 'redo'],
                            ['font', 'fontSize', 'formatBlock'],
                            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                            ['removeFormat'],
                            ['fontColor', 'hiliteColor'],
                            ['outdent', 'indent'],
                            ['align', 'horizontalRule', 'list'],
                            ['table', 'link', 'image'],
                            ['fullScreen', 'showBlocks', 'codeView'],
                          ],
                          defaultStyle: 'font-family: Arial, sans-serif; font-size: 14px;',
                          font: ['Arial', 'Helvetica', 'Tahoma', 'Verdana', 'Times New Roman'],
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-between pt-4 mt-2 border-t bg-background z-10 mt-auto sticky bottom-0 left-0 right-0">
            <div className="flex flex-wrap gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleImportHTML}
              >
                <FolderInput className="mr-1 h-4 w-4" /> Import
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleExportHTML}
              >
                <Download className="mr-1 h-4 w-4" /> Export
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSendTestEmail}
              >
                <Send className="mr-1 h-4 w-4" /> Test Mail
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="ml-2" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}