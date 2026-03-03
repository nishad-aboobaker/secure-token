import { useState, useEffect } from 'react';
import { ShieldCheck, Scan as ScanIcon, Settings } from 'lucide-react';
import api from '../lib/api';
import TokenForm from './TokenForm';
import TokenQR from './TokenQR';

export default function LandingPage({ onAdminClick }) {
    const [tokenData, setTokenData] = useState(null);
    const [stats, setStats] = useState(null);

    const fetchStats = async () => {
        try {
            const response = await api.get('/tokens/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch stats');
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-[#fafafa] flex flex-col items-center p-4">
            {/* Header */}
            <header className="w-full flex justify-between items-center py-3 mb-4 max-w-md">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center shadow-lg shadow-green-200">
                        <span className="text-white font-black text-xs">IP</span>
                    </div>
                    <span className="text-sm font-black tracking-widest text-black uppercase">Iftar Pass</span>
                </div>
                <button
                    onClick={onAdminClick}
                    className="p-2 text-black/40 hover:text-black transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </header>

            {/* Hero Section */}
            <div className="text-center mb-6 space-y-1.5 px-2">
                <h1 className="text-3xl font-black text-black tracking-tight leading-[1.1]">
                    IFTAR FOOD<br />
                    <span className="text-green-600 uppercase">DISTRIBUTION.</span>
                </h1>
                <p className="text-black/40 text-[11px] font-semibold tracking-wide max-w-[280px] mx-auto">
                    Generate your digital pass below to ensure sufficient food for everyone.
                </p>
            </div>

            {/* Stats - Minimal */}
            <div className="w-full grid grid-cols-2 gap-2 mb-4 max-w-md px-2">
                <div className="glass-card p-3 rounded-xl border border-white/50">
                    <span className="text-[9px] text-black/40 uppercase font-black tracking-wider">Available</span>
                    <p className="text-lg font-black text-black leading-none mt-1">{stats ? stats.totalLimit - stats.totalGenerated : '--'}</p>
                </div>
                <div className="glass-card p-3 rounded-xl border border-white/50">
                    <span className="text-[9px] text-black/40 uppercase font-black tracking-wider">Issued</span>
                    <p className="text-lg font-black text-green-600 leading-none mt-1">{stats ? stats.totalGenerated : '--'}</p>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="w-full flex flex-col items-center max-w-md">
                {!tokenData ? (
                    <div className="w-full space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Get Your Iftar Pass</h3>
                        </div>
                        <TokenForm onSuccess={setTokenData} />
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center gap-6">
                        <div className="text-center space-y-1 mb-2">
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">Pass Generated Successfully</p>
                            <p className="text-xs text-black/40 font-medium">Please show this QR code at the distribution point.</p>
                        </div>
                        <TokenQR tokenData={tokenData} />
                        <button
                            onClick={() => setTokenData(null)}
                            className="text-black/40 hover:text-black transition-all text-xs font-bold uppercase tracking-widest py-4"
                        >
                            ← Get Another Pass
                        </button>
                    </div>
                )}
            </div>

            {/* Minimal Footer */}
            <div className="mt-auto py-4 text-center text-black/10">
                <p className="text-[8px] tracking-[0.3em] font-black uppercase">IFTAR SECURED • NISHAD</p>
            </div>
        </main>
    );
}
