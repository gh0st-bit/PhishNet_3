import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, FileCheck, AlertTriangle, CheckCircle, Clock, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schema for creating new compliance framework
const frameworkSchema = z.object({
  name: z.string().min(1, "Framework name is required"),
  description: z.string().optional(),
  version: z.string().optional(),
  requirements: z.object({}).optional(),
});

const assessmentSchema = z.object({
  frameworkId: z.number(),
  name: z.string().min(1, "Assessment name is required"),
  assessmentData: z.object({}).optional(),
});

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState("frameworks");
  const [isCreateFrameworkOpen, setIsCreateFrameworkOpen] = useState(false);
  const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch compliance frameworks
  const { data: frameworksList = [], isLoading: frameworksLoading } = useQuery({
    queryKey: ["/api/compliance/frameworks"],
  });

  // Fetch compliance assessments
  const { data: assessmentsList = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/compliance/assessments"],
  });

  // Create framework mutation
  const createFrameworkMutation = useMutation({
    mutationFn: (data: z.infer<typeof frameworkSchema>) =>
      apiRequest("/api/compliance/frameworks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/frameworks"] });
      setIsCreateFrameworkOpen(false);
      toast({ title: "Compliance framework created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create framework", variant: "destructive" });
    },
  });

  // Create assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: (data: z.infer<typeof assessmentSchema>) =>
      apiRequest("/api/compliance/assessments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/assessments"] });
      setIsCreateAssessmentOpen(false);
      toast({ title: "Compliance assessment created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create assessment", variant: "destructive" });
    },
  });

  const frameworkForm = useForm<z.infer<typeof frameworkSchema>>({
    resolver: zodResolver(frameworkSchema),
    defaultValues: {
      name: "",
      description: "",
      version: "",
    },
  });

  const assessmentForm = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      name: "",
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "draft": return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance & Governance</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage compliance frameworks, assessments, and governance policies</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Compliance Frameworks</h2>
            <Dialog open={isCreateFrameworkOpen} onOpenChange={setIsCreateFrameworkOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Framework
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Compliance Framework</DialogTitle>
                  <DialogDescription>
                    Add a new compliance framework to track and assess organizational compliance
                  </DialogDescription>
                </DialogHeader>
                <Form {...frameworkForm}>
                  <form onSubmit={frameworkForm.handleSubmit((data) => createFrameworkMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={frameworkForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Framework Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ISO 27001, SOC 2, GDPR" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={frameworkForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2022, v1.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={frameworkForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe the compliance framework" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateFrameworkOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createFrameworkMutation.isPending}>
                        {createFrameworkMutation.isPending ? "Adding..." : "Add Framework"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {frameworksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {frameworksList.map((framework: any) => (
                <Card key={framework.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-lg">{framework.name}</CardTitle>
                      </div>
                      {framework.isActive && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {framework.version && <span className="text-xs">Version: {framework.version}</span>}
                      <br />
                      {framework.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {framework.requirements ? 
                          `${Object.keys(framework.requirements).length} requirements` : 
                          "No requirements defined"
                        }
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Compliance Assessments</h2>
            <Dialog open={isCreateAssessmentOpen} onOpenChange={setIsCreateAssessmentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Compliance Assessment</DialogTitle>
                  <DialogDescription>
                    Start a new compliance assessment for a specific framework
                  </DialogDescription>
                </DialogHeader>
                <Form {...assessmentForm}>
                  <form onSubmit={assessmentForm.handleSubmit((data) => createAssessmentMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={assessmentForm.control}
                      name="frameworkId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compliance Framework</FormLabel>
                          <FormControl>
                            <select 
                              className="w-full p-2 border rounded-md bg-background"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              defaultValue=""
                            >
                              <option value="" disabled>Select a framework</option>
                              {frameworksList.map((framework: any) => (
                                <option key={framework.id} value={framework.id}>
                                  {framework.name} {framework.version && `(${framework.version})`}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assessmentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assessment Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Assessment name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateAssessmentOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createAssessmentMutation.isPending}>
                        {createAssessmentMutation.isPending ? "Creating..." : "Create Assessment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {assessmentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {assessmentsList.map((assessment: any) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5" />
                        <CardTitle>{assessment.name}</CardTitle>
                        {getStatusIcon(assessment.status)}
                        <Badge className={getStatusColor(assessment.status)}>
                          {assessment.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          Continue
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Framework: {assessment.frameworkName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{assessment.score || 0}%</span>
                      </div>
                      <Progress value={assessment.score || 0} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Started: {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : "Not started"}</span>
                        <span>Last updated: {assessment.updatedAt ? new Date(assessment.updatedAt).toLocaleDateString() : "Never"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Governance Policies</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create and manage governance policies and procedures for your organization.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Policy
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}