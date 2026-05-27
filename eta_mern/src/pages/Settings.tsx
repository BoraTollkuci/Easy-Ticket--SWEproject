import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Settings = () => {
  return (
    <AdminLayout
      pageTitle="Settings"
      pageSubtitle="Manage system preferences and configuration"
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API & Integration</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Manage your system-wide preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" defaultValue="Swift Route Transit Co." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select defaultValue="america-new_york">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-new_york">America/New York (UTC-5)</SelectItem>
                    <SelectItem value="america-chicago">America/Chicago (UTC-6)</SelectItem>
                    <SelectItem value="america-denver">America/Denver (UTC-7)</SelectItem>
                    <SelectItem value="america-los_angeles">America/Los Angeles (UTC-8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable the customer-facing application
                  </p>
                </div>
                <Switch id="maintenance" />
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system and user notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-bookings">New Bookings</Label>
                      <Switch id="new-bookings" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cancellations">Cancellations</Label>
                      <Switch id="cancellations" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="schedule-changes">Schedule Changes</Label>
                      <Switch id="schedule-changes" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="low-inventory">Low Ticket Inventory</Label>
                      <Switch id="low-inventory" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">System Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="system-errors">System Errors</Label>
                      <Switch id="system-errors" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="api-failures">API Integration Failures</Label>
                      <Switch id="api-failures" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="security-alerts">Security Alerts</Label>
                      <Switch id="security-alerts" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notification-email">Notification Email Address</Label>
                  <Input id="notification-email" type="email" defaultValue="admin@swiftroute.com" />
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Notification Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Manage API keys and integration endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex space-x-2">
                    <Input id="api-key" defaultValue="sk_test_4eC39HqLyjWDarjtT1zdp7dc" type="password" className="flex-1" />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This key provides access to your API. Keep it secure.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input id="webhook-url" defaultValue="https://api.swiftroute.com/webhooks/incoming" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Integration Settings</h3>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="payment-gateway">Payment Gateway Integration</Label>
                        <p className="text-sm text-muted-foreground">Connect to payment processing service</p>
                      </div>
                      <Switch id="payment-gateway" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="mobile-sync">Mobile App Synchronization</Label>
                        <p className="text-sm text-muted-foreground">Push updates to mobile applications</p>
                      </div>
                      <Switch id="mobile-sync" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="analytics">Analytics Integration</Label>
                        <p className="text-sm text-muted-foreground">Send data to analytics platform</p>
                      </div>
                      <Switch id="analytics" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save API Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage administrator accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border border-border">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-muted/50">
                        <td className="p-3 border-t border-border">Admin User</td>
                        <td className="p-3 border-t border-border">admin@swiftroute.com</td>
                        <td className="p-3 border-t border-border">Administrator</td>
                        <td className="p-3 border-t border-border">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                        </td>
                        <td className="p-3 border-t border-border text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-3 border-t border-border">Jane Smith</td>
                        <td className="p-3 border-t border-border">jane@swiftroute.com</td>
                        <td className="p-3 border-t border-border">Manager</td>
                        <td className="p-3 border-t border-border">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                        </td>
                        <td className="p-3 border-t border-border text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-3 border-t border-border">John Miller</td>
                        <td className="p-3 border-t border-border">john@swiftroute.com</td>
                        <td className="p-3 border-t border-border">Agent</td>
                        <td className="p-3 border-t border-border">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Invited</span>
                        </td>
                        <td className="p-3 border-t border-border text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Settings;
