import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import toast from 'react-hot-toast';
import CustomDropdown from "@/components/ui/CustomDropdown";
import { Landmark } from 'lucide-react';

const ManualConfirmationModal = ({ isOpen, onClose, totalAmount, bookingId }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    accountName: '',
    bankCode: '',
    accountNumber: '',
    amount: totalAmount || '',
    receipt: null, // File for payment_receipt
  });
  const [banks, setBanks] = useState([]);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await api.get('/bank/list/');
        // Sort banks alphabetically
        const sortedBanks = (response.data.data || []).sort((a, b) => a.name.localeCompare(b.name));
        setBanks(sortedBanks);
      } catch (error) {
        console.error("Failed to fetch banks:", error);
      }
    };
    if (isOpen) fetchBanks();
  }, [isOpen]);

  useEffect(() => {
    const verify = async () => {
      if (formData.accountNumber.length === 10 && formData.bankCode) {
        setVerifying(true);
        try {
          const response = await api.post('/bank/verify/', {
            account_number: formData.accountNumber,
            bank_code: formData.bankCode
          });
          setFormData(prev => ({ ...prev, accountName: response.data.data.account_name }));
        } catch (error) {
          setFormData(prev => ({ ...prev, accountName: '' }));
          toast.error("Could not verify account. Please check details.");
        } finally {
          setVerifying(false);
        }
      }
    };
    verify();
  }, [formData.accountNumber, formData.bankCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use FormData for multipart/form-data (booking_id, account_name, bank_name, amount_sent, sent_at, payment_receipt)
      const formDataToSend = new FormData();
      if (bookingId) formDataToSend.append('booking_id', bookingId);
      formDataToSend.append('account_name', formData.accountName.trim() || 'Unknown');
      const selectedBank = banks.find((b) => b.code === formData.bankCode);
      const bankName = selectedBank ? selectedBank.name : '';
      if (bankName) formDataToSend.append('bank_name', bankName);
      formDataToSend.append('amount_sent', String(parseFloat(formData.amount)));
      formDataToSend.append('sent_at', new Date().toISOString());
      if (formData.receipt && formData.receipt instanceof File) {
        formDataToSend.append('payment_receipt', formData.receipt);
      }
      await api.post('/tickets/confirm-payment/', formDataToSend);
      
      setSuccess(true);
      toast.success("Payment confirmation submitted!");
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      const msg = error.response?.data?.message || error.response?.data?.error || "Failed to submit confirmation. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border/50 flex justify-between items-center">
          <h2 className="text-xl font-bold">Confirm Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <h3 className="text-2xl font-bold">Submitted!</h3>
            <p className="text-muted-foreground">
              We've received your payment confirmation. Our team will verify and confirm your ticket shortly.
            </p>
            <Button onClick={onClose} className="mt-4">Close View</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-6 max-h-[65vh] overflow-y-auto px-1 custom-scrollbar">
              <div className="space-y-2">
                <CustomDropdown
                  label="Select Your Bank"
                  options={banks.map(bank => ({ 
                    value: bank.code, 
                    label: bank.name, 
                    icon: Landmark 
                  }))}
                  value={formData.bankCode}
                  onChange={(val) => setFormData({...formData, bankCode: val, accountName: ''})}
                  placeholder="Choose your bank"
                  searchable={true}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Account Number</label>
                <div className="relative group">
                  <Input 
                    id="accountNumber" 
                    placeholder="Enter 10-digit number" 
                    maxLength={10}
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, ''), accountName: ''})}
                    required
                    className="h-12 bg-white/5 border-white/5 rounded-2xl pl-5 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-medium"
                  />
                  {verifying && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin text-rose-500" size={18} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Verified Account Name</label>
                <div className="relative group">
                  <Input 
                    id="accountName" 
                    placeholder="Verified name will appear here" 
                    value={formData.accountName}
                    readOnly
                    className="h-12 bg-white/5 border-white/5 rounded-2xl pl-5 font-bold text-rose-400 placeholder:text-gray-600"
                    required 
                  />
                  {formData.accountName && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="bg-emerald-500/10 p-1.5 rounded-full">
                        <CheckCircle2 className="text-emerald-500" size={16} />
                      </div>
                    </div>
                  )}
                </div>
                {!formData.accountName && formData.accountNumber.length === 10 && !verifying && (
                  <div className="flex items-center gap-1.5 ml-1 mt-1">
                    <X size={12} className="text-rose-500" />
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">Account verification failed</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Amount Sent</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500 group-focus-within:text-rose-500 transition-colors">₦</div>
                  <Input 
                    id="amount" 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required 
                    className="h-12 bg-white/5 border-white/5 rounded-2xl pl-10 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-bold text-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Payment Receipt (Optional)</label>
                <label className="group relative block border-2 border-dashed border-white/5 rounded-3xl p-8 text-center hover:border-rose-500/30 hover:bg-rose-500/5 transition-all cursor-pointer bg-white/5 backdrop-blur-sm">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFormData((prev) => ({ ...prev, receipt: e.target.files?.[0] ?? null }))}
                  />
                  <Upload className="mx-auto text-gray-500 group-hover:text-rose-500 group-hover:scale-110 transition-all mb-3" size={32} />
                  <p className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                    {formData.receipt ? formData.receipt.name : 'Tap to upload receipt'}
                  </p>
                  <p className="text-[10px] text-gray-600 font-medium mt-1">PNG, JPG or PDF up to 5MB</p>
                </label>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <Button type="submit" className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-xl shadow-rose-600/20 group transition-all" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                <span>Submit Confirmation</span>
                {!loading && <CheckCircle2 className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 translate-x-1 transition-all" />}
              </Button>
              <p className="text-[10px] text-center text-gray-500 font-medium px-4">
                By submitting, you agree that providing false information may lead to permanent ticket cancellation and account suspension.
              </p>
            </div>
          </form>
        )}
      </div>
                <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ManualConfirmationModal;
