import { useState } from 'react';
import { Scan, Settings as ManageIcon, LogOut, ShieldCheck } from 'lucide-react';
import AdminScanner from './AdminScanner';
import AdminManage from './AdminManage';

export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'manage'

    return (
        <main className="h-screen bg-[#fafafa] flex flex-col overflow-hidden font-sans">
            {/* Context Header - Slim & Fixed */}
            <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-black/[0.03] shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                        <ShieldCheck className="text-white w-4 h-4" />
                    </div>
                    <span className="text-[12px] font-black tracking-widest text-black uppercase">Iftar Management</span>
                </div>
                <button onClick={onLogout} className="p-2 text-red-500/40 hover:text-red-600 transition-colors">
                    <LogOut className="w-4 h-4" />
                </button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === 'scan' ? (
                    <AdminScanner />
                ) : (
                    <AdminManage onBack={() => setActiveTab('scan')} />
                )}
            </div>

            {/* Premium Bottom Navigation */}
            <nav className="bg-white/80 backdrop-blur-xl border-t border-black/[0.03] px-8 pb-8 pt-4 flex justify-around items-center shrink-0">
                <button
                    onClick={() => setActiveTab('scan')}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'scan' ? 'text-green-600 scale-110' : 'text-black/20 hover:text-black/40'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${activeTab === 'scan' ? 'bg-green-50 shadow-inner' : ''}`}>
                        <Scan className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Scanner</span>
                </button>

                <button
                    onClick={() => setActiveTab('manage')}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'manage' ? 'text-green-600 scale-110' : 'text-black/20 hover:text-black/40'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${activeTab === 'manage' ? 'bg-green-50 shadow-inner' : ''}`}>
                        <ManageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Food Supply</span>
                </button>
            </nav>
        </main>
    );
}
