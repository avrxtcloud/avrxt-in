'use client';

import { useState } from "react";
import { Save, Shield, Globe, Zap, Settings2, Info } from "lucide-react";
import SpotlightBox from "@/components/SpotlightBox";
import { adminUpdateSettings } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

interface Setting {
    key: string;
    value: string;
    description: string;
}

export default function SettingsClient({ initialSettings }: { initialSettings: any[] }) {
    const [settings, setSettings] = useState(initialSettings);
    const [loading, setLoading] = useState(false);

    const updateSetting = async (key: string, value: string) => {
        try {
            setLoading(true);
            await adminUpdateSettings(key, value);
            // Optimistic update
            setSettings(settings.map(s => s.key === key ? { ...s, value } : s));
        } finally {
            setLoading(false);
        }
    };

    const getVal = (key: string) => settings.find(s => s.key === key)?.value || "false";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* System Access Group */}
            <div className="space-y-8">
                <div className="px-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">System_Access_Protocol</h3>
                </div>

                <SpotlightBox className="p-10 rounded-[3rem] bg-[#050505] border border-white/5 space-y-8">
                    <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Registration_Gate</h4>
                            <p className="text-[10px] text-zinc-600 font-mono uppercase">Allow new nodes to register via OAuth</p>
                        </div>
                        <button 
                            onClick={() => updateSetting('registration_enabled', getVal('registration_enabled') === 'true' ? 'false' : 'true')}
                            className={cn(
                                "w-14 h-8 rounded-full border border-white/5 p-1 transition-all",
                                getVal('registration_enabled') === 'true' ? "bg-emerald-500/20 border-emerald-500/50" : "bg-white/5"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded-full transition-all duration-500 shadow-xl",
                                getVal('registration_enabled') === 'true' ? "translate-x-7 bg-emerald-500" : "translate-x-0 bg-zinc-700"
                            )} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Discord_Auth_Provision</h4>
                            <p className="text-[10px] text-zinc-600 font-mono uppercase">Enable Discord OAuth 2.0 provider</p>
                        </div>
                        <button 
                            onClick={() => updateSetting('discord_enabled', getVal('discord_enabled') === 'true' ? 'false' : 'true')}
                            className={cn(
                                "w-14 h-8 rounded-full border border-white/5 p-1 transition-all",
                                getVal('discord_enabled') === 'true' ? "bg-emerald-500/20 border-emerald-500/50" : "bg-white/5"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded-full transition-all duration-500",
                                getVal('discord_enabled') === 'true' ? "translate-x-7 bg-emerald-500" : "translate-x-0 bg-zinc-700"
                            )} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between group opacity-40">
                        <div className="space-y-1">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Credentials_Fallback</h4>
                            <p className="text-[10px] text-zinc-600 font-mono uppercase">Allow email/password authentication (LOCKED)</p>
                        </div>
                        <div className="w-14 h-8 rounded-full bg-white/5 border border-white/5 p-1 cursor-not-allowed">
                            <div className="w-5 h-5 rounded-full bg-zinc-900 shadow-xl" />
                        </div>
                    </div>
                </SpotlightBox>
            </div>

            {/* Session Management Group */}
            <div className="space-y-8">
                <div className="px-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <Zap className="w-5 h-5 text-purple-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Node_Continuity_Logic</h3>
                </div>

                <SpotlightBox className="p-10 rounded-[3rem] bg-[#050505] border border-white/5 space-y-10">
                    <div className="space-y-4 group">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest group-hover:text-purple-500 transition-colors">Session_Lifespan</h4>
                            <span className="text-[10px] font-mono text-zinc-600 uppercase italic">Measured in Hours</span>
                        </div>
                        <input 
                            type="range" 
                            min="24" 
                            max="720"
                            step="24"
                            value={getVal('session_expiry_hours')}
                            onChange={(e) => updateSetting('session_expiry_hours', e.target.value)}
                            className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
                            <span>24_Hr</span>
                            <span className="text-purple-500 font-bold">{getVal('session_expiry_hours')}_Hr_Current</span>
                            <span>30_Days</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest group-hover:text-purple-500 transition-colors">Two_Factor_Enforcement</h4>
                            <p className="text-[10px] text-zinc-600 font-mono uppercase">Require 2FA for administrative nodes</p>
                        </div>
                        <button 
                            onClick={() => updateSetting('require_2fa', getVal('require_2fa') === 'true' ? 'false' : 'true')}
                            className={cn(
                                "w-14 h-8 rounded-full border border-white/5 p-1 transition-all",
                                getVal('require_2fa') === 'true' ? "bg-purple-500/20 border-purple-500/50" : "bg-white/5"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded-full transition-all duration-500",
                                getVal('require_2fa') === 'true' ? "translate-x-7 bg-purple-500" : "translate-x-0 bg-zinc-700"
                            )} />
                        </button>
                    </div>
                </SpotlightBox>
            </div>

            {/* General Settings Bar (Full Width) */}
            <div className="lg:col-span-2 space-y-8">
                <div className="px-4 flex items-center gap-4">
                    <div className="p-3 bg-zinc-500/10 rounded-xl border border-white/10">
                        <Settings2 className="w-5 h-5 text-zinc-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Global_Broadcast_Configs</h3>
                </div>

                <SpotlightBox className="p-12 rounded-[3.5rem] bg-[#050505] border border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 px-2">Site_Title_Broadcast</label>
                            <input 
                                type="text"
                                defaultValue="AVRXT | FULL_STACK_ENGINEER"
                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm font-mono text-zinc-300 focus:outline-none focus:border-white/20 transition-all uppercase"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 px-2">Maintenance_Mode</label>
                            <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.01] border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex-1">OFFLINE_SIGNAL_DISABLED</span>
                                <button className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-white transition-colors">Toggle_Signal</button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-6">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Info className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h5 className="text-[11px] font-black text-white uppercase tracking-widest mb-2 italic">Data_Synchronicity: PROVISIONED</h5>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase leading-relaxed max-w-2xl font-medium">
                                Changes made to these settings will propagate across all system nodes in real-time. Ensure high-integrity inputs before saving protocol modifications.
                            </p>
                        </div>
                    </div>
                </SpotlightBox>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
