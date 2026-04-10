'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { fadeInUp, blurReveal } from '@/lib/animations';
import { 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight, 
  Search,
  Check,
  X
} from 'lucide-react';

interface PayoutRequest {
    id: number;
    amount: number;
    status: string;
    created_at: string;
    researcher: {
        email: string;
        handle: string;
    };
    method: {
        type: string;
        details: any;
    };
}

export default function AdminPayouts() {
    const [requests, setRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState<number | null>(null);

    async function loadRequests() {
        try {
            const res = await fetchWithAuth(`${API_URL}/api/admin/payouts/pending`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (err) {
            console.error("Failed to load payout requests:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRequests();
    }, []);

    const handleApprove = async (id: number) => {
        const ref = prompt("Enter Bank/UPI Transaction Reference ID (optional):");
        setApproving(id);
        try {
            const res = await fetchWithAuth(`${API_URL}/api/admin/payouts/approve/${id}`, {
                method: 'POST',
                body: JSON.stringify({ transaction_ref: ref })
            });
            const data = await res.json();
            if (data.success) {
                setRequests(prev => prev.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error("Approval failed:", err);
        } finally {
            setApproving(null);
        }
    };

    if (loading) {
        return (
            <div className="py-40 flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border border-white/5 border-t-indigo-500 rounded-full animate-spin" />
                <p className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.4em] italic">Synchronizing Ledger...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end pb-12 border-b border-white/5">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="subtle-mono text-[9px] text-indigo-400 tracking-[0.4em] uppercase font-black italic">Financial Gateway</span>
                        <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{requests.length} PENDING</span>
                        </div>
                    </div>
                    <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">
                        Payout <br />
                        <span className="text-white/5 italic">Requests.</span>
                    </h1>
                </div>
            </header>

            <div className="glass-panel rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">
                {requests.length === 0 ? (
                    <div className="py-40 text-center space-y-4">
                        <p className="text-white/10 text-2xl font-black italic uppercase tracking-tighter">No pending payouts.</p>
                        <p className="subtle-mono text-[9px] text-white/5 uppercase tracking-widest italic">The ledger is balanced.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.03]">
                        {requests.map((r, i) => (
                            <motion.div 
                                key={r.id}
                                variants={blurReveal}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: i * 0.05 }}
                                className="group p-12 hover:bg-white/[0.01] transition-all relative overflow-hidden"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                    {/* Researcher Info */}
                                    <div className="lg:col-span-3 space-y-2">
                                        <p className="subtle-mono text-[9px] text-white/20 uppercase tracking-widest font-black italic">[ {r.id} ]</p>
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tight truncate">{r.researcher.handle}</h3>
                                        <p className="text-[10px] text-white/30 truncate font-medium">{r.researcher.email}</p>
                                    </div>

                                    {/* Amount */}
                                    <div className="lg:col-span-2">
                                        <p className="text-3xl font-black text-white italic tracking-tighter">₹{r.amount.toLocaleString()}</p>
                                        <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-1">Net Transfer</p>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="lg:col-span-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{r.method.type === 'bank_account' ? '🏦' : '💎'}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">{r.method.type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="space-y-1">
                                            {r.method.type === 'bank_account' ? (
                                                <>
                                                    <p className="text-[11px] font-black text-white/80 uppercase tracking-tight italic">AC: {r.method.details.account_number}</p>
                                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">IFSC: {r.method.details.ifsc}</p>
                                                </>
                                            ) : (
                                                <p className="text-[11px] font-black text-white/80 uppercase tracking-tight italic">UPI: {r.method.details.upi_id}</p>
                                            )}
                                            <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-tight">Name: {r.method.details.name}</p>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="lg:col-span-3 flex justify-end">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={approving === r.id}
                                            onClick={() => handleApprove(r.id)}
                                            className="px-10 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest italic shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-4 disabled:opacity-50"
                                        >
                                            {approving === r.id ? 'Processing...' : (
                                                <>Approve Payout <CheckCircle2 size={12} /></>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Manual Instruction */}
            <div className="p-10 rounded-[40px] border border-white/5 bg-white/[0.01] flex items-center justify-between gap-12">
                <div className="space-y-3">
                    <h4 className="text-white/60 font-black italic uppercase tracking-tight">Manual Payout Operational Guide</h4>
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest italic leading-relaxed max-w-2xl">
                        To process payouts: open your banking application, perform the transfer to the details shown above, 
                        and click "Approve Payout" to mark the transaction as completed in the registry.
                    </p>
                </div>
            </div>
        </div>
    );
}
