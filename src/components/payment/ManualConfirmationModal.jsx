import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, CheckCircle2, Landmark, Copy, Check, Info, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import CustomDropdown from "@/components/ui/CustomDropdown";
import useTempBookingStore from "@/store/tempBookingStore";
import { motion, AnimatePresence } from "framer-motion";

const ManualConfirmationModal = ({
  isOpen,
  onClose,
  totalAmount,
  bookingId: propBookingId,
  paymentReference,
  bankDetails,
}) => {
  const { bookingId: storedBookingId } = useTempBookingStore();
  const router = useRouter();
  
  // Normalize and decode booking ID for backend calls
  const rawBookingId = propBookingId || storedBookingId;
  const bookingId = rawBookingId ? decodeURIComponent(rawBookingId) : null;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [banks, setBanks] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [formData, setFormData] = useState({
    accountName: "",
    bankCode: "",
    accountNumber: "",
    amount: totalAmount || "",
    receipt: null,
  });

  // Use bankDetails passed as prop, with fallback defaults
  const payeeDetails = bankDetails || {
    accountName: "Axile solution limited",
    accountNumber: "1311804312",
    bankName: "Zenith bank",
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(payeeDetails.accountNumber);
    setCopiedAccount(true);
    toast.success("Account copied!");
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  useEffect(() => {
    if (isOpen && !bookingId) {
      setBookingError("No booking ID found. Please try booking again.");
    } else {
      setBookingError(null);
    }
  }, [isOpen, bookingId]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await api.get("/bank/list/");
        const sortedBanks = (response.data.data || []).sort((a, b) => a.name.localeCompare(b.name));
        setBanks(sortedBanks);
      } catch (error) {
        console.error("Failed to fetch banks:", error);
      }
    };
    if (isOpen) fetchBanks();
  }, [isOpen]);

  useEffect(() => {
    const verifyAccount = async () => {
      if (formData.accountNumber.length === 10 && formData.bankCode) {
        setVerifying(true);
        try {
          const response = await api.post("/bank/verify/", {
            account_number: formData.accountNumber,
            bank_code: formData.bankCode,
          });
          if (response.data?.data?.account_name) {
             setFormData(prev => ({ ...prev, accountName: response.data.data.account_name }));
             toast.success("Account verified successfully");
          } else {
             throw new Error("No name found");
          }
        } catch (error) {
          setFormData(prev => ({ ...prev, accountName: "" }));
          toast.error("Account verification failed");
        } finally {
          setVerifying(false);
        }
      }
    };
    verifyAccount();
  }, [formData.accountNumber, formData.bankCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.receipt) return toast.error("Please upload your receipt");
    setLoading(true);
    try {
      const bank = banks.find(b => b.code === formData.bankCode);
      const nameParts = (formData.accountName || "Unknown User").split(" ");
      
      const payload = new FormData();
      payload.append("booking_id", bookingId);
      if (paymentReference) {
        payload.append("reference", paymentReference);
      }
      payload.append("account_name", formData.accountName || "Unknown");
      payload.append("account_number", formData.accountNumber);
      if (bank) payload.append("bank_name", bank.name);
      payload.append("amount_sent", formData.amount);
      payload.append("sent_at", new Date().toISOString());
      
      payload.append("Firstname", nameParts[0] || "Unknown");
      payload.append("Lastname", nameParts.slice(1).join(" ") || "User");
      
      if (formData.receipt) {
        payload.append("payment_receipt", formData.receipt);
      }

      await api.post("/tickets/confirm-payment/", payload);
      setSuccess(true);
      setFormData({
        accountName: "",
        bankCode: "",
        accountNumber: "",
        amount: totalAmount || "",
        receipt: null,
      });
      toast.success("Payment submitted successfully! Redirecting to dashboard...");
      setTimeout(() => { 
        setSuccess(false); 
        onClose(); 
        router.push("/dashboard/user");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-[0_0_80px_rgba(225,29,72,0.15)] flex flex-col max-h-[90vh] relative overflow-hidden">
        
        {/* Dynamic Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-rose-600/10 flex items-center justify-center">
                <CheckCircle2 className="text-rose-600" size={16} />
             </div>
             <div>
               <h2 className="text-lg font-bold tracking-tight">Confirm Payment</h2>
               <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Verification Phase</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-full text-gray-400 transition-all active:scale-90">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar space-y-8">
          {success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-12 text-center space-y-6">
              <div className="w-24 h-24 bg-rose-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(225,29,72,0.4)]">
                 <Check className="text-white" size={48} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-tighter">SUBMITTED!</h3>
                <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[240px] mx-auto">
                    Verification is in progress. Check your email for your tickets within 2 hours.
                </p>
              </div>
              <Button onClick={onClose} className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold">CLOSE VIEW</Button>
            </motion.div>
          ) : bookingError ? (
             <div className="py-12 text-center space-y-6">
                <ShieldAlert className="text-rose-500 mx-auto" size={48} />
                <p className="text-sm text-gray-400 font-medium">{bookingError}</p>
                <Button onClick={onClose} variant="outline" className="w-full rounded-2xl h-12">GO BACK</Button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Payee Info (Simplified) */}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-5">
                 <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                       <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">RECEIVING ACCOUNT</span>
                       <p className="text-sm font-bold leading-none">{payeeDetails.accountName}</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">BANK NAME</span>
                       <p className="text-xs font-bold leading-none">{payeeDetails.bankName}</p>
                    </div>
                 </div>

                 <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-2xl border border-white/5 relative group">
                    <div className="space-y-1">
                       <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">ACCOUNT NUMBER</span>
                       <p className="text-lg font-mono font-black tracking-[0.2em]">{payeeDetails.accountNumber}</p>
                    </div>
                    <button type="button" onClick={handleCopyAccountNumber} className="flex items-center justify-center gap-2 w-full p-2.5 bg-white/5 hover:bg-rose-600 text-gray-400 hover:text-white rounded-xl transition-all active:scale-95 text-[10px] font-bold uppercase tracking-widest">
                       {copiedAccount ? <Check size={14} /> : <Copy size={14} />}
                       {copiedAccount ? "COPIED" : "COPY ACCOUNT"}
                    </button>
                 </div>

                 <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-400 transition-colors">EXACT AMOUNT TO PAY</span>
                    <span className="text-base font-black text-white">₦{Number(totalAmount).toLocaleString()}</span>
                 </div>
              </div>

              {/* Form Fields (Vertical Stack) */}
              <div className="space-y-6">
                 <CustomDropdown
                    label="YOUR BANK"
                    options={banks.map(b => ({ value: b.code, label: b.name, icon: Landmark }))}
                    value={formData.bankCode}
                    onChange={val => setFormData({ ...formData, bankCode: val, accountName: "" })}
                    placeholder="Select Bank"
                    searchable={true}
                 />

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 tracking-[0.2em] ml-1">YOUR ACCOUNT NUMBER</label>
                    <div className="relative">
                      <Input
                        maxLength={10}
                        value={formData.accountNumber}
                        onChange={e => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, ""), accountName: "" })}
                        className="h-12 bg-white/5 border-white/5 rounded-2xl px-5 font-bold text-base tracking-widest focus:ring-0 focus:border-rose-500/50 transition-all placeholder:text-gray-700"
                        placeholder="0000000000"
                        required
                      />
                      {verifying && <div className="absolute right-5 top-1/2 -translate-y-1/2"><Loader2 className="animate-spin text-rose-500" size={20} /></div>}
                    </div>
                 </div>

                 <AnimatePresence>
                   {formData.accountName && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                        <div className="space-y-0.5">
                           <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">VERIFIED NAME</span>
                           <p className="text-xs font-bold text-emerald-500 truncate max-w-[200px]">{formData.accountName}</p>
                        </div>
                        <CheckCircle2 className="text-emerald-500" size={14} />
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 tracking-[0.2em] ml-1">YOUR TRANSFER RECEIPT</label>
                    <label className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-3 cursor-pointer hover:bg-white/8 transition-all active:scale-[0.98]">
                       <input type="file" accept="image/*" className="hidden" onChange={e => setFormData({ ...formData, receipt: e.target.files?.[0] || null })} />
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                          <Upload className="text-gray-500" size={16} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{formData.receipt ? formData.receipt.name : "Select Image"}</p>
                          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">PNG OR JPG</p>
                       </div>
                    </label>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 tracking-[0.2em] ml-1">AMOUNT SENT</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500 group-focus-within:text-rose-500 transition-colors">₦</div>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        required
                        className="h-12 bg-white/5 border-white/5 rounded-2xl pl-10 font-black text-base tracking-tight focus:ring-0 focus:border-rose-500/50 transition-all"
                      />
                    </div>
                 </div>


              </div>

              <div className="pt-2">
                 <Button type="submit" disabled={loading} className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-base shadow-[0_10px_20px_rgba(225,29,72,0.15)] active:scale-95 transition-all">
                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "SUBMIT PROOF"}
                 </Button>
                 <p className="text-[9px] text-center text-gray-600 font-bold uppercase tracking-[0.2em] mt-5 px-4 leading-relaxed opacity-50">
                    providing false info leads to permanent suspension
                 </p>
              </div>
            </form>
          )}
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        `}</style>
      </div>
    </div>
  );
};

export default ManualConfirmationModal;
