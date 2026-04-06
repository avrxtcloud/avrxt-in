'use client';
import React from 'react';


import { useState } from "react";
import { Search, Filter, MoreVertical, ShieldBan, ShieldCheck, UserCog, Mail, Calendar, MapPin, Globe, Activity, History } from "lucide-react";
import SpotlightBox from "@/components/SpotlightBox";
import { adminSetBanStatus, adminSetRole } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    lastLogin: Date | null;
    lastIp: string | null;
    createdAt: Date;
}

export default function UsersClient({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const toggleBan = async (userId: string, isCurrentlyBanned: boolean) => {
        const reason = isCurrentlyBanned ? null : prompt("Enter ban reason:") || "Violation of terms";
        await adminSetBanStatus(userId, !isCurrentlyBanned, reason || "");
        
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, banned: !isCurrentlyBanned, banReason: reason } : u));
    };

    const changeRole = async (userId: string, currentRole: string | null) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        await adminSetRole(userId, newRole);

        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    return (
        <div className="space-y-10">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center px-4">
                <div className="relative w-full md:w-[400px] group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search_Userbase..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#050505] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-mono text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700 placeholder:uppercase"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        Total_Nodes: <span className="text-emerald-500 font-bold">{users.length}</span>
                    </div>
                    <button className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                        <Filter className="w-5 h-5 text-zinc-600" />
                    </button>
                    <button className="bg-emerald-500 text-black px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        Add_System_Node
                    </button>
                </div>
            </div>

            {/* Content Split: Users Table + User Profile View */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full min-h-[600px]">
                {/* Users List Container */}
                <div className="xl:col-span-8">
                    <SpotlightBox className="p-0 rounded-[3rem] overflow-hidden bg-[#050505] border border-white/5 h-full">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.01] border-b border-white/5 font-mono">
                                    <tr>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-700">Identity</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-700">Role</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-700">Access_Level</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-700 text-right">Operation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr 
                                            key={user.id} 
                                            onClick={() => setSelectedUser(user)}
                                            className={cn(
                                                "border-b border-white/[0.02] hover:bg-white/[0.01] transition-all cursor-pointer group",
                                                selectedUser?.id === user.id && "bg-white/[0.03]"
                                            )}
                                        >
                                            <td className="p-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                        {user.image ? (
                                                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-sm font-black text-zinc-700">{user.name[0]}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-white uppercase tracking-tighter">{user.name}</span>
                                                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter truncate max-w-[150px]">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    user.role === 'admin' ? "text-purple-400 border-purple-500/20 bg-purple-500/5" : "text-zinc-500 border-white/10 bg-white/5"
                                                )}>
                                                    {user.role || 'user_'}
                                                </span>
                                            </td>
                                            <td className="p-8">
                                                <div className={cn(
                                                    "flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]",
                                                    user.banned ? "text-red-500" : "text-emerald-500"
                                                )}>
                                                    <div className={cn("w-1 h-1 rounded-full", user.banned ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
                                                    {user.banned ? "IN_LOCKDOWN" : "STABLE_"}
                                                </div>
                                            </td>
                                            <td className="p-8 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); toggleBan(user.id, !!user.banned); }}
                                                        className={cn(
                                                            "p-3 rounded-xl border transition-all",
                                                            user.banned ? "text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/5" : "text-red-500 border-red-500/20 hover:bg-red-500/5"
                                                        )}
                                                        title={user.banned ? "Unban_User" : "Ban_User"}
                                                    >
                                                        {user.banned ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); changeRole(user.id, user.role); }}
                                                        className="p-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all"
                                                        title="Assign_Internal_Role"
                                                    >
                                                        <UserCog className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SpotlightBox>
                </div>

                {/* User Detail View Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                    {selectedUser ? (
                        <div className="resend-card p-10 rounded-[3rem] border border-white/5 bg-[#050505] space-y-12 h-fit md:sticky top-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 p-2 mb-8 relative group">
                                    <div className="w-full h-full rounded-[1.5rem] bg-[#020202] border border-white/5 flex items-center justify-center overflow-hidden">
                                        {selectedUser.image ? (
                                            <img src={selectedUser.image} alt={selectedUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black text-zinc-800">{selectedUser.name[0]}</span>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-2 -right-2 p-3 rounded-2xl border bg-[#050505]",
                                        selectedUser.banned ? "text-red-500 border-red-900/50" : "text-emerald-500 border-emerald-900/50"
                                    )}>
                                        <Activity className={cn("w-4 h-4", !selectedUser.banned && "animate-pulse")} />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic">{selectedUser.name}</h3>
                                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em] mt-2 mb-4">Node_Identifier: {selectedUser.id.slice(0, 12)}...</p>
                                
                                {selectedUser.banned && (
                                    <div className="px-6 py-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-mono uppercase tracking-widest mt-4">
                                        RESTORE_CODE_REQUIRED: {selectedUser.banReason}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-4 text-zinc-500 group">
                                    <Mail className="w-4 h-4 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                                    <span className="text-xs font-mono truncate">{selectedUser.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-500 group">
                                    <Calendar className="w-4 h-4 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                                    <span className="text-xs font-mono">Linked_Since: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-500 group">
                                    <MapPin className="w-4 h-4 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                                    <span className="text-xs font-mono">Terminal_IPv: {selectedUser.lastIp || 'INTERNAL'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-center">
                                    <Globe className="w-4 h-4 mx-auto mb-3 text-zinc-700" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Linked_Accounts</span>
                                </button>
                                <button className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-center">
                                    <History className="w-4 h-4 mx-auto mb-3 text-zinc-700" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Node_Archive</span>
                                </button>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <button className="w-full py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">
                                    Open_Secure_Protocol
                                </button>
                                <button className="w-full py-5 rounded-2xl border border-red-500/20 text-red-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/5 transition-all">
                                    Emergency_Purge_Node
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] border border-dashed border-white/10 rounded-[3rem] flex items-center justify-center text-center p-12 bg-white/[0.01]">
                            <div>
                                <ShieldCheck className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                                <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-[0.5em] leading-relaxed">
                                    SELECT_A_NODE_TO_INITIALIZE_MODERATION_VIEWPORT_
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
