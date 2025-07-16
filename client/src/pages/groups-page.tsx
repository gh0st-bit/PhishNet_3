import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupForm from "@/components/groups/group-form";
import TargetForm from "@/components/groups/target-form";
import ImportCSV from "@/components/groups/import-csv";
import { Plus, Users, UserPlus, FileSpreadsheet, Trash2, Edit, Eye } from "lucide-react";

export default function GroupsPage() {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isAddingTarget, setIsAddingTarget] = useState(false);
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  
  const { data: groups } = useQuery({
    queryKey: ['/api/groups'],
  });

  const { data: targets, refetch: refetchTargets } = useQuery({
    queryKey: ['/api/groups', selectedGroup?.id, 'targets'],
    enabled: !!selectedGroup,
  });

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsCreatingGroup(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setIsCreatingGroup(true);
  };

  const handleViewGroup = (group) => {
    setSelectedGroup(group);
  };

  const handleAddTarget = () => {
    setIsAddingTarget(true);
  };

  const handleImportCSV = () => {
    setIsImportingCSV(true);
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Target Groups</h1>
        <Button onClick={handleAddGroup}>
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Targets</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups && groups.length > 0 ? (
                    groups.map((group) => (
                      <TableRow key={group.id} className={selectedGroup?.id === group.id ? "bg-secondary/50" : ""}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{group.targetCount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewGroup(group)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditGroup(group)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No groups found. Create your first target group.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Group Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>
                {selectedGroup 
                  ? `${selectedGroup.name} (${targets?.length || 0} targets)` 
                  : "Select a group to view targets"}
              </CardTitle>
              {selectedGroup && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleImportCSV}>
                    <FileSpreadsheet className="mr-1 h-4 w-4" /> Import CSV
                  </Button>
                  <Button size="sm" onClick={handleAddTarget}>
                    <UserPlus className="mr-1 h-4 w-4" /> Add Target
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedGroup ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targets && targets.length > 0 ? (
                      targets.map((target) => (
                        <TableRow key={target.id}>
                          <TableCell>
                            {target.firstName} {target.lastName}
                          </TableCell>
                          <TableCell>{target.email}</TableCell>
                          <TableCell>{target.position}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No targets in this group yet. Add targets or import from CSV.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Group Selected</h3>
                  <p className="text-muted-foreground mt-1">
                    Select a group from the list to view and manage targets
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Group Dialog */}
      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? "Edit Group" : "Create Group"}
            </DialogTitle>
          </DialogHeader>
          <GroupForm 
            group={selectedGroup} 
            onClose={() => setIsCreatingGroup(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Add Target Dialog */}
      <Dialog open={isAddingTarget} onOpenChange={setIsAddingTarget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Target to {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <TargetForm 
            groupId={selectedGroup?.id} 
            onClose={() => {
              setIsAddingTarget(false);
              refetchTargets();
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={isImportingCSV} onOpenChange={setIsImportingCSV}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Targets from CSV</DialogTitle>
          </DialogHeader>
          <ImportCSV 
            groupId={selectedGroup?.id} 
            onClose={() => {
              setIsImportingCSV(false);
              refetchTargets();
            }} 
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
