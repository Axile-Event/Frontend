"use client";

import React, { useState, useEffect } from 'react';
import api from '../../../../../lib/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Save,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProfileSkeleton } from '@/components/skeletons';
import PinPromptModal from '@/components/PinPromptModal';
import { hasPinSet } from '@/lib/pinPrompt';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState(null);

  // Profile State
  const [profile, setProfile] = useState({
    Organization_Name: '',
    Email: '',
    Phone: '',
  });

  // Fetch Initial Data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get('/organizer/profile/');
      if (res.data.Org_profile) {
        setProfile(res.data.Org_profile);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const payload = {
      email: profile.Email,
      Organization_Name: profile.Organization_Name,
      Phone: profile.Phone
    };

    // Check if PIN is set
    if (!hasPinSet()) {
      setPendingProfileData(payload);
      setShowPinPrompt(true);
      return;
    }

    // Require PIN verification before updating
    setPendingProfileData(payload);
    setShowPinPrompt(true);
  };

  const executeProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await api.post('/organizer/profile/', pendingProfileData);
      toast.success('Profile updated successfully');
      setPendingProfileData(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingProfile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-gray-400 text-xs text-balance">Manage your organization's public identity and contact information.</p>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="py-4"
        >
          <div className="max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
               {/* Profile Card Header */}
               <div className="w-full md:w-1/3 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 text-center space-y-4 shadow-xl">
                  <div className="relative w-24 h-24 mx-auto">
                     <div className="w-full h-full bg-rose-600/10 rounded-full flex items-center justify-center border border-rose-500/20 shadow-inner">
                        <Building2 className="w-10 h-10 text-rose-500" />
                     </div>
                     <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-4 border-[#0A0A0A] shadow-lg">
                        <ShieldCheck className="w-3 h-3 text-white" />
                     </div>
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-white truncate px-2">{profile.Organization_Name || 'Organization'}</h3>
                     <p className="text-[10px] text-gray-500 font-bold mt-1">Verified organizer</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <div className="text-center">
                         <p className="text-xs text-gray-500 font-bold">Status</p>
                         <p className="text-sm font-bold text-emerald-500 mt-0.5 whitespace-nowrap">Active</p>
                      </div>
                      <div className="text-center border-l border-white/5">
                         <p className="text-xs text-gray-500 font-bold">Role</p>
                         <p className="text-sm font-bold text-gray-400 mt-0.5 whitespace-nowrap">Producer</p>
                      </div>
                  </div>
               </div>

               {/* Profile Form */}
               <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-white/5 rounded-lg">
                      <User className="w-4 h-4 text-rose-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Public Profile</h2>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-5">
                      <InputGroup 
                        label="Organization name" 
                        icon={<Building2 className="w-3.5 h-3.5" />}
                        value={profile.Organization_Name}
                        onChange={(e) => setProfile({ ...profile, Organization_Name: e.target.value })}
                        placeholder="Enter organization name"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputGroup 
                          label="Email address" 
                          icon={<Mail className="w-3.5 h-3.5" />}
                          value={profile.Email}
                          onChange={(e) => setProfile({ ...profile, Email: e.target.value })}
                          type="email"
                          placeholder="name@example.com"
                        />

                        <InputGroup 
                          label="Phone number" 
                          icon={<Phone className="w-3.5 h-3.5" />}
                          value={profile.Phone}
                          onChange={(e) => setProfile({ ...profile, Phone: e.target.value })}
                          type="tel"
                          placeholder="+234..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                       <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto min-w-[160px]"
                      >
                          {isLoading ? <Loader2 className="animate-spin w-4 h-4 text-white" /> : <Save className="w-3.5 h-3.5" />}
                          Save Changes
                      </button>
                    </div>
                  </form>
               </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* PIN Prompt Modal */}
      <PinPromptModal
        isOpen={showPinPrompt}
        onClose={() => {
          setShowPinPrompt(false);
          setPendingProfileData(null);
        }}
        onSuccess={() => {
          setShowPinPrompt(false);
          executeProfileUpdate();
        }}
        action="update profile information"
        requireSetup={true}
      />
    </div>
  );
}

function InputGroup({ label, icon, type = "text", value, onChange, placeholder, description }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-rose-500 transition-colors">
            {icon}
          </div>
        )}
        <input 
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 ${icon ? 'pl-11' : 'pl-4'} pr-4 text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200`}
        />
      </div>
      {description && <p className="text-[10px] text-gray-600 font-medium px-1">{description}</p>}
    </div>
  );
}