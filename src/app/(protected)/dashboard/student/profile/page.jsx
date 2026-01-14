"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, User, Mail, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    Preferred_name: "",
    Date_of_birth: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("student/profile/");
      const data = response.data.profile || response.data;
      setProfile(data);
      setFormData({
        Preferred_name: data.Preferred_name || "",
        Date_of_birth: data.Date_of_birth || "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Prepare payload: convert empty strings to null for optional fields like Date_of_birth
    const payload = {
        Preferred_name: formData.Preferred_name,
        Date_of_birth: formData.Date_of_birth || null // Send null if empty string
    };

    try {
      await api.patch("student/profile/", payload);
      toast.success("Profile updated successfully");
      setProfile(prev => ({...prev, ...payload}));
    } catch (error) {
      console.error("Profile update error:", error.response?.data || error);
      // Try to extract a meaningful error message
      const errorData = error.response?.data;
      let errorMsg = "Failed to update profile";
      
      if (errorData) {
          if (typeof errorData === 'string') errorMsg = errorData;
          else if (errorData.error) errorMsg = errorData.error;
          else if (errorData.detail) errorMsg = errorData.detail;
          else if (errorData.Date_of_birth) errorMsg = `Date of Birth: ${errorData.Date_of_birth.join(', ')}`;
          else if (errorData.Preferred_name) errorMsg = `Preferred Name: ${errorData.Preferred_name.join(', ')}`;
      }
      
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account details.</p>
      </div>

      <Card className="border-gray-700/60">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Basic information about your student account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name</Label>
                <div className="relative">
                   <Input 
                      id="firstname" 
                      value={profile?.firstname || profile?.Firstname || ""} 
                      disabled 
                      className="pl-9 bg-white/5" 
                   />
                   <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastname">Last Name</Label>
                <div className="relative">
                   <Input 
                      id="lastname" 
                      value={profile?.lastname || profile?.Lastname || ""} 
                      disabled 
                      className="pl-9 bg-white/5" 
                   />
                   <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                   <Input 
                      id="email" 
                      value={profile?.email || profile?.Email || ""} 
                      disabled 
                      className="pl-9 bg-white/5" 
                   />
                   <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_name">Preferred Name</Label>
                 <Input 
                    id="preferred_name" 
                    value={formData.Preferred_name} 
                    onChange={(e) => setFormData({...formData, Preferred_name: e.target.value})}
                    placeholder="E.g. Johnny"
                 />
                 <p className="text-[10px] text-muted-foreground">This name will be displayed on your dashboard.</p>
              </div>

               <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                 <div className="relative">
                    <Input 
                        id="dob" 
                        type="date"
                        value={formData.Date_of_birth} 
                        onChange={(e) => setFormData({...formData, Date_of_birth: e.target.value})}
                        className="pl-9"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                 </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentProfile;
