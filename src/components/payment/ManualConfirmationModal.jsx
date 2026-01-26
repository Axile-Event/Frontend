import React, { useState } from 'react';
import { X, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import toast from 'react-hot-toast';

const ManualConfirmationModal = ({ isOpen, onClose, totalAmount }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form state - matching requested UI fields
  const [formData, setFormData] = useState({
    fullName: '',
    bankName: '',
    accountNumber: '',
    amount: totalAmount || '',
    receipt: null
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Split full name for API (Strictly following docs at line 6606)
      const names = formData.fullName.trim().split(' ');
      const firstName = names[0] || 'Unknown';
      const lastName = names.slice(1).join(' ') || 'User';

      const payload = {
        Firstname: firstName,
        Lastname: lastName,
        amount_sent: parseFloat(formData.amount),
        sent_at: new Date().toISOString()
      };

      // API call to documented endpoint
      await api.post('/tickets/confirm-payment/', payload);
      
      setSuccess(true);
      toast.success("Payment confirmation submitted!");
      
      // Auto close after success
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit confirmation. Please try again.");
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
            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="Enter the name on the account" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input 
                    id="bankName" 
                    placeholder="e.g. Zenith Bank" 
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input 
                    id="accountNumber" 
                    placeholder="10 digits" 
                    maxLength={10}
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount Sent</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Receipt (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
                  <Upload className="mx-auto text-muted-foreground mb-2" size={24} />
                  <p className="text-xs text-muted-foreground">Click to upload or drag and drop image</p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                Submit Confirmation
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                By submitting, you agree that providing false information may lead to ticket cancellation.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManualConfirmationModal;
