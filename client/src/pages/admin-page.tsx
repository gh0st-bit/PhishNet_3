import { useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseStatusPanel } from '@/components/admin/database-status';
import { Settings, Database, Users, Server, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('database');

  return (
    <AppLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage system settings, users, and infrastructure
          </p>
        </div>

        <Tabs defaultValue="database" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-[600px]">
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Database</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span>Infrastructure</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-6 mt-6">
            <h2 className="text-xl font-semibold">Database Management</h2>
            <div className="grid grid-cols-1 gap-6">
              <DatabaseStatusPanel />
              
              <Card>
                <CardHeader>
                  <CardTitle>Database Statistics</CardTitle>
                  <CardDescription>
                    View database usage and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Database statistics will be available in a future update.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6 mt-6">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>User Administration</CardTitle>
                <CardDescription>
                  Manage users and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management features will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="infrastructure" className="space-y-6 mt-6">
            <h2 className="text-xl font-semibold">Infrastructure Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>
                  Monitor system resources and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Infrastructure management features will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6 mt-6">
            <h2 className="text-xl font-semibold">Security Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>
                  Configure security settings and view audit logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Security settings will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}