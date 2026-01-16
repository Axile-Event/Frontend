"use client";

import React, { useState, useEffect, useRef } from 'react';
import api from '../../../../../lib/axios';
import useAuthStore from '@/store/authStore';
import { hasPinSet, storePinLocally, updateLocalPin } from '@/lib/pinPrompt';
import PinPromptModal from '@/components/PinPromptModal';

// Secure backend proxy endpoints
const NUBADI_BANKS_URL = '/api/nubadi-banks';
const NUBADI_VERIFY_URL = '/api/nubadi-verify';
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
import { ProfileSkeleton } from '@/components/skeletons';

export default function Settings() {
  const router = useRouter();
  const email = useAuthStore((s) => s.user?.email);
  const [activeTab, setActiveTab] = useState('security');
  const [isLoading, setIsLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  
  // PIN prompt modal state
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'password' or 'bank'

  const [setPinValue, setSetPinValue] = useState('');

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
  const [verifyingAccount, setVerifyingAccount] = useState(false);

  const [hasBankAccount, setHasBankAccount] = useState(false);

  // Loading States
  const [loadingBank, setLoadingBank] = useState(true);

  // Fetch Initial Data
  useEffect(() => {
    fetchBankAccount();
    fetchBanks();
    fetchPinStatus();
  }, []);

  // Fetch PIN status from API (source of truth)
  const fetchPinStatus = async () => {
    try {
      const res = await api.get('/organizer/profile/');
      const profile = res.data.Org_profile || res.data;
      // Use API's has_pin as the source of truth
      if (profile.has_pin === true) {
        setHasPin(true);
      } else {
        // Fallback to localStorage check
        setHasPin(hasPinSet());
      }
    } catch (error) {
      console.error('Failed to fetch profile for PIN status:', error);
      // Fallback to localStorage check
      setHasPin(hasPinSet());
    }
  };





  // Fetch banks from secure backend
  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const res = await fetch(NUBADI_BANKS_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBanks(data.map(b => ({ name: b.name, code: b.code })));
      } else {
        setBanks([]);
      }
    } catch (error) {
      console.error('Failed to fetch banks from backend', error);
      setBanks([]);
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
    
    // Check if PIN is set, if not require setup
    if (!hasPinSet()) {
      setPendingAction('password');
      setShowPinPrompt(true);
      return;
    }
    
    // If PIN is set, prompt for PIN
    setPendingAction('password');
    setShowPinPrompt(true);
  };
  
  const executePasswordChange = async () => {
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

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Unable to detect your email. Please re-login.');
      return;
    }
    if (!setPinValue || setPinValue.trim().length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    setPinLoading(true);
    try {
      try {
        await api.post('/pin/', { Email: email, pin: setPinValue });
      } catch (apiErr) {
        const emailErr = apiErr?.response?.data?.Email?.[0];
        const alreadyExists =
          typeof emailErr === 'string' && emailErr.toLowerCase().includes('already exists');

        if (!alreadyExists) throw apiErr;
        toast.success('PIN already exists for this account');
      }

      await storePinLocally(setPinValue);
      setHasPin(true);
      setSetPinValue('');
      toast.success('PIN set successfully');
    } catch (error) {
      toast.error(error.response?.data?.Message || error.response?.data?.error || 'Failed to set PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const handleForgotPin = async () => {
    if (!email) {
      toast.error('Unable to detect your email. Please re-login.');
      return;
    }
    setPinLoading(true);
    try {
      await api.post('/forgot-pin/', { Email: email });
      toast.success('PIN reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.Message || error.response?.data?.error || 'Failed to send PIN reset link');
    } finally {
      setPinLoading(false);
    }
  };

  const handleBankUpdate = async (e) => {
    e.preventDefault();
    if (!bankParams.account_name) {
        toast.error("Please verify account details first");
        return;
    }
    
    // Check if PIN is set, if not require setup
    if (!hasPinSet()) {
      setPendingAction('bank');
      setShowPinPrompt(true);
      return;
    }
    
    // If PIN is set, prompt for PIN
    setPendingAction('bank');
    setShowPinPrompt(true);
  };
  
  const executeBankUpdate = async () => {
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
   
  // Secure verify API
  const verifyBankAccount = async (account_number, bank_code) => {
    setVerifyingAccount(true);
    try {
      const url = `${NUBADI_VERIFY_URL}?account_number=${account_number}&bank_code=${bank_code}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Verification failed');
      const data = await res.json();
      if (data.account_name) {
        setBankParams(prev => ({ ...prev, account_name: data.account_name }));
        toast.success('Account name detected');
      } else {
        setBankParams(prev => ({ ...prev, account_name: '' }));
        toast.error('Could not detect account name');
      }
    } catch (error) {
      setBankParams(prev => ({ ...prev, account_name: '' }));
      toast.error('Bank verification failed');
    } finally {
      setVerifyingAccount(false);
    }
  };
  
  const tabs = [
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'banking', label: 'Bank Details', icon: Landmark },
  ];
  
  // PIN success handler
  const handlePinSuccess = () => {
    if (pendingAction === 'password') {
      executePasswordChange();
    } else if (pendingAction === 'bank') {
      executeBankUpdate();
    }
    setPendingAction(null);
  };

  return (
    <>
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

              <div className="mt-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-white/5 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">PIN Protection</h2>
                    <p className="text-xs text-gray-500 font-bold">Protect Overview, Profile, Settings, and Wallet/Payout</p>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-8">
                  {/* Set PIN */}
                  {!hasPin ? (
                    <form onSubmit={handleSetPin} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">Set a PIN</p>
                        <span className="text-[10px] font-black text-gray-500">OPTIONAL</span>
                      </div>
                      <OtpPinInput
                        label="PIN"
                        value={setPinValue}
                        onChange={setSetPinValue}
                        disabled={pinLoading}
                      />
                      <div className="flex justify-end">
                        <Button loading={pinLoading} icon={<ShieldCheck className="w-4 h-4" />}>Set PIN</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">PIN</p>
                        <p className="text-xs text-gray-500 font-bold mt-1">Your PIN is already set.</p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-500">PIN SET</span>
                    </div>
                  )}

                  {/* Forgot PIN */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Forgot PIN</p>
                      <p className="text-xs text-gray-500 font-bold mt-1">Send a PIN reset link to your email.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleForgotPin}
                      disabled={pinLoading}
                      className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors disabled:opacity-50"
                    >
                      {pinLoading ? 'Sending...' : 'Forgot PIN?'}
                    </button>
                  </div>
                </div>
              </div>
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
                    className="text-[10px] font-black text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    Wallet <ChevronRight className="w-3 h-3" />
                  </button>
               </div>

               {loadingBank ? (
                  <ProfileSkeleton />
               ) : (
                 <form onSubmit={handleBankUpdate} className="space-y-5">
                   <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-5">
                      <Select
                        label="Select bank"
                        value={bankParams.bank_code}
                        onChange={(value) => {
                          const selectedBank = banks.find(b => b.code === value);
                          setBankParams(prev => ({
                            ...prev,
                            bank_code: value,
                            bank_name: selectedBank ? selectedBank.name : ''
                          }));
                          // Trigger verification if account number is present
                          if (bankParams.bank_account_number.length === 10) {
                            verifyBankAccount(bankParams.bank_account_number, value);
                          }
                        }}
                        options={banks.map(b => ({ value: b.code, label: b.name }))}
                        placeholder="Select your bank"
                        searchable={true}
                      />

                      <InputGroup
                        label="Account number"
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        value={bankParams.bank_account_number}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setBankParams(prev => ({ ...prev, bank_account_number: val }));
                          // Trigger verification if bank is selected
                          if (val.length === 10 && bankParams.bank_code) {
                            verifyBankAccount(val, bankParams.bank_code);
                          }
                        }}
                        placeholder="0123456789"
                      />

                      <InputGroup
                        label="Account name"
                        icon={<User className="w-3.5 h-3.5" />}
                        value={bankParams.account_name}
                        onChange={() => {}}
                        placeholder="Beneficiary name"
                        type="text"
                        description={verifyingAccount ? 'Verifying...' : ''}
                        readOnly={true}
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
    
    {/* PIN Prompt Modal */}
    <PinPromptModal
      isOpen={showPinPrompt}
      onClose={() => {
        setShowPinPrompt(false);
        setPendingAction(null);
      }}
      onSuccess={handlePinSuccess}
      action={pendingAction === 'password' ? 'change your password' : 'update bank details'}
      requireSetup={true}
    />
    </>
  );
}

/* --- Reusable Components --- */

function InputGroup({ label, icon, type = "text", value, onChange, placeholder, description, readOnly = false }) {
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
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full bg-white/2 border border-white/5 rounded-xl py-3 ${icon ? 'pl-11' : 'pl-4'} pr-4 text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200`}
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
          className="w-full bg-white/2 border border-white/5 rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200"
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
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto min-w-40"
        >
            {loading ? <Loader2 className="animate-spin w-4 h-4 text-white" /> : icon}
            {children}
        </button>
    );
}

function OtpPinInput({ label, value, onChange, disabled = false }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length: 4 }, (_, i) => value?.[i] || "");

  const setAtIndex = (index, nextDigit) => {
    const next = digits.slice();
    next[index] = nextDigit;
    onChange(next.join(""));
  };

  const handleChange = (index, raw) => {
    if (disabled) return;
    const onlyDigits = (raw || "").replace(/\D/g, "");
    if (!onlyDigits) {
      setAtIndex(index, "");
      return;
    }

    // If user pasted/typed multiple digits into one box, distribute them.
    const chars = onlyDigits.slice(0, 4 - index).split("");
    const next = digits.slice();
    chars.forEach((ch, offset) => {
      next[index + offset] = ch;
    });
    onChange(next.join(""));

    const nextIndex = Math.min(index + chars.length, 3);
    inputsRef.current[nextIndex]?.focus?.();
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;
    if (e.key === "Backspace") {
      if (digits[index]) {
        setAtIndex(index, "");
        return;
      }
      if (index > 0) {
        inputsRef.current[index - 1]?.focus?.();
        setAtIndex(index - 1, "");
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus?.();
    }
    if (e.key === "ArrowRight" && index < 3) {
      inputsRef.current[index + 1]?.focus?.();
    }
  };

  const handlePaste = (index, e) => {
    if (disabled) return;
    const text = e.clipboardData?.getData("text") || "";
    const onlyDigits = text.replace(/\D/g, "").slice(0, 4);
    if (!onlyDigits) return;
    e.preventDefault();
    const chars = onlyDigits.split("");
    const next = digits.slice();
    for (let i = 0; i < 4; i++) next[i] = chars[i] || "";
    onChange(next.join(""));
    inputsRef.current[Math.min(chars.length - 1, 3)]?.focus?.();
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
        {label}
      </label>

      <div className="flex items-center gap-2">
        {digits.map((d, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={1}
            value={d}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? (e) => handlePaste(index, e) : undefined}
            className="w-12 h-12 bg-white/2 border border-white/5 rounded-xl text-white text-center text-lg tracking-widest focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200"
          />
        ))}
      </div>

      <p className="text-[10px] text-gray-600 font-medium px-1">4 digits only</p>
    </div>
  );
}