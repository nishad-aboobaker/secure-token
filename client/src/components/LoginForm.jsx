import { useState } from 'react';
import { Mail, Lock, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

export default function LoginForm({ onSuccess, onBack }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', formData);
            if (response.data.success) {
                onSuccess(response.data.token);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#fafafa] flex flex-col items-center p-4">
            <nav className="w-full flex justify-between items-center mb-16 py-2">
                <button onClick={onBack} className="p-2 transition-colors text-black/40 hover:text-black">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="text-white w-5 h-5" />
                    </div>
                </div>
                <div className="w-9" />
            </nav>

            <div className="glass-card p-8 rounded-3xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-black">Admin Access</h2>
                    <p className="text-black/50 text-sm">Please log in to access the scanner.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/70 ml-1">Email</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-4 w-5 h-5 text-black/30 pointer-events-none" />
                            <input
                                required
                                type="email"
                                placeholder="admin@example.com"
                                className="premium-input !pl-12"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/70 ml-1">Password</label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 w-5 h-5 text-black/30 pointer-events-none" />
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                className="premium-input !pl-12"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-xl text-center font-medium animate-in shake-in duration-200">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        type="submit"
                        className="premium-btn w-full items-center justify-center gap-2 mt-6 flex"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Login to Dashboard</>
                        )}
                    </button>
                </form>
            </div>

            <p className="mt-auto py-8 text-[9px] text-black/20 tracking-widest uppercase text-center font-bold">
                SECURE ACCESS • nishadaboobaker.online
            </p>
        </main>
    );
}
