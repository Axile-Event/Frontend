"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Check, Save } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ProfileSkeleton } from "@/components/skeletons";

const StudentSettings = () => {
  const [preferences, setPreferences] = useState([]);
  const [allEventTypes, setAllEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        if (profileData && profileData.event_preferences) {
          // Ensure it's an array
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("student/profile/", {
        event_preferences: preferences
      });
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your experience and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Preferences</CardTitle>
          <CardDescription>
            Select the types of events you are interested in better recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allEventTypes.map((type) => {
              const isSelected = preferences.includes(type.value);
              return (
                <motion.button
                  key={type.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePreference(type.value)}
                  className={`
                    relative flex items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? "bg-primary/20 border-primary text-primary" 
                      : "bg-white/5 border-gray-700/60 text-gray-400 hover:border-gray-600/80 hover:bg-white/10"
                    }
                  `}
                >
                  {type.label}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-700/40">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Settings Placeholder */}
      <Card>
           <CardHeader>
             <CardTitle className="text-red-500">Danger Zone</CardTitle>
             <CardDescription>Irreversible account actions.</CardDescription>
           </CardHeader>
           <CardContent>
              <Button variant="destructive" disabled className="w-full sm:w-auto opacity-70 cursor-not-allowed">
                 Delete Account (Coming Soon)
              </Button>
           </CardContent>
      </Card>
    </div>
  );
};

export default StudentSettings;
