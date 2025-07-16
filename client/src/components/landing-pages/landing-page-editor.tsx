import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Save, 
  Eye, 
  Code, 
  Palette, 
  Settings, 
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  ExternalLink
} from "lucide-react";

const landingPageSchema = z.object({
  name: z.string().min(1, "Page name is required"),
  description: z.string().optional(),
  htmlContent: z.string().min(1, "HTML content is required"),
  cssContent: z.string().optional(),
  jsContent: z.string().optional(),
  redirectUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  pageType: z.enum(["login", "form", "educational", "cloned"]),
  captureCredentials: z.boolean().optional(),
  captureSubmissions: z.boolean().optional(),
  trackClicks: z.boolean().optional(),
});

type LandingPageFormData = z.infer<typeof landingPageSchema>;

interface LandingPageEditorProps {
  landingPage?: any;
  onSave?: (page: any) => void;
  onCancel?: () => void;
}

export default function LandingPageEditor({ landingPage, onSave, onCancel }: LandingPageEditorProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState("html");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LandingPageFormData>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      name: landingPage?.name || "",
      description: landingPage?.description || "",
      htmlContent: landingPage?.htmlContent || `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Secure Portal</title>
</head>
<body>
    <div class="login-container">
        <div class="login-form">
            <h2>Sign In</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Sign In</button>
            </form>
        </div>
    </div>
</body>
</html>`,
      cssContent: landingPage?.cssContent || `body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 400px;
}

.login-form h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
}

button[type="submit"] {
    width: 100%;
    padding: 0.75rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
}

button[type="submit"]:hover {
    background: #5a6fd8;
}`,
      jsContent: landingPage?.jsContent || `document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Capture credentials (this would be sent to your server)
    console.log('Captured credentials:', { email, password });
    
    // Show success message and redirect
    alert('Login successful! Redirecting...');
    
    // In a real phishing simulation, this would redirect to a legitimate site
    // or show educational content about phishing
    window.location.href = 'https://example.com';
});`,
      redirectUrl: landingPage?.redirectUrl || "",
      pageType: landingPage?.pageType || "login",
      captureCredentials: landingPage?.captureCredentials ?? true,
      captureSubmissions: landingPage?.captureSubmissions ?? true,
      trackClicks: landingPage?.trackClicks ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: LandingPageFormData) => {
      return fetch("/api/landing-pages", {
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
      toast({ title: "Landing page created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] });
      onSave?.(newPage);
    },
    onError: () => {
      toast({ title: "Error creating landing page", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: LandingPageFormData) => {
      return fetch(`/api/landing-pages/${landingPage.id}`, {
        method: "PUT",
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
    onSuccess: (updatedPage) => {
      toast({ title: "Landing page updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] });
      onSave?.(updatedPage);
    },
    onError: () => {
      toast({ title: "Error updating landing page", variant: "destructive" });
    },
  });

  const onSubmit = (data: LandingPageFormData) => {
    if (landingPage) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const generatePreview = () => {
    const htmlContent = form.getValues("htmlContent");
    const cssContent = form.getValues("cssContent");
    const jsContent = form.getValues("jsContent");

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <style>${cssContent}</style>
      </head>
      <body>
          ${htmlContent.replace(/<html[^>]*>|<\/html>|<head[^>]*>.*?<\/head>|<body[^>]*>|<\/body>/gis, '')}
          <script>${jsContent}</script>
      </body>
      </html>
    `;
  };

  const getPreviewStyles = () => {
    switch (previewMode) {
      case "mobile":
        return { width: "375px", height: "667px" };
      case "tablet":
        return { width: "768px", height: "1024px" };
      default:
        return { width: "100%", height: "600px" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
      {/* Editor Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Landing Page Editor</span>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isPreviewMode ? "Hide Preview" : "Show Preview"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter page name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select page type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="login">Login Page</SelectItem>
                            <SelectItem value="form">Form Page</SelectItem>
                            <SelectItem value="educational">Educational</SelectItem>
                            <SelectItem value="cloned">Cloned Website</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter page description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
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
                        <FormLabel>Capture Credentials</FormLabel>
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
                        <FormLabel>Capture Submissions</FormLabel>
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
                        <FormLabel>Track Clicks</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="redirectUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redirect URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="html">
                      <Code className="h-4 w-4 mr-2" />
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="css">
                      <Palette className="h-4 w-4 mr-2" />
                      CSS
                    </TabsTrigger>
                    <TabsTrigger value="js">
                      <Settings className="h-4 w-4 mr-2" />
                      JavaScript
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="html" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="htmlContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HTML Code</FormLabel>
                          <FormControl>
                            <Textarea
                              className="font-mono text-sm"
                              placeholder="Enter HTML code"
                              rows={12}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="css" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cssContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CSS Styles</FormLabel>
                          <FormControl>
                            <Textarea
                              className="font-mono text-sm"
                              placeholder="Enter CSS styles"
                              rows={12}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="js" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="jsContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>JavaScript Code</FormLabel>
                          <FormControl>
                            <Textarea
                              className="font-mono text-sm"
                              placeholder="Enter JavaScript code"
                              rows={12}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createMutation.isPending || updateMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {landingPage ? "Update" : "Create"} Page
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      {isPreviewMode && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Preview</span>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={previewMode === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={previewMode === "tablet" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("tablet")}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={previewMode === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <iframe
                  srcDoc={generatePreview()}
                  style={getPreviewStyles()}
                  className="border border-border rounded-lg shadow-sm"
                  title="Landing Page Preview"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}