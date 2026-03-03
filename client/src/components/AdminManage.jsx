import { useState, useEffect } from 'react';
import { ArrowLeft, Settings as ManageIcon, RefreshCw, AlertTriangle, CheckCircle2, Loader2, Save } from 'lucide-react';
import api from '../lib/api';

export default function AdminManage({ onBack }) {
    const [stats, setStats] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tokensLoading, setTokensLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newLimit, setNewLimit] = useState('');
    const [confirmReset, setConfirmReset] = useState(false);
    const [activeTab, setActiveTab] = useState('issued'); // 'issued' or 'used'

    const fetchStats = async () => {
        try {
            const response = await api.get('/tokens/stats');
            setStats(response.data);
            setNewLimit(response.data.totalLimit);
        } catch (err) {
            setError('Failed to fetch stats');
        }
    };

    const fetchTokens = async () => {
        setTokensLoading(true);
        try {
            const response = await api.get('/tokens/list');
            setTokens(response.data);
        } catch (err) {
            console.error('Failed to fetch tokens');
        } finally {
            setTokensLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchTokens();
    }, []);

    const handleUpdateLimit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await api.put('/tokens/settings', { totalTokenLimit: parseInt(newLimit) });
            setSuccess('Supply limit updated');
            fetchStats();
        } catch (err) {
            setError('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setResetLoading(true);
        try {
            await api.put('/tokens/reset');
            setSuccess('System reset successful');
            setConfirmReset(false);
            fetchStats();
            setTokens([]);
        } catch (err) {
            setError('Reset failed');
        } finally {
            setResetLoading(false);
        }
    };

    const utilization = stats?.totalLimit ? Math.round((stats.totalGenerated / stats.totalLimit) * 100) : 0;

    const filteredTokens = tokens.filter(t =>
        activeTab === 'issued' ? (t.status === 'active' || t.status === 'used') : t.status === 'used'
    );

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#fafafa]">
            {/* Header - Minimal & Sticky */}
            <header className="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-black/[0.03]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 transition-transform active:scale-90 text-black/40 hover:text-black">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <ManageIcon className="text-indigo-600 w-4 h-4" />
                        <h1 className="text-xs font-black tracking-[0.2em] uppercase text-black">Manage</h1>
                    </div>
                </div>
                <button onClick={fetchTokens} className={`p-2 -mr-2 text-indigo-600/40 hover:text-indigo-600 transition-all ${tokensLoading ? 'animate-spin' : 'active:rotate-180'}`}>
                    <RefreshCw className="w-4 h-4" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
                {/* Supply Management Section */}
                <section className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-black/40">Food Supply</h2>
                    </div>

                    <div className="glass-card rounded-[1.5rem] p-5 border border-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 blur-2xl transition-all group-hover:bg-green-500/10" />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-0.5">
                                    <p className="text-[11px] text-black/50 font-black uppercase tracking-wider">Total Portions</p>
                                    <div className="flex items-baseline gap-2">
                                        <input
                                            type="number"
                                            className="text-3xl font-black text-black bg-transparent border-none outline-none w-24 transition-all p-0 selection:bg-green-100"
                                            value={newLimit}
                                            onChange={(e) => setNewLimit(e.target.value)}
                                        />
                                        <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">Units</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleUpdateLimit}
                                    disabled={loading}
                                    className="p-3 rounded-xl bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20 transition-all active:scale-90 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Utilization Visualization */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className={`text-xl font-black ${utilization > 90 ? 'text-red-500' : 'text-black'}`}>
                                        {utilization}<span className="text-[12px] text-black/30 font-bold ml-1">%</span>
                                        <span className="text-[11px] text-black/40 font-black uppercase tracking-wider ml-2">Supply Usage</span>
                                    </span>
                                    <span className="text-[11px] font-black uppercase tracking-wider text-black/30">{stats?.totalGenerated} / {stats?.totalLimit}</span>
                                </div>
                                <div className="h-2 w-full bg-black/[0.02] rounded-full overflow-hidden p-[1px] ring-1 ring-black/[0.03]">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${utilization > 90 ? 'bg-gradient-to-r from-red-500 to-orange-400' : 'bg-gradient-to-r from-green-600 to-green-400'}`}
                                        style={{ width: `${Math.min(100, utilization)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Activity Feed Section */}
                <section className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 bg-black/10 rounded-full" />
                        <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-black/40">Iftar History</h2>
                    </div>

                    <div className="glass-card rounded-[1.5rem] border border-white overflow-hidden shadow-2xl shadow-black/[0.02]">
                        {/* Tab Switcher */}
                        <div className="flex p-1.5 bg-black/[0.02]">
                            <button
                                onClick={() => setActiveTab('issued')}
                                className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'issued' ? 'bg-white text-black shadow-sm' : 'text-black/40 hover:text-black/60'}`}
                            >
                                Issued ({tokens.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('used')}
                                className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'used' ? 'bg-white text-black shadow-sm' : 'text-black/40 hover:text-black/60'}`}
                            >
                                Claimed ({tokens.filter(t => t.status === 'used').length})
                            </button>
                        </div>

                        {/* Log Stream */}
                        <div className="max-h-[160px] overflow-y-auto no-scrollbar">
                            {tokensLoading ? (
                                <div className="p-10 flex flex-col items-center gap-2">
                                    <Loader2 className="w-5 h-5 text-black/10 animate-spin" />
                                    <p className="text-[7px] font-black text-black/20 uppercase tracking-[0.3em]">Syncing...</p>
                                </div>
                            ) : filteredTokens.length === 0 ? (
                                <div className="p-10 text-center">
                                    <p className="text-[8px] font-black text-black/10 uppercase tracking-[0.4em]">Empty</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-black/[0.01]">
                                    {filteredTokens.map((token) => (
                                        <div key={token.tokenId} className="p-3 flex items-center justify-between gap-3 group hover:bg-black/[0.01] transition-colors">
                                            <div className="min-w-0">
                                                <h4 className="text-[14px] font-black text-black truncate">{token.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-black/40 font-black uppercase tracking-wider">{token.phone || 'Self Registered'}</span>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${token.status === 'used' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {token.status === 'used' ? 'Handled' : 'Wait'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section>
                    {!confirmReset ? (
                        <button
                            onClick={() => setConfirmReset(true)}
                            className="w-full py-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-[8px] font-black uppercase tracking-[0.3em] hover:bg-red-100 transition-all active:scale-95"
                        >
                            Factory Reset System
                        </button>
                    ) : (
                        <div className="glass-card rounded-[1.5rem] p-4 border-red-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative">
                            <div className="absolute inset-0 bg-red-600/5 -z-10" />
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                    <h3 className="text-[11px] font-black text-red-600 uppercase tracking-wider">Wipe All Data?</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleReset}
                                        disabled={resetLoading}
                                        className="flex-2 py-3 rounded-xl bg-red-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        {resetLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                                    </button>
                                    <button
                                        onClick={() => setConfirmReset(false)}
                                        className="flex-1 py-3 rounded-xl bg-black text-white text-[8px] font-black uppercase tracking-widest"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <footer className="pt-2 pb-4 text-center">
                    <p className="text-[7px] text-black/10 tracking-[0.4em] uppercase font-black">
                        Kernel v1.0.4 • Hardware Secured
                    </p>
                </footer>
            </div>

            {/* Notifications */}
            {(error || success) && (
                <div className={`fixed top-20 left-6 right-6 p-4 rounded-3xl border shadow-2xl backdrop-blur-xl z-50 flex items-center gap-3 animate-in slide-in-from-top-10 duration-500 ${error ? 'bg-red-500/90 border-red-500 text-white' : 'bg-black/90 border-black text-white'}`}>
                    {error ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    <p className="text-[10px] font-black uppercase tracking-widest">{error || success}</p>
                </div>
            )}
        </div>
    );
}

