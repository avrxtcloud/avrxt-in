'use client';

import React, { useState, useTransition } from 'react';
import { Send, Users, History, Mail, Eye, Code, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { broadcastEmailAction } from '@/app/actions/mail';

interface MailAdminClientProps {
  stats: {
    active_count: number;
    unverified_count: number;
    unsubscribed_count: number;
  };
  recentBroadcasts: any[];
}

export default function MailAdminClient({ stats, recentBroadcasts }: MailAdminClientProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSend = async () => {
    if (!subject || !content) {
      setStatus({ type: 'error', message: 'Subject and content are required' });
      return;
    }

    if (!confirm(`Are you sure you want to send this broadcast to ${stats.active_count} active subscribers?`)) return;

    startTransition(async () => {
      try {
        const result = await broadcastEmailAction(subject, content);
        if (result.success) {
          setStatus({ type: 'success', message: `Broadcast sent successfully to ${result.count} recipients!` });
          setSubject('');
          setContent('');
        } else {
          setStatus({ type: 'error', message: result.error || 'Failed to send broadcast' });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'An unexpected error occurred' });
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-outfit">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Broadcast System</h1>
            <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Admin / Newsletter / AWS SES</p>
          </div>
          <div className="flex gap-4">
             <StatCard icon={<Users size={16}/>} label="Active" value={stats.active_count} color="text-emerald-400" />
             <StatCard icon={<Mail size={16}/>} label="Pending" value={stats.unverified_count} color="text-amber-400" />
             <StatCard icon={<AlertCircle size={16}/>} label="Opt-out" value={stats.unsubscribed_count} color="text-rose-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                     <Send size={14} className="text-zinc-400"/>
                   </div>
                   <span className="text-sm font-bold uppercase tracking-wider">New Broadcast</span>
                </div>
                <div className="flex bg-black rounded-xl p-1 border border-zinc-800">
                   <button 
                     onClick={() => setPreviewMode(false)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!previewMode ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                     <div className="flex items-center gap-2"><Code size={12}/> EDITOR</div>
                   </button>
                   <button 
                     onClick={() => setPreviewMode(true)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${previewMode ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                     <div className="flex items-center gap-2"><Eye size={12}/> PREVIEW</div>
                   </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-1">Email Subject</label>
                   <input 
                     type="text"
                     value={subject}
                     onChange={(e) => setSubject(e.target.value)}
                     placeholder="Enter a compelling subject line..."
                     className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-700"
                   />
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-1">HTML Content</label>
                   {previewMode ? (
                     <div className="w-full min-h-[400px] bg-white text-black rounded-xl p-8 overflow-auto border border-zinc-800 shadow-inner">
                        {content ? (
                           <div dangerouslySetInnerHTML={{ __html: content }} />
                        ) : (
                           <div className="flex flex-col items-center justify-center h-full text-zinc-300 gap-4 py-20">
                              <Eye size={40} className="opacity-20"/>
                              <p className="text-sm font-medium">Nothing to preview yet</p>
                           </div>
                        )}
                     </div>
                   ) : (
                     <textarea 
                       value={content}
                       onChange={(e) => setContent(e.target.value)}
                       placeholder="<h1 style='color: #000;'>Hello world</h1>..."
                       className="w-full min-h-[400px] bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-700 resize-none"
                     />
                   )}
                 </div>

                 {status && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                      {status.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                      <span className="text-xs font-bold uppercase tracking-wider">{status.message}</span>
                    </div>
                 )}

                 <button 
                   onClick={handleSend}
                   disabled={isPending || !subject || !content}
                   className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]"
                 >
                   {isPending ? <Loader2 className="animate-spin" size={20}/> : <Send size={18}/>}
                   {isPending ? 'DISPATCHING...' : 'SEND BROADCAST'}
                 </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <History size={16}/>
                <h2 className="text-xs font-bold uppercase tracking-widest">Recent Activity</h2>
              </div>
              <div className="space-y-4">
                {recentBroadcasts.length > 0 ? recentBroadcasts.map((b, i) => (
                  <div key={i} className="group p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-colors">
                    <p className="text-xs font-bold line-clamp-1 mb-2 group-hover:text-white transition-colors">{b.subject}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>{new Date(b.sent_at).toLocaleDateString()}</span>
                      <span className="bg-zinc-800 px-2 py-0.5 rounded text-white">{b.recipient_count} SENT</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-zinc-600 text-center py-8 text-xs italic">No broadcasts sent yet.</div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-8">
               <h3 className="text-sm font-bold mb-2">Professional Tips</h3>
               <p className="text-xs text-zinc-400 leading-relaxed">
                 Use inline CSS for maximum email client compatibility. Keep subject lines under 60 characters for best open rates.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 min-w-[120px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-zinc-500">{icon}</span>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
