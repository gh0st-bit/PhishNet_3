import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LandingPageEditor from "@/components/landing-pages/landing-page-editor";
import CloneWebpageDialog from "@/components/landing-pages/clone-webpage-dialog";
import { 
  Ghost, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  ExternalLink,
  Globe,
  MoreVertical,
  Eye,
  Layout,
  FileText,
  Target,
  Activity,
  Download
} from "lucide-react";

export default function LandingPagesPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: landingPages, isLoading } = useQuery({
    queryKey: ['/api/landing-pages'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return fetch(`/api/landing-pages/${id}`, {
        method: "DELETE",
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
    },
    onSuccess: () => {
      toast({ title: "Landing page deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] });
    },
    onError: () => {
      toast({ title: "Error deleting landing page", variant: "destructive" });
    },
  });

  const cloneMutation = useMutation({
    mutationFn: (data: { id: number, name: string }) => {
      return fetch(`/api/landing-pages/${data.id}/clone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.name }),
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
    },
    onSuccess: () => {
      toast({ title: "Landing page cloned successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] });
    },
    onError: () => {
      toast({ title: "Error cloning landing page", variant: "destructive" });
    },
  });

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingPage(null);
    setShowEditor(true);
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingPage(null);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingPage(null);
  };

  const handleDelete = (page: any) => {
    if (confirm(`Are you sure you want to delete "${page.name}"?`)) {
      deleteMutation.mutate(page.id);
    }
  };

  const handleClone = (page: any) => {
    const name = prompt(`Enter a name for the cloned page:`, `Copy of ${page.name}`);
    if (name) {
      cloneMutation.mutate({ id: page.id, name });
    }
  };

  const getPageTypeIcon = (type: string) => {
    switch (type) {
      case "login":
        return <Target className="h-4 w-4" />;
      case "form":
        return <FileText className="h-4 w-4" />;
      case "educational":
        return <Activity className="h-4 w-4" />;
      case "cloned":
        return <Globe className="h-4 w-4" />;
      default:
        return <Layout className="h-4 w-4" />;
    }
  };

  const getPageTypeColor = (type: string) => {
    switch (type) {
      case "login":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "form":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "educational":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cloned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredPages = landingPages?.filter((page: any) => {
    if (activeTab === "all") return true;
    return page.pageType === activeTab;
  }) || [];

  const getPageStats = () => {
    if (!landingPages) return { total: 0, login: 0, form: 0, educational: 0, cloned: 0 };
    
    return landingPages.reduce((acc: any, page: any) => {
      acc.total++;
      acc[page.pageType] = (acc[page.pageType] || 0) + 1;
      return acc;
    }, { total: 0, login: 0, form: 0, educational: 0, cloned: 0 });
  };

  const stats = getPageStats();

  if (showEditor) {
    return (
      <AppLayout>
        <LandingPageEditor
          landingPage={editingPage}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Landing Pages</h1>
          <p className="text-muted-foreground">
            Create and manage phishing simulation landing pages
          </p>
        </div>
        <div className="flex space-x-2">
          <CloneWebpageDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] })}>
            <Button variant="outline">
              <Globe className="mr-2 h-4 w-4" />
              Clone Website
            </Button>
          </CloneWebpageDialog>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Landing Page
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Layout className="h-8 w-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Pages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Login Pages</p>
                <p className="text-2xl font-bold">{stats.login || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Form Pages</p>
                <p className="text-2xl font-bold">{stats.form || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Educational</p>
                <p className="text-2xl font-bold">{stats.educational || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Cloned</p>
                <p className="text-2xl font-bold">{stats.cloned || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-background border">
          <TabsTrigger value="all">All Pages ({stats.total})</TabsTrigger>
          <TabsTrigger value="login">Login ({stats.login || 0})</TabsTrigger>
          <TabsTrigger value="form">Form ({stats.form || 0})</TabsTrigger>
          <TabsTrigger value="educational">Educational ({stats.educational || 0})</TabsTrigger>
          <TabsTrigger value="cloned">Cloned ({stats.cloned || 0})</TabsTrigger>
        </TabsList>

        {["all", "login", "form", "educational", "cloned"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-6">
            {filteredPages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPages.map((page: any) => (
                  <Card key={page.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video relative bg-secondary">
                      <div className="w-full h-full flex items-center justify-center">
                        {getPageTypeIcon(page.pageType)}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className={getPageTypeColor(page.pageType)}>
                          {page.pageType}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium truncate">{page.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(page)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleClone(page)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Clone
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(page)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {page.description || "No description provided"}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Created {new Date(page.createdAt).toLocaleDateString()}</span>
                        {page.sourceUrl && (
                          <Badge variant="outline" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Cloned
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEdit(page)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEdit(page)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Ghost className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {activeTab === "all" ? "No landing pages found" : `No ${activeTab} pages found`}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    {activeTab === "all" 
                      ? "Create your first landing page to capture credentials or deliver security awareness training."
                      : `Create a ${activeTab} landing page for your phishing simulations.`
                    }
                  </p>
                  <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Create Landing Page
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AppLayout>
  );
}
