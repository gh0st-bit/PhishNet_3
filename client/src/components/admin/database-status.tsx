import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Database, Server, Check, X, RotateCcw, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface DatabaseStatus {
  status: string;
  connectionType: 'cloud' | 'local';
  isCloud: boolean;
  cloudDatabaseUrl: string;
  localDatabaseConfig: {
    host: string;
    database: string;
    user: string;
    port: string;
  };
}

export function DatabaseStatusPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch database status
  const { data: status, isLoading, isError, refetch } = useQuery<DatabaseStatus>({
    queryKey: ['/api/database/status'],
    refetchInterval: false, // We'll manually refetch as needed
  });

  // Mutation for simulating cloud database failure
  const simulateFailureMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/admin/simulate-database-failure', 'POST');
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Database Failure Simulated",
        description: "Cloud database failure has been simulated. The application will now use the local database.",
        variant: "default"
      });
      
      // Refetch status after a short delay to allow system to detect the change
      setTimeout(() => {
        refetch();
        setLastUpdated(new Date());
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Simulation Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  });

  // Mutation for restoring cloud database connection
  const restoreConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/admin/restore-database-connection', 'POST');
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Connection Restored",
        description: "Cloud database connection has been restored.",
        variant: "default"
      });
      
      // Refetch status after a short delay
      setTimeout(() => {
        refetch();
        setLastUpdated(new Date());
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Restoration Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  });

  // Handle refresh button click
  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };

  // Format time nicely
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status & Fallback Controls
        </CardTitle>
        <CardDescription>
          Monitor and test the database fallback mechanism
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-destructive font-medium p-4 bg-destructive/10 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to fetch database status</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Badge variant={status?.isCloud ? "default" : "secondary"}>
                  {status?.connectionType.toUpperCase()} DATABASE
                </Badge>
                {status?.isCloud ? (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="h-4 w-4" /> Cloud Connection
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Server className="h-4 w-4" /> Local Fallback
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Cloud Database</h3>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${status?.cloudDatabaseUrl !== "not configured" ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">
                      {status?.cloudDatabaseUrl !== "not configured" 
                        ? "Configured" 
                        : "Not Configured"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Local Database</h3>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      status?.localDatabaseConfig.host !== "not configured" &&
                      status?.localDatabaseConfig.database !== "not configured" &&
                      status?.localDatabaseConfig.user !== "not configured"
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm">
                      {status?.localDatabaseConfig.host !== "not configured" &&
                       status?.localDatabaseConfig.database !== "not configured" &&
                       status?.localDatabaseConfig.user !== "not configured"
                        ? "Configured" 
                        : "Not Configured"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Last updated: {formatTime(lastUpdated)}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Fallback Controls</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => simulateFailureMutation.mutate()}
                  disabled={simulateFailureMutation.isPending || !status?.isCloud}
                >
                  {simulateFailureMutation.isPending ? (
                    <span className="flex items-center">
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Simulating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      Simulate Cloud Failure
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => restoreConnectionMutation.mutate()}
                  disabled={restoreConnectionMutation.isPending || status?.isCloud}
                >
                  {restoreConnectionMutation.isPending ? (
                    <span className="flex items-center">
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Restoring...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Restore Cloud Connection
                    </span>
                  )}
                </Button>
              </div>
              
              <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground">
                <strong>Note:</strong> These controls allow you to test the database fallback mechanism. 
                Simulating a cloud database failure will cause the application to switch to the local PostgreSQL database.
                This allows your application to continue functioning even when the cloud database is unavailable.
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}