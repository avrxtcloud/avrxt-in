'use client';

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    Users, 
    Activity, 
    Settings, 
    LayoutDashboard, 
    LogOut, 
    Menu, 
    X, 
    ShieldCheck,
    Bell,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import Reveal from "@/components/Reveal";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Protection check
    useEffect(() => {
        if (!isPending && (!session?.user || (session.user as any).role !== 'admin')) {
            router.push('https://auth.avrxt.in/login/admin');
        }
    }, [session, isPending, router]);

    if (isPending || !session?.user || (session.user as any).role !== 'admin') {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }


    const navigation = [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Audit Logs", href: "/admin/logs", icon: Activity },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#020202] text-zinc-400 font-medium selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Sidebar Desktop */}
            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#050505] border-r border-white/5 z-40 hidden lg:flex flex-col">
                <div className="p-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-white font-black tracking-tighter text-lg uppercase italic">AVRXT_CORE</span>
                    </Link>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group",
                                    isActive 
                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                        : "hover:bg-white/[0.03] hover:text-white border border-transparent"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-emerald-500" : "text-zinc-600 group-hover:text-white")} />
                                <span className="text-sm font-bold uppercase tracking-widest">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 border-t border-white/5 mt-auto">
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center overflow-hidden">
                                {session.user.image ? (
                                    <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-black">{session.user.name[0]}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{session.user.name}</p>
                                <p className="text-[10px] text-zinc-600 font-mono truncate uppercase">ADMIN_CLEARANCE</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={async () => {
                            await signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push('/');
                                    }
                                }
                            });
                        }}

                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-white/5 hover:bg-red-500/5 hover:border-red-500/20 hover:text-red-500 transition-all group"
                    >
                        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        <span className="text-xs font-black uppercase tracking-widest">Terminate_Session</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-3xl border-b border-white/5 p-6 flex justify-between items-center z-50">
                <span className="text-white font-black tracking-tighter text-sm uppercase">AVRXT_CORE</span>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white/5 rounded-xl">
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Nav */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-[#020202] pt-28 px-10">
                    <nav className="space-y-4">
                        {navigation.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-6 p-6 rounded-3xl",
                                    pathname === item.href ? "bg-emerald-500/10 text-emerald-500" : "bg-white/[0.02]"
                                )}
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="text-lg font-black uppercase tracking-tighter">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Main Area */}
            <main className="lg:pl-72 pt-24 lg:pt-0 min-h-screen">
                <header className="hidden lg:flex p-10 justify-between items-center border-b border-white/10 sticky top-0 bg-[#020202]/50 backdrop-blur-3xl z-30">
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                            {navigation.find(n => n.href === pathname)?.name || 'Command_Center'}
                        </h2>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-3 text-[10px] font-mono text-emerald-500 tracking-widest uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            System_Operational
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050505]" />
                        </button>
                        <Link href="/" target="_blank" className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <ExternalLink className="w-4 h-4" /> View_Site
                        </Link>
                    </div>
                </header>

                <div className="p-10 max-w-[1600px] mx-auto">
                    <Reveal>
                        {children}
                    </Reveal>
                </div>
            </main>
        </div>
    );
}
