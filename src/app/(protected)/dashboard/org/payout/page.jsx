"use client";

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../../lib/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  TrendingUp, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Banknote,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WalletPageSkeleton } from '@/components/skeletons';
import PinPromptModal from '@/components/PinPromptModal';
import { hasPinSet } from '@/lib/pinPrompt';

export default function PayoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [hideBalances, setHideBalances] = useState(true);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'withdrawals'
  const [stats, setStats] = useState({
    available_balance: '0.00',
    pending_balance: '0.00',
    total_earnings: '0.00',
    total_withdrawn: '0.00',
    has_bank_account: false,
    bank_name: '',
    bank_account_number: '',
  });
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [balanceRes, transRes, withdrawalRes] = await Promise.all([
        api.get('/wallet/balance/'),
        api.get('/wallet/transactions/?limit=10'),
        api.get('/wallet/withdrawals/?limit=20')
      ]);
      
      if (balanceRes.data) {
        setStats(balanceRes.data);
      }
      
      if (transRes.data && transRes.data.transactions) {
        setTransactions(transRes.data.transactions);
      }

      if (withdrawalRes.data && withdrawalRes.data.withdrawals) {
        setWithdrawals(withdrawalRes.data.withdrawals);
      }
    } catch (error) {
      console.error("Failed to fetch payout data", error);
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format number with commas for display
  const formatWithCommas = (value) => {
    const cleaned = String(value).replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  };

  // Handle amount input change with comma formatting
  const handleAmountChange = (rawValue) => {
    const numericValue = rawValue.replace(/,/g, "");
    if (/^\d*\.?\d*$/.test(numericValue)) {
      setWithdrawAmount(numericValue);
    }
  };

  // Get raw numeric value from withdrawAmount
  const getRawAmount = () => parseFloat(withdrawAmount.replace(/,/g, "")) || 0;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!stats.has_bank_account) {
      toast.error("Please add a bank account in Settings first");
      router.push('/dashboard/org/settings');
      return;
    }

    const amount = parseFloat(withdrawAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount < 1000) {
      toast.error("Minimum withdrawal amount is ₦1,000");
      return;
    }

    if (amount > parseFloat(stats.available_balance)) {
      toast.error("Amount exceeds available balance");
      return;
    }

    // Check if PIN is set
    if (!hasPinSet()) {
      setPendingWithdrawal(amount);
      setShowPinPrompt(true);
      return;
    }

    // Require PIN verification before withdrawal
    setPendingWithdrawal(amount);
    setShowPinPrompt(true);
  };

  const executeWithdrawal = async () => {
    try {
      setWithdrawing(true);
      const res = await api.post('/wallet/withdraw/', { amount: pendingWithdrawal });
      toast.success(res.data.message || "Withdrawal initiated successfully");
      setWithdrawAmount('');
      setPendingWithdrawal(null);
      fetchData(); // Refresh balances
    } catch (error) {
      toast.error(error.response?.data?.error || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return <WalletPageSkeleton />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-1">Payouts & Wallet</h1>
        <p className="text-gray-400 text-xs">Manage your earnings and transfer funds to your bank account.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Available balance" 
          amount={stats.available_balance} 
          icon={<Wallet className="w-5 h-5 text-emerald-500" />}
          description="Ready for withdrawal"
          hideBalances={hideBalances}
          onToggleVisibility={() => setHideBalances(!hideBalances)}
        />
        <StatCard 
          label="Pending balance" 
          amount={stats.pending_balance} 
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          description="Held for 7 days after sale"
          hideBalances={hideBalances}
          onToggleVisibility={() => setHideBalances(!hideBalances)}
        />
        <StatCard 
          label="Total earnings" 
          amount={stats.total_earnings} 
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
          description="Lifetime revenue"
          hideBalances={hideBalances}
          onToggleVisibility={() => setHideBalances(!hideBalances)}
        />
         <StatCard 
          label="Total withdrawn" 
          amount={stats.total_withdrawn} 
          icon={<CheckCircle2 className="w-5 h-5 text-gray-500" />}
          description="Successfully transferred"
          hideBalances={hideBalances}
          onToggleVisibility={() => setHideBalances(!hideBalances)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdrawal Form */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 shadow-xl">
            <h2 className="text-base font-bold mb-5 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              Request Withdrawal
            </h2>

            {!stats.has_bank_account ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-rose-500">No bank account linked</p>
                    <p className="text-xs text-rose-400/80 mt-1">Please configure your bank details in settings set up withdrawals.</p>
                    <button 
                      onClick={() => router.push('/dashboard/org/settings')}
                      className="text-xs font-bold text-rose-500 mt-2 hover:underline flex items-center gap-1"
                    >
                      Go to Settings <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-5 p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] text-gray-500 font-bold mb-1.5">Payout destination</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Banknote className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stats.bank_name}</p>
                    <p className="text-[11px] text-gray-500">{stats.bank_account_number}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Amount (₦)</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</div>
                   <input 
                    type="text" 
                    inputMode="decimal"
                    value={formatWithCommas(withdrawAmount)}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Min. 1,000"
                    disabled={!stats.has_bank_account}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-700"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Available: ₦{parseFloat(stats.available_balance).toLocaleString()}</p>
              </div>

              <button
                type="submit"
                disabled={withdrawing || !stats.has_bank_account || getRawAmount() < 1000}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {withdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                {withdrawing ? "Processing..." : "Initiate Withdrawal"}
              </button>

              <p className="text-[10px] text-center text-gray-500">
                Processing time: 1-3 business days.
              </p>
            </form>
          </div>
        </div>

        {/* Transactions & Withdrawals Table */}
        <div className="lg:col-span-2">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl shadow-xl overflow-hidden">
            {/* Tabs Header */}
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'all'
                      ? 'bg-rose-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <History className="w-4 h-4" />
                  All Transactions
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">{transactions.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'withdrawals'
                      ? 'bg-rose-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Withdrawal History
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">{withdrawals.length}</span>
                </button>
              </div>
            </div>
            
            {/* All Transactions Tab */}
            {activeTab === 'all' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/2 text-gray-400 text-[10px] font-bold">
                    <tr>
                      <th className="px-5 py-3">Transaction</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.length > 0 ? (
                      transactions.map((tx, index) => (
                        <tr key={tx.transaction_id || tx.id || index} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-white">{tx.transaction_type_display}</span>
                              <span className="text-xs text-gray-500 truncate max-w-[200px]">{tx.description}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold">
                             <StatusBadge status={tx.status} label={tx.status_display} />
                          </td>
                          <td className={`px-6 py-4 font-bold ${tx.amount.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {tx.amount.startsWith('-') ? '-' : '+'}₦{Math.abs(parseFloat(tx.amount)).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-gray-500 truncate">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                         <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                           No transactions found.
                         </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Withdrawal History Tab */}
            {activeTab === 'withdrawals' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.02] text-gray-400 text-[10px] font-bold">
                    <tr>
                      <th className="px-5 py-3">Withdrawal ID</th>
                      <th className="px-5 py-3">Bank Details</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {withdrawals.length > 0 ? (
                      withdrawals.map((withdrawal, index) => (
                        <tr key={withdrawal.withdrawal_id || withdrawal.id || index} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono text-gray-500">{withdrawal.withdrawal_id || withdrawal.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-white text-xs">{withdrawal.bank_name}</span>
                              <span className="text-xs text-gray-500">{withdrawal.account_number}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold">
                             <StatusBadge status={withdrawal.status} label={withdrawal.status_display || withdrawal.status} />
                          </td>
                          <td className="px-6 py-4 font-bold text-rose-500">
                            -₦{parseFloat(withdrawal.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-xs">
                            <div className="flex flex-col">
                              <span>{new Date(withdrawal.created_at).toLocaleDateString()}</span>
                              {withdrawal.processed_at && (
                                <span className="text-[10px] text-gray-600">Processed: {new Date(withdrawal.processed_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                         <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                           No withdrawal history found.
                         </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PIN Prompt Modal */}
      <PinPromptModal
        isOpen={showPinPrompt}
        onClose={() => {
          setShowPinPrompt(false);
          setPendingWithdrawal(null);
        }}
        onSuccess={() => {
          setShowPinPrompt(false);
          executeWithdrawal();
        }}
        action="process withdrawal"
        requireSetup={true}
      />
    </div>
  );
}

function StatCard({ label, amount, icon, description, hideBalances, onToggleVisibility }) {
  const displayAmount = hideBalances ? '₦••••••' : `₦${parseFloat(amount).toLocaleString()}`;
  
  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl shadow-lg hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full pulse">
             Live
          </div>
          {onToggleVisibility && (
            <button
              onClick={onToggleVisibility}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
              title={hideBalances ? "Show balance" : "Hide balance"}
            >
              {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-semibold mb-1">{label}</p>
        <h3 className="text-2xl font-bold">{displayAmount}</h3>
        <p className="text-gray-600 text-[10px] mt-1.5 font-medium">{description}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status, label }) {
  const styles = {
    completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <span className={`px-2 py-1 rounded-md border ${styles[status] || styles.pending}`}>
      {label}
    </span>
  );
}
