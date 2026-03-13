import Link from 'next/link';
import { Layout, Server, Cpu, ShieldCheck, Activity, ArrowUpRight, ArrowRight, Code2, BrainCircuit, CheckCircle, Sliders } from 'lucide-react';
import TypingText from '@/components/TypingText';
import Reveal from '@/components/Reveal';
import SpotlightBox from '@/components/SpotlightBox';
import Tilt from '@/components/Tilt';
import { Metadata } from 'next';

// ... (metadata omitted)

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6 overflow-x-hidden pt-24">
      {/* Hero Section */}
      <Reveal className="pt-32 pb-32">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter mb-10 gradient-heading py-2">
            Engineering <br />Digital Assets.
          </h1>

          <TypingText />

          <div className="flex flex-wrap gap-4 mt-12">
            <Link href="#expertise" className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
              View Stack
            </Link>
            <Link href="/hireme" className="px-10 py-5 border border-white/10 rounded-2xl hover:bg-white/5 font-black text-xs uppercase tracking-widest transition-all">
              Initiate_Hire_
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
        {[
          { label: 'Experience', val: '3+ Years' },
          { label: 'Projects', val: '50+ Shipped' },
          { label: 'Specialization', val: 'AI Logic', color: 'text-emerald-500' }
        ].map((m, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <Tilt intensity={5}>
              <div className="resend-card p-10 rounded-3xl border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-xl group hover:border-white/20 transition-all">
                <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.4em] mb-4 block group-hover:text-zinc-400 transition-colors">{m.label}</span>
                <div className={`text-4xl md:text-5xl font-black tracking-tighter mt-2 text-white ${m.color || ''}`}>{m.val}</div>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>

      {/* About Section */}
      <Reveal id="about" className="py-48 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.6em] text-zinc-700 mb-6 font-mono">{"// The_Core"}</h2>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] text-white">Full Stack <br /><span className="text-zinc-800 italic">Engineer_</span></h3>
          </div>
          <div className="lg:col-span-2 text-xl text-zinc-500 leading-relaxed space-y-8 font-medium">
            <p>I thrive on creating high-performance digital ecosystems. From high-end frontend glassmorphism to redundant backend infrastructure and neural-grade AI workflows.</p>
            <p>Mastering the intersection of design aesthetics and architectural scale to deliver products that don&apos;t just function, but inspire.</p>
            <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <p className="text-white font-bold relative z-10">Architecting tomorrow&apos;s digital infrastructure today.</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Expertise Section */}
      <Reveal id="expertise" className="py-32">
        <div className="mb-24 flex items-center justify-between">
          <div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-white">Tech_Stack.</h2>
            <p className="text-zinc-700 font-mono text-[10px] uppercase tracking-[0.5em]">Commanding modern frameworks and low-level logic.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Layout, title: 'Frontend', skills: ["React", "Next.js", "TypeScript", "Tailwind"] },
            { icon: Server, title: 'Backend', skills: ["Node.js", "Express", "Supabase", "PostgreSQL"] },
            { icon: Cpu, title: 'Automation', skills: ["AI Workflows", "LLM Integration", "Lua (FiveM)"] },
            { icon: ShieldCheck, title: 'DevOps', skills: ["Server Hardening", "CI/CD", "Docker", "R2"] }
          ].map((stack, i) => (
            <Tilt key={i} intensity={8}>
              <div className="resend-card p-12 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl group hover:border-emerald-500/20 transition-all">
                <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-10 flex items-center gap-3 group-hover:text-emerald-500 transition-colors">
                  <stack.icon className="w-4 h-4" /> {stack.title}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {stack.skills.map(skill => (
                    <span key={skill} className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{skill}</span>
                  ))}
                </div>
              </div>
            </Tilt>
          ))}
        </div>
      </Reveal>

      {/* Projects Section */}
      <Reveal id="projects" className="py-48 border-t border-white/5">
        <div className="mb-24">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-white">Archives.</h2>
          <p className="text-zinc-700 font-mono text-[10px] uppercase tracking-[0.5em]">Live digital ecosystems in production.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Reveal>
            <Link href="https://ping.avrxt.in" target="_blank" className="block group cursor-none">
              <Tilt intensity={10}>
                <div className="resend-card p-12 rounded-[3rem] border border-white/5 bg-[#0a0a0a] group-hover:border-emerald-500/30 transition-all shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                  <div className="flex justify-between items-start mb-20">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <Activity className="w-6 h-6" />
                    </div>
                    <span className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] tracking-[0.5em] uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
                      Live_Uplink
                    </span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-white group-hover:italic transition-all">Status Plane_</h3>
                  <p className="text-zinc-600 text-lg leading-relaxed mb-12 font-medium">
                    Real-time observability node. Deep-link health monitoring for core infrastructure with glassmorphic interface architecture.
                  </p>
                  <div className="flex items-center text-white text-[10px] font-black uppercase tracking-[0.3em] gap-3">
                    Decentralized_View <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Tilt>
            </Link>
          </Reveal>

          <div className="p-12 rounded-[3rem] border border-white/5 bg-[#0a0a0a]/20 flex flex-col justify-center items-center text-center opacity-30 border-dashed">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <span className="text-3xl font-black text-zinc-800">+</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.6em] text-zinc-800">Transmission_Pending</p>
          </div>
        </div>
      </Reveal>

      {/* Subscribe Section */}
      <Reveal id="subscribe" className="py-32 border-t border-white/5">
        <SpotlightBox className="rounded-[3rem] p-12 md:p-24 overflow-hidden border border-white/5 bg-[#080808]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.6em] text-zinc-700 mb-8 font-mono">{"// Signal_Transmit"}</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 gradient-heading leading-[0.85]">
                Exclusive <br />Engineering <br />Insights.
              </h2>
              <p className="text-zinc-500 text-xl mb-12 leading-relaxed max-w-md font-medium">
                Subscribe to get the latest articles on Full Stack Development and AI Automation.
              </p>
              <Link href="/subscribe"
                className="inline-flex items-center gap-4 bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95">
                Subscribe Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {[
                { icon: Code2, title: 'Full Stack Mastery', desc: 'Deep architecture patterns.' },
                { icon: BrainCircuit, title: 'Neural Systems', desc: 'Practical agentic workflows.' }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] flex gap-6 items-center group hover:bg-white/[0.05] transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white uppercase tracking-widest">{item.title}</h4>
                    <p className="text-[11px] text-zinc-700 mt-1 uppercase tracking-wider">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SpotlightBox>
      </Reveal>

      {/* CTA Section */}
      <Reveal className="py-64 text-center">
        <h2 className="text-6xl md:text-9xl font-black tracking-tighter mb-12 gradient-heading py-4">Build_Superior.</h2>
        <div className="flex justify-center">
          <Link href="/contact" className="bg-white text-black px-16 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:scale-110 active:scale-95 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.2)]">
            Initiate_Protocol
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
