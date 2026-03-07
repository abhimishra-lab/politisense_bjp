import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { login, User } from '../auth';

interface Props {
    onLogin: (user: User) => void;
    onGoSignup: () => void;
}

export default function LoginPage({ onLogin, onGoSignup }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password.trim()) {
            setError('Please enter your email and password.');
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 500)); // brief UX delay
        const user = login(email.trim(), password);
        setLoading(false);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1625] flex items-center justify-center p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF9933]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-[#1a2744]/80 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-2xl mb-4">
                        <ShieldCheck className="w-7 h-7 text-[#FF9933]" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">PolitiSense</h1>
                    <p className="text-sm text-white/40 mt-1 font-medium tracking-widest uppercase">Intelligence Unit</p>
                </div>

                {/* Card */}
                <div className="bg-[#1a2744]/60 backdrop-blur border border-white/8 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-lg font-bold text-white mb-1">Sign In</h2>
                    <p className="text-sm text-white/40 mb-6">Enter your credentials to access the dashboard</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                                Email / Username
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@politisense.ai"
                                autoComplete="username"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF9933]/50 focus:bg-white/8 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF9933]/50 focus:bg-white/8 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FF9933] hover:bg-[#e68a2e] text-white font-bold rounded-xl transition-colors disabled:opacity-60 mt-2"
                        >
                            <LogIn className="w-4 h-4" />
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-white/8 text-center">
                        <p className="text-xs text-white/30 font-medium">
                            New to PolitiSense?{' '}
                            <button
                                onClick={onGoSignup}
                                className="text-[#FF9933] hover:underline font-semibold"
                            >
                                Create account
                            </button>
                        </p>
                    </div>
                </div>

                {/* Demo credentials hint */}
                <div className="mt-5 bg-white/4 border border-white/8 rounded-xl px-5 py-4">
                    <p className="text-[10px] font-bold uppercase text-white/30 tracking-widest mb-2">Demo Credentials</p>
                    <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-white/50">
                            <span>admin@politisense.ai</span>
                            <span className="text-white/30">Admin@123</span>
                        </div>
                        <div className="flex justify-between text-white/50">
                            <span>analyst@politisense.ai</span>
                            <span className="text-white/30">Analyst@123</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[10px] text-white/20 mt-6">
                    Secure government-grade briefing system — authorised access only
                </p>
            </div>
        </div>
    );
}
