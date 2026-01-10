"use client";

import React, { useState, useEffect } from 'react';
import api from '../../../../../lib/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  CreditCard, 
  Loader2, 
  Save,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  Landmark,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Select from '@/components/ui/custom-select';
import Loading from '@/components/ui/Loading';

export default function Settings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('security');
  const [isLoading, setIsLoading] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Bank State
  const [bankParams, setBankParams] = useState({
    bank_account_number: '',
    bank_name: '',
    account_name: '',
    bank_code: '', 
  });
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const [hasBankAccount, setHasBankAccount] = useState(false);

  // Loading States
  const [loadingBank, setLoadingBank] = useState(true);

  // Fetch Initial Data
  useEffect(() => {
    fetchBankAccount();
    fetchBanks();
  }, []);





  const fetchBanks = async () => {
    try {
        setLoadingBanks(true);
        // Attempt to fetch from backend proxy first, or fallback to hardcoded list if 404
        // Assuming backend might proxy Paystack's bank list
        const res = await api.get('/wallet/banks/').catch(() => null); 
        
        if (res && res.data && Array.isArray(res.data.data)) {
            setBanks(res.data.data);
        } else {
             // Fallback list of major Nigerian banks
             setBanks([
                { name: 'Access Bank', code: '044' },
                { name: 'Guaranty Trust Bank', code: '058' },
                { name: 'Zenith Bank', code: '057' },
                { name: 'United Bank for Africa', code: '033' },
                { name: 'First Bank of Nigeria', code: '011' },
                { name: 'FCMB', code: '214' },
                { name: 'Keystone Bank', code: '082' },
                { name: 'Sterling Bank', code: '232' },
                { name: 'Union Bank of Nigeria', code: '032' },
                { name: 'Wema Bank', code: '035' },
             ].sort((a,b) => a.name.localeCompare(b.name)));
        }
    } catch (error) {
        console.error("Failed to fetch banks", error);
    } finally {
        setLoadingBanks(false);
    }
  };

  const fetchBankAccount = async () => {
    try {
      setLoadingBank(true);
      const res = await api.get('/wallet/bank-account/');
      if (res.data) {
        setHasBankAccount(res.data.has_bank_account);
        if (res.data.has_bank_account) {
          setBankParams({
            bank_account_number: res.data.bank_account_number || '',
            bank_name: res.data.bank_name || '',
            account_name: res.data.account_name || '',
            bank_code: res.data.bank_code || '',
          });
        }
      }
    } catch (error) {
       // If 404 or 500, it likely means no bank account exists yet for this user.
       // We'll treat it as "no bank account" instead of a critical error.
       console.warn("Could not fetch bank account (might not exist yet):", error);
       setHasBankAccount(false);
    } finally {
      setLoadingBank(false);
    }
  };



  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
        await api.post('/change-password/', passwords);
        toast.success('Password changed successfully');
        setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
        toast.error(error.response?.data?.error || error.response?.data?.detail || 'Failed to change password');
    } finally {
        setIsLoading(false);
    }
  };

  const handleBankUpdate = async (e) => {
    e.preventDefault();
    if (!bankParams.account_name) {
        toast.error("Please verify account details first");
        return;
    }
    setIsLoading(true);
    try {
      await api.post('/wallet/bank-account/', bankParams);
      toast.success(hasBankAccount ? 'Bank account updated' : 'Bank account added successfully');
      setHasBankAccount(true);
    } catch (error) {
        // Handle validation errors specific to bank connection
        const errorData = error.response?.data;
        if (errorData?.bank_account_number) {
            toast.error(errorData.bank_account_number[0]);
        } else {
            toast.error(error.response?.data?.error || 'Failed to save bank details');
        }
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'banking', label: 'Bank Details', icon: Landmark },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-xs text-balance">Manage your organization profile, security, and payments.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 transition-all duration-200 text-[13px] font-bold border-b-2 ${
                isActive
                  ? 'text-rose-500 border-rose-600'
                  : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area - NO CARD STYLES */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="py-4"
        >


          {/* --- SECURITY TAB --- */}
          {activeTab === 'security' && (
             <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-white/5 rounded-lg">
                  <Lock className="w-4 h-4 text-rose-500" />
                </div>
                <h2 className="text-lg font-bold text-white">Security Settings</h2>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-5">
                  <PasswordInput 
                     label="Current password"
                     value={passwords.old_password}
                     onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
                     show={showOldPass}
                     toggleShow={() => setShowOldPass(!showOldPass)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <PasswordInput 
                          label="New password"
                          value={passwords.new_password}
                          onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                          show={showNewPass}
                          toggleShow={() => setShowNewPass(!showNewPass)}
                      />
                      <PasswordInput 
                          label="Confirm new password"
                          value={passwords.confirm_password}
                          onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                          show={showConfirmPass}
                          toggleShow={() => setShowConfirmPass(!showConfirmPass)}
                      />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button loading={isLoading} icon={<Lock className="w-4 h-4" />}>
                    Update Password
                  </Button>
                </div>
              </form>
             </div>
          )}

          {/* --- BANK DETAILS TAB --- */}
          {activeTab === 'banking' && (
             <div className="max-w-2xl">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/5 rounded-lg">
                      <Landmark className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Bank Details</h2>
                      <p className="text-xs text-gray-500 font-bold">Settlement account</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => router.push('/dashboard/org/payout')}
                    className="text-[10px] font-black text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors font-bold"
                  >
                    Wallet <ChevronRight className="w-3 h-3" />
                  </button>
               </div>

               {loadingBank ? (
                  <Loading />
               ) : (
                 <form onSubmit={handleBankUpdate} className="space-y-5">
                   <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-5">
                      <Select
                        label="Select bank"
                        value={bankParams.bank_code}
                        onChange={(value) => {
                          const selectedBank = banks.find(b => b.code === value);
                          setBankParams({ 
                            ...bankParams, 
                            bank_code: value,
                            bank_name: selectedBank ? selectedBank.name : ''
                          });
                        }}
                        options={banks.map(b => ({ value: b.code, label: b.name }))}
                        placeholder="Select your bank"
                      />

                      <InputGroup 
                          label="Account number" 
                          icon={<CreditCard className="w-3.5 h-3.5" />}
                          value={bankParams.bank_account_number}
                          onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                               setBankParams({ ...bankParams, bank_account_number: val });
                          }}
                          placeholder="0123456789"
                      />

                      <InputGroup 
                          label="Account name" 
                          icon={<User className="w-3.5 h-3.5" />}
                          value={bankParams.account_name}
                          onChange={(e) => setBankParams({ ...bankParams, account_name: e.target.value })}
                          placeholder="Beneficiary name"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button loading={isLoading} icon={<Save className="w-3.5 h-3.5" />}>
                         {hasBankAccount ? 'Update Details' : 'Add Bank Account'}
                      </Button>
                    </div>
                 </form>
               )}
             </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* --- Reusable Components --- */

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

function PasswordInput({ label, value, onChange, show, toggleShow }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500">
        {label}
      </label>
      <div className="relative group">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-rose-500 transition-colors w-3.5 h-3.5" />
        <input 
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200"
        />
        <button 
          type="button" 
          onClick={toggleShow} 
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function Button({ children, loading, icon, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto min-w-[160px]"
        >
            {loading ? <Loader2 className="animate-spin w-4 h-4 text-white" /> : icon}
            {children}
        </button>
    );
}