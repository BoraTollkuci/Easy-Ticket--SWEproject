import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusmanAPI, RoutesAPI } from '@/services/api';
import { Route } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash, Copy, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';

interface BusmanFormData {
  fullName: string;
  email: string;
  phone: string;
  routeId: string;
}

const AdminBusmen: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBusman, setEditingBusman] = useState<any | null>(null);
  const [formData, setFormData] = useState<BusmanFormData>({
    fullName: '',
    email: '',
    phone: '',
    routeId: ''
  });
  const [createdBusmanData, setCreatedBusmanData] = useState<any | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  // Fetch data
  const { data: busmen = [], isLoading: isLoadingBusmen } = useQuery({
    queryKey: ['admin-busmen'],
    queryFn: () => BusmanAPI.getAll()
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: RoutesAPI.getAll
  });

  // Mutations
  const createBusmanMutation = useMutation({
    mutationFn: BusmanAPI.create,
    onSuccess: (data) => {
      setCreatedBusmanData(data);
      setShowCredentials(true);
      queryClient.invalidateQueries({ queryKey: ['admin-busmen'] });
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'Busman created successfully. Credentials are displayed below.' 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create busman' 
      });
    }
  });

  const updateBusmanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => BusmanAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-busmen'] });
      setIsEditDialogOpen(false);
      setEditingBusman(null);
      resetForm();
      toast({ title: 'Success', description: 'Busman updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update busman' });
    }
  });

  const deleteBusmanMutation = useMutation({
    mutationFn: BusmanAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-busmen'] });
      toast({ title: 'Success', description: 'Busman deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete busman' });
    }
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      routeId: ''
    });
  };

  const handleCreate = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.routeId) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    createBusmanMutation.mutate(formData);
  };

  const handleEdit = (busman: any) => {
    setEditingBusman(busman);
    setFormData({
      fullName: busman.fullName,
      email: busman.email,
      phone: busman.phone,
      routeId: busman.assignedRoute?._id || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.routeId) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    if (editingBusman) {
      updateBusmanMutation.mutate({
        id: editingBusman._id,
        data: {
          fullName: formData.fullName,
          phone: formData.phone,
          routeId: formData.routeId
        }
      });
    }
  };

  const handleDelete = (busmanId: string) => {
    if (window.confirm('Are you sure you want to delete this busman?')) {
      deleteBusmanMutation.mutate(busmanId);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ 
      title: 'Copied', 
      description: 'Credential copied to clipboard' 
    });
  };

  if (isLoadingBusmen) {
    return (
      <AdminLayout pageTitle="Manage Busmen" pageSubtitle="Create and manage bus drivers">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002c2b]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Manage Busmen" pageSubtitle="Create and manage bus drivers">
      <div className="space-y-6">
        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#002c2b] hover:bg-[#003a37]">
              <Plus className="h-4 w-4 mr-2" />
              Create New Busman
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Busman</DialogTitle>
              <DialogDescription>
                Add a new busman to the system and assign them to a route
              </DialogDescription>
            </DialogHeader>

            {!showCredentials ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="routeId">Assign Route</Label>
                  <Select value={formData.routeId} onValueChange={(value) => setFormData({ ...formData, routeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route: Route) => (
                        <SelectItem key={route._id} value={route._id}>
                          {route.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setShowCredentials(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createBusmanMutation.isPending}
                    className="bg-[#002c2b] hover:bg-[#003a37]"
                  >
                    {createBusmanMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    Busman created successfully! Share these credentials with the busman.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <div className="flex gap-2">
                      <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">
                        {createdBusmanData?.credentials?.email}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(createdBusmanData?.credentials?.email)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Password (Temporary)</p>
                    <div className="flex gap-2">
                      <code className="flex-1 p-2 bg-white rounded border text-sm font-mono break-all">
                        {createdBusmanData?.credentials?.password}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(createdBusmanData?.credentials?.password)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 italic">
                    ⚠️ {createdBusmanData?.credentials?.message}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setShowCredentials(false);
                    resetForm();
                    setCreatedBusmanData(null);
                  }}
                  className="w-full bg-[#002c2b] hover:bg-[#003a37]"
                >
                  Done
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Busman</DialogTitle>
              <DialogDescription>
                Update busman information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input
                  id="edit-fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-routeId">Assign Route</Label>
                <Select value={formData.routeId} onValueChange={(value) => setFormData({ ...formData, routeId: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route: Route) => (
                      <SelectItem key={route._id} value={route._id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingBusman(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updateBusmanMutation.isPending}
                  className="bg-[#002c2b] hover:bg-[#003a37]"
                >
                  {updateBusmanMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Busmen Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Busmen</CardTitle>
            <CardDescription>
              Manage and monitor all bus drivers in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {busmen.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No busmen found. Create the first busman to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assigned Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(busmen as any[]).map((busman) => (
                      <TableRow key={busman._id}>
                        <TableCell className="font-semibold">{busman.fullName}</TableCell>
                        <TableCell className="font-mono text-sm">{busman.email}</TableCell>
                        <TableCell>{busman.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {busman.assignedRoute?.name || 'Not assigned'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={busman.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {busman.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(busman)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(busman._id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBusmen;
