
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Edit2, Save, X, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserLayout from '@/components/layout/UserLayout';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    profileImage: '',
  });

  const [editData, setEditData] = useState(profileData);

  useEffect(() => {
    if (user) {
      const userData = {
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: '',
        address: '',
        emergencyContact: '',
        profileImage: user.avatar || '',
      };
      setProfileData(userData);
      setEditData(userData);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({
        fullName: editData.fullName,
        email: editData.email,
        phone: editData.phone,
      });
      
      setProfileData(editData);
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement actual image upload
      console.log('Uploading image:', file);
      toast({
        title: "Image uploaded",
        description: "Profile picture has been updated.",
      });
    }
  };

  return (
    <UserLayout
      pageTitle="My Profile"
      pageSubtitle="Manage your personal information and preferences"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-end">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-[#002c2b] hover:bg-[#003a37]">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#002c2b] hover:bg-[#003a37]">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.profileImage} />
                  <AvatarFallback className="text-lg eta-primary-text">
                    {profileData.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90">
                    <Camera className="h-4 w-4 text-primary-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profileData.fullName}</h2>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">Verified User</Badge>
                  <Badge variant="outline" className="eta-primary-text">Premium Member</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={editData.fullName}
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <span>{profileData.fullName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                {isEditing ? (
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editData.dateOfBirth}
                    onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(profileData.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={editData.address}
                  onChange={(e) => setEditData({...editData, address: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              {isEditing ? (
                <Input
                  id="emergencyContact"
                  value={editData.emergencyContact}
                  onChange={(e) => setEditData({...editData, emergencyContact: e.target.value})}
                  placeholder="Name - Phone Number"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.emergencyContact}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default Profile;
