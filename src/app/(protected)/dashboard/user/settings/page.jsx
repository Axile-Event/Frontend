"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Check, Save, User } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ProfileSkeleton } from "@/components/skeletons";

const UserSettings = () => {
  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    event_preferences: []
  });
  const [preferences, setPreferences] = useState([]);
  const [allEventTypes, setAllEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, profileRes] = await Promise.all([
          api.get("config/"),
          api.get("student/profile/")
        ]);

        if (configRes.data && configRes.data.event_types) {
          setAllEventTypes(configRes.data.event_types);
        }

        const profileData = profileRes.data.profile || profileRes.data;
        if (profileData) {
          setProfile(profileData);
          setPreferences(Array.isArray(profileData.event_preferences) 
            ? profileData.event_preferences 
            : []);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePreference = (value) => {
    setPreferences(prev => {
      if (prev.includes(value)) {
        return prev.filter(p => p !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.patch("student/profile/", {
        firstname: profile.firstname,
        lastname: profile.lastname,
        phone: profile.phone
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      await api.patch("student/profile/", {
        event_preferences: preferences
      });
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    } finally {
      setSavingPreferences(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-10 pt-0 md:pt-2">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1 text-white">Settings</h1>
        <p className="text-zinc-500 text-xs md:text-sm font-medium">Manage your personal information and event interests.</p>
      </div>

      {/* Profile Information */}
      <Card className="bg-zinc-900/50 border-border overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-5">
          <CardTitle className="text-lg font-bold text-white">Profile Information</CardTitle>
          <CardDescription className="text-zinc-500 text-xs">Update your account details and how others see you.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-rose-500/50">
                  <User className="w-16 h-16 md:w-20 md:h-20 text-gray-700 transition-colors group-hover:text-rose-500" />
                </div>
                <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl backdrop-blur-sm">
                  <span className="text-white text-[10px] font-bold">Change</span>
                </button>
              </div>
              <div className="text-center">
                <h4 className="text-white font-bold text-sm tracking-tight">{profile?.firstname} {profile?.lastname}</h4>
                <p className="text-zinc-500 text-[10px] font-bold mt-1">User Account</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 px-1">First Name</label>
                  <input 
                    type="text" 
                    value={profile?.firstname || ""} 
                    onChange={(e) => setProfile({...profile, firstname: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:border-rose-500 focus:outline-none transition-colors text-sm font-medium"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 px-1">Last Name</label>
                  <input 
                    type="text" 
                    value={profile?.lastname || ""} 
                    onChange={(e) => setProfile({...profile, lastname: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:border-rose-500 focus:outline-none transition-colors text-sm font-medium"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 px-1">Email Address</label>
                <input 
                  type="email" 
                  value={profile?.email || ""} 
                  readOnly
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-500 cursor-not-allowed text-sm font-medium"
                  placeholder="email@example.com"
                />
                <p className="text-[10px] text-zinc-600 px-1">Email cannot be changed.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 px-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={profile?.phone || ""} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:border-rose-500 focus:outline-none transition-colors text-sm font-medium"
                  placeholder="+234 ..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={savingProfile} 
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-10 px-6 rounded-lg shadow-lg shadow-rose-600/20 transition-all active:scale-95 text-xs"
                >
                  {savingProfile ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="mr-2 h-3.5 w-3.5" /> Save Profile</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-border">
        <CardHeader className="border-b border-white/5 pb-5">
          <CardTitle className="text-lg font-bold text-white">Event Preferences</CardTitle>
          <CardDescription className="text-zinc-500 text-xs">
            Select the types of events you are interested in better recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allEventTypes.map((type) => {
              const isSelected = preferences.includes(type.value);
              return (
                <motion.button
                  key={type.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePreference(type.value)}
                  className={`
                    relative flex items-center justify-center p-5 rounded-2xl border text-sm font-bold transition-all duration-300
                    ${isSelected 
                      ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20" 
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }
                  `}
                >
                  {type.label}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 p-1 bg-white/20 rounded-full"
                    >
                      <Check className="h-2.5 w-2.5" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <Button 
                onClick={handleSavePreferences} 
                disabled={savingPreferences}
                variant="outline"
                className="border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold h-10 px-6 rounded-lg text-xs"
            >
              {savingPreferences && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Danger Zone */}
      <Card className="bg-red-500/5 border-red-500/10">
           <CardHeader className="pb-4">
             <CardTitle className="text-base font-bold text-red-500">Danger Zone</CardTitle>
             <CardDescription className="text-red-500/60 text-xs">Irreversible account actions. Be careful.</CardDescription>
           </CardHeader>
           <CardContent className="pb-6">
              <Button variant="destructive" disabled className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 font-bold h-10 px-6 rounded-lg opacity-50 cursor-not-allowed text-xs">
                 Delete Account (Coming Soon)
              </Button>
           </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;

