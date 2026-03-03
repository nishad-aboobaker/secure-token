import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Scan, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function AdminScanner() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const isVerifyingRef = useRef(false);
    const scannerRef = useRef(null);

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

    useEffect(() => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode('reader');
        }

        const handleScan = async (decodedText) => {
            if (isVerifyingRef.current) return;
            isVerifyingRef.current = true;
            setLoading(true);
            setError('');
            setResult(null);

            try {
                const response = await api.post('/tokens/verify', { token: decodedText });
                setResult(response.data);
                fetchStats();
            } catch (err) {
                setError(err.response?.data?.message || 'Verification failed');
            } finally {
                setLoading(false);
                setTimeout(() => {
                    isVerifyingRef.current = false;
                }, 3000);
            }
        };

        const startScanner = async () => {
            try {
                setError('');
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0) {
                    if (scannerRef.current?.isScanning) return;

                    await scannerRef.current.start(
                        { facingMode: 'environment' },
                        {
                            fps: 10,
                            // Removed qrbox to eliminate the default square shader
                            aspectRatio: 1.0
                        },
                        handleScan
                    );
                    setError('');
                } else {
                    setError('No cameras detected');
                }
            } catch (err) {
                if (scannerRef.current?.isScanning) {
                    setError('');
                    return;
                }
                setError('Camera access denied');
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    return (
        <div className="flex-1 flex flex-col p-5 min-h-0 overflow-hidden relative">
            {/* Results Overlay */}
            {(result || error) && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-300">
                    <div className="mb-8 group">
                        {result ? (
                            <div className="bg-green-100 p-6 rounded-full ring-8 ring-green-50 animate-bounce-subtle">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                        ) : (
                            <div className="bg-red-100 p-6 rounded-full ring-8 ring-red-50">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                        )}
                    </div>

                    <div className="text-center mb-10 space-y-2">
                        <h2 className={`text-[13px] font-black uppercase tracking-[0.3em] ${result ? 'text-green-600' : 'text-red-600'}`}>
                            {result ? 'Verified for Iftar' : 'Verification Failed'}
                        </h2>
                        {result ? (
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-black leading-tight tracking-tight">{result.user?.name}</p>
                                <p className="text-[12px] font-bold text-black/30 uppercase tracking-widest">{result.user?.phone || 'Self Registered'}</p>
                            </div>
                        ) : (
                            <p className="text-[12px] font-black text-black/50 uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setResult(null);
                            setError('');
                        }}
                        className={`w-full max-w-[240px] py-6 rounded-[2.5rem] text-white text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${result ? 'bg-green-600 shadow-green-200' : 'bg-black shadow-black/20'}`}
                    >
                        Scan Next
                    </button>
                </div>
            )}

            {/* Header - Minimal */}
            <header className="mb-3 flex justify-between items-center shrink-0">
                <h1 className="text-[13px] font-black tracking-[0.2em] uppercase text-black">Verification</h1>
                <div className="px-2 py-1 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">Live</span>
                </div>
            </header>

            {/* Stats Bar - Compact Pills */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar shrink-0">
                {[
                    { label: 'Left', value: (stats?.totalLimit - stats?.totalGenerated) || 0, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Out', value: stats?.totalGenerated || 0, color: 'text-black/60', bg: 'bg-black/[0.03]' },
                    { label: 'Done', value: stats?.totalUsed || 0, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                ].map((stat, i) => (
                    <div key={i} className={`flex-1 min-w-[70px] ${stat.bg} px-2 py-2 rounded-lg border border-black/[0.03] flex flex-col items-center justify-center transition-all`}>
                        <p className="text-[10px] text-black/40 font-black uppercase tracking-wider mb-0.5">{stat.label}</p>
                        <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Scanner Area - Fixed & Focused */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-2 overflow-hidden">
                <div className="w-full max-w-[280px] aspect-square bg-black/[0.02] rounded-2xl overflow-hidden border border-black/[0.03] relative shadow-inner shrink-0">
                    <div id="reader" className="w-full h-full !border-none"></div>
                    {loading && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                        </div>
                    )}
                </div>

                {/* Status Indicator (Pulse) */}
                <div className="mt-8 w-full flex flex-col items-center animate-pulse duration-[2000ms]">
                    <div className="p-3 bg-black/[0.03] rounded-full mb-3">
                        <Scan className="w-6 h-6 text-black/20" />
                    </div>
                    <p className="text-[11px] font-black tracking-[0.3em] uppercase text-black/20">Awaiting Pass</p>
                </div>
            </div>

            <footer className="py-4 mt-auto text-center shrink-0">
                <p className="text-[8px] text-black/20 tracking-[0.5em] uppercase font-black">
                    SECURED • NISHAD
                </p>
            </footer>
        </div>
    );
}

