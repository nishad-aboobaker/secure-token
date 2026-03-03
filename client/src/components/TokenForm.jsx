import { useState } from 'react';
import { User, Mail, Phone, Loader2, CreditCard } from 'lucide-react';
import api from '../lib/api';

export default function TokenForm({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/tokens/generate', formData);
            onSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-5 rounded-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 border border-white/50">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-green-500/10 rounded-xl">
                    <span className="text-green-600 font-black text-xs uppercase tracking-tighter">Pass</span>
                </div>
                <div>
                    <h2 className="text-xl font-black text-black uppercase tracking-tight">Generate Pass</h2>
                    <p className="text-black/30 text-[10px] font-bold uppercase tracking-widest">Digital Entry Verification</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Full Name</label>
                    <div className="relative flex items-center">
                        <User className="absolute left-4 w-4 h-4 text-black/20 pointer-events-none" />
                        <input
                            required
                            type="text"
                            placeholder="Full Name"
                            className="premium-input !pl-11 !py-3 text-sm font-bold"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">Phone (Optional)</label>
                    <div className="relative flex items-center">
                        <Phone className="absolute left-4 w-4 h-4 text-black/20 pointer-events-none" />
                        <input
                            type="tel"
                            placeholder="Contact Number"
                            className="premium-input !pl-11 !py-3 text-sm font-bold"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-xl text-center font-medium">
                        {error}
                    </div>
                )}

                <button
                    disabled={loading}
                    type="submit"
                    className="premium-btn w-full items-center justify-center gap-2 mt-2 flex !py-4 text-[11px] font-black uppercase tracking-widest bg-green-600 border-none text-white shadow-xl shadow-green-100"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>Generate Iftar Pass</>
                    )}
                </button>
            </form>
        </div>
    );
}
