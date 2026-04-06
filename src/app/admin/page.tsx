import { db } from "@/lib/db";
import { user as userTable, session as sessionTable } from "@/lib/db/schema";
import { count, inArray } from "drizzle-orm";
import { 
    Users, 
    ShieldAlert, 
    History, 
    Zap,
    Activity,
    TrendingUp,
    Server
} from "lucide-react";
import Tilt from "@/components/Tilt";
import SpotlightBox from "@/components/SpotlightBox";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
    // Fetch stats from Neon (Auth DB)
    const [userCount] = await db.select({ value: count() }).from(userTable);
    const [sessionCount] = await db.select({ value: count() }).from(sessionTable);
    
    // Fetch recent logs from Supabase (App DB)
    const supabase = await createClient();
    const { data: rawLogs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

    let recentLogs: any[] = [];

    if (rawLogs && rawLogs.length > 0) {
        // Collect unique user IDs to fetch from Neon
        const userIds = [...new Set(rawLogs.map(log => log.user_id).filter(Boolean))];
        
        let usersMap: Record<string, any> = {};
        if (userIds.length > 0) {
            const users = await db.select().from(userTable).where(inArray(userTable.id, userIds as string[]));
            usersMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
        }

        recentLogs = rawLogs.map(log => ({
            id: log.id,
            timestamp: log.timestamp,
            action: log.action,
            severity: log.severity,
            user: usersMap[log.user_id] || { name: 'SYSTEM' }
        }));
    }

    const stats = [
        { label: "Total_Users", value: userCount.value, icon: Users, color: "text-emerald-500", trend: "+5%_MO_MO" },
        { label: "Active_Sessions", value: sessionCount.value, icon: Zap, color: "text-cyan-500", trend: "NOMINAL" },
        { label: "Security_Incidents", value: 0, icon: ShieldAlert, color: "text-red-500", trend: "ZERO_THRESHOLD" },
        { label: "System_Uptime", value: "99.98%", icon: Server, color: "text-purple-500", trend: "STABLE" },
    ];

    return (
        <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Tilt key={i} intensity={5}>
                        <div className="resend-card p-10 rounded-[2.5rem] border border-white/5 bg-[#050505]/40 backdrop-blur-xl group hover:border-white/20 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.2)]">
                            <div className="flex justify-between items-start mb-10">
                                <div className={cn("p-4 rounded-2xl bg-white/[0.02] border border-white/5", stat.color)}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{stat.trend}</span>
                            </div>
                            <h3 className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.4em] mb-2">{stat.label}</h3>
                            <div className="text-5xl font-black tracking-tighter text-white">{stat.value}</div>
                        </div>
                    </Tilt>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Logs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-zinc-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Audit_Log_Stream</h3>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-colors">View_Full_Archive</button>
                    </div>

                    <SpotlightBox className="p-0 rounded-[3rem] overflow-hidden bg-[#050505] border border-white/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01]">
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-700">Timestamp</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-700">Actor</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-700">Action_Hash</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLogs.length > 0 ? recentLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                                            <td className="p-8 font-mono text-[10px] text-zinc-600 uppercase">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">
                                                        {log.user?.name?.[0] || 'S'}
                                                    </div>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">{log.user?.name || 'SYSTEM'}</span>
                                                </div>
                                            </td>
                                            <td className="p-8 font-mono text-[10px] text-zinc-500">
                                                {log.action}
                                            </td>
                                            <td className="p-8">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    log.severity === 'CRITICAL' ? "text-red-500 border-red-500/20 bg-red-500/5" : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                                                )}>
                                                    {log.severity || 'SUCCESS'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-20 text-center text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                                                No_Active_Signals_Detected_
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </SpotlightBox>
                </div>

                {/* System Efficiency / Shortcuts */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-4">
                        <TrendingUp className="w-5 h-5 text-zinc-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Core_Operations</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: "Broadcast_Signal", desc: "Global system announcement", icon: Activity },
                            { title: "Terminal_Access", desc: "Low-level system overrides", icon: Zap },
                            { title: "Archive_Wipe", desc: "Secure data sanitization", icon: ShieldAlert },
                        ].map((op, i) => (
                            <button key={i} className="w-full text-left p-8 rounded-[2rem] border border-white/5 bg-[#050505]/40 hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">{op.title}</h4>
                                        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">{op.desc}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                        <op.icon className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        ))}

                        <div className="p-8 rounded-[2rem] border border-dashed border-white/10 opacity-30 text-center">
                            <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Module_Slot_Available</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper for class consolidation
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

