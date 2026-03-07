import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus, ShieldCheck } from 'lucide-react';
import { signup, User } from '../auth';

interface Props {
    onLogin: (user: User) => void;
    onGoLogin: () => void;
}

export default function SignupPage({ onLogin, onGoLogin }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
            setError('All fields are required.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 400));
        const user = signup(name.trim(), email.trim(), password);
        setLoading(false);
        if (user) {
            onLogin(user);
        } else {
            setError('This email is already registered. Please sign in instead.');
        }
    };

    const Field = ({ label, value, onChange, type = 'text', placeholder, autoComplete }: {
        label: string; value: string; onChange: (v: string) => void;
        type?: string; placeholder?: string; autoComplete?: string;
    }) => (
        <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">{label}</label>
            <input
                type={type} value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder} autoComplete={autoComplete}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF9933]/50 transition-all"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f1625] flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF9933]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-2xl mb-4">
                        <ShieldCheck className="w-7 h-7 text-[#FF9933]" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">PolitiSense</h1>
                    <p className="text-sm text-white/40 mt-1 font-medium tracking-widest uppercase">Intelligence Unit</p>
                </div>

                <div className="bg-[#1a2744]/60 backdrop-blur border border-white/8 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-lg font-bold text-white mb-1">Create Account</h2>
                    <p className="text-sm text-white/40 mb-6">Register a new analyst account</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" autoComplete="name" />
                        <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="your@email.com" autoComplete="email" />

                        <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                                    autoComplete="new-password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF9933]/50 transition-all"
                                />
                                <button type="button" onClick={() => setShowPw(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Field label="Confirm Password" value={confirm} onChange={setConfirm}
                            type={showPw ? 'text' : 'password'} placeholder="Re-enter password" autoComplete="new-password" />

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 font-medium">{error}</div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FF9933] hover:bg-[#e68a2e] text-white font-bold rounded-xl transition-colors disabled:opacity-60 mt-2">
                            <UserPlus className="w-4 h-4" />
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-white/8 text-center">
                        <p className="text-xs text-white/30">
                            Already have an account?{' '}
                            <button onClick={onGoLogin} className="text-[#FF9933] hover:underline font-semibold">Sign in</button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] text-white/20 mt-6">
                    Analyst accounts are subject to admin approval for full access
                </p>
            </div>
        </div>
    );
}
