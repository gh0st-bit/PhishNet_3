import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Globe, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Settings
} from "lucide-react";

const cloneSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  name: z.string().min(1, "Page name is required"),
  description: z.string().optional(),
  captureCredentials: z.boolean().default(true),
  captureSubmissions: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
});

type CloneFormData = z.infer<typeof cloneSchema>;

interface CloneWebpageDialogProps {
  onSuccess?: (page: any) => void;
  children: React.ReactNode;
}

export default function CloneWebpageDialog({ onSuccess, children }: CloneWebpageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cloneStep, setCloneStep] = useState<"input" | "cloning" | "success">("input");
  const [clonedPage, setClonedPage] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CloneFormData>({
    resolver: zodResolver(cloneSchema),
    defaultValues: {
      url: "",
      name: "",
      description: "",
      captureCredentials: true,
      captureSubmissions: true,
      trackClicks: true,
    },
  });

  const cloneMutation = useMutation({
    mutationFn: (data: CloneFormData) => {
      return fetch("/api/landing-pages/clone-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
    },
    onSuccess: (newPage) => {
      setClonedPage(newPage);
      setCloneStep("success");
      toast({ title: "Website cloned successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] });
      onSuccess?.(newPage);
    },
    onError: (error: any) => {
      setCloneStep("input");
      toast({ 
        title: "Error cloning website", 
        description: error.message || "Failed to clone the website",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: CloneFormData) => {
    setCloneStep("cloning");
    cloneMutation.mutate(data);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCloneStep("input");
    setClonedPage(null);
    form.reset();
  };

  const generatePageName = () => {
    const url = form.getValues("url");
    if (url) {
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        form.setValue("name", `Cloned ${domain} Login Page`);
      } catch (e) {
        // Invalid URL, do nothing
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Clone Website
          </DialogTitle>
        </DialogHeader>

        {cloneStep === "input" && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Website Cloning for Security Training
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This feature clones websites for phishing simulation and security awareness training. 
                    Only use this for authorized security testing within your organization.
                  </p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="https://example.com/login" 
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generatePageName}
                            disabled={!field.value}
                          >
                            Auto-name
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landing Page Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a name for this landing page" {...field} />
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
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe how this page will be used in your campaign" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span className="font-medium text-sm">Tracking Options</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="captureCredentials"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm">Capture Credentials</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="captureSubmissions"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm">Capture Form Data</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="trackClicks"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm">Track Clicks</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={cloneMutation.isPending}>
                    <Download className="h-4 w-4 mr-2" />
                    Clone Website
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {cloneStep === "cloning" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Cloning Website...</h3>
              <p className="text-muted-foreground">
                This may take a few moments while we fetch and process the webpage
              </p>
            </div>
          </div>
        )}

        {cloneStep === "success" && clonedPage && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Website Cloned Successfully!</h3>
                <p className="text-muted-foreground">
                  Your landing page "{clonedPage.name}" has been created and is ready to use.
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Page Name:</span>
                    <span className="text-sm">{clonedPage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Source URL:</span>
                    <span className="text-sm text-blue-600">{clonedPage.sourceUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Page Type:</span>
                    <span className="text-sm capitalize">{clonedPage.pageType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm">{new Date(clonedPage.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => {
                handleClose();
                // Navigate to edit page
                window.location.href = `/landing-pages/${clonedPage.id}/edit`;
              }}>
                <Eye className="h-4 w-4 mr-2" />
                Edit Page
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}