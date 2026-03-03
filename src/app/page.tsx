import Link from 'next/link';
import { Layout, Server, Cpu, ShieldCheck, Activity, ArrowUpRight, ArrowRight, Code2, BrainCircuit, CheckCircle, Sliders } from 'lucide-react';
import TypingText from '@/components/TypingText';
import Reveal from '@/components/Reveal';
import SpotlightBox from '@/components/SpotlightBox';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Building Scalable, Secure, & Beautiful Digital Solutions | avrxt",
  description: "Specializing in Full Stack Development, AI Agentic Workflows, and Custom Cloud Solutions. Over 50+ projects shipped with focus on security and performance.",
  keywords: ["Full Stack Developer", "AI Automation", "React Developer", "Next.js Expert", "Cloud Solutions", "Software Engineer India"],
  openGraph: {
    title: "avrxt | Infrastructure & Engineering",
    description: "Building the next generation of digital infrastructure.",
    type: "website",
    url: "https://avrxt.in",
  }
};

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6">
      {/* Hero Section */}
      <Reveal className="pt-48 pb-32 active">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-10 gradient-heading">
            Building Scalable, Secure, & Beautiful Digital Solutions.
          </h1>

          <TypingText />

          <div className="flex flex-wrap gap-4">
            <Link href="#expertise" className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
              View Stack
            </Link>
            <Link href="/hireme" className="px-8 py-4 border border-white/10 rounded-xl hover:bg-white/5 transition-all">
              Hire Me
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Metrics Section */}
      <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-32">
        <div className="resend-card p-10 rounded-2xl">
          <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Experience</span>
          <div className="text-4xl font-bold mt-2 text-white">3+ Years</div>
        </div>
        <div className="resend-card p-10 rounded-2xl">
          <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Projects</span>
          <div className="text-4xl font-bold mt-2 text-white">50+ Shipped</div>
        </div>
        <div className="resend-card p-10 rounded-2xl">
          <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Specialization</span>
          <div className="text-4xl font-bold mt-2 text-emerald-500">AI Logic</div>
        </div>
      </Reveal>

      {/* About Section */}
      <Reveal id="about" className="py-32 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div>
            <h2 className="text-xs uppercase tracking-[0.4em] text-zinc-600 mb-4">{"// Origin"}</h2>
            <h3 className="text-4xl font-bold tracking-tighter leading-none text-white">Full Stack <br />Developer</h3>
          </div>
          <div className="lg:col-span-2 text-lg text-zinc-400 leading-relaxed space-y-6">
            <p>I&apos;m a passionate full-stack developer who thrives on creating comprehensive digital solutions. From elegant frontend interfaces to robust backend architecture, server management to cutting-edge AI automation - I handle the complete technology stack.</p>
            <p>With expertise spanning modern web frameworks, database design, API development, and AI integration, I deliver scalable solutions that drive business growth.</p>
            <div className="p-6 bg-white/5 border-l-2 border-white rounded-r-xl">
              <p className="text-white font-medium">Ready to build the future of your infrastructure.</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Expertise Section */}
      <Reveal id="expertise" className="py-32">
        <div className="mb-20">
          <h2 className="text-5xl font-bold tracking-tighter mb-4 text-white">Tech Stack</h2>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">A comprehensive mastery of modern tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="resend-card p-8 rounded-2xl">
            <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layout className="w-4 h-4" /> Frontend
            </h4>
            <div className="flex flex-wrap gap-2">
              {["React", "Next.js", "TypeScript", "Tailwind"].map(skill => (
                <span key={skill} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300">{skill}</span>
              ))}
            </div>
          </div>
          <div className="resend-card p-8 rounded-2xl">
            <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Server className="w-4 h-4" /> Backend
            </h4>
            <div className="flex flex-wrap gap-2">
              {["Node.js", "Express", "Supabase", "PostgreSQL"].map(skill => (
                <span key={skill} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300">{skill}</span>
              ))}
            </div>
          </div>
          <div className="resend-card p-8 rounded-2xl">
            <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Automation
            </h4>
            <div className="flex flex-wrap gap-2">
              {["AI Agentic Workflows", "LLM Integration", "Lua (FiveM)"].map(skill => (
                <span key={skill} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300">{skill}</span>
              ))}
            </div>
          </div>
          <div className="resend-card p-8 rounded-2xl">
            <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> DevOps
            </h4>
            <div className="flex flex-wrap gap-2">
              {["Server Hardening", "CI/CD Pipelines", "Docker"].map(skill => (
                <span key={skill} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Projects Section */}
      <Reveal id="projects" className="py-32 border-t border-white/5">
        <div className="mb-20">
          <h2 className="text-5xl font-bold tracking-tighter mb-4 text-white">Featured Projects</h2>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Shipped & Production-Ready.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="https://ping.avrxt.in" target="_blank" className="resend-card p-8 rounded-2xl block group">
            <div className="flex justify-between items-start mb-12">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                <Activity className="w-5 h-5 text-zinc-400" />
              </div>
              <span className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tighter mb-4 text-white">Infrastructure Status Plane</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              Real-time visibility into core systems. Performs deep-link health checks every 300 seconds, rendering a live availability pulse through a glassmorphic dark-mesh interface.
            </p>
            <div className="flex items-center text-white text-[10px] font-bold uppercase tracking-widest gap-2">
              View System <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>

          <div className="resend-card p-8 rounded-2xl flex flex-col justify-center items-center text-center opacity-40">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <span className="text-2xl text-zinc-700">+</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Transmission Pending...</p>
          </div>
        </div>
      </Reveal>

      {/* Subscribe Section */}
      <Reveal id="subscribe" className="py-32 border-t border-white/5">
        <SpotlightBox>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4 font-mono">{"// Stay Updated"}</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 gradient-heading">
                Access Exclusive <br />Tech Insights.
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed max-w-md">
                Subscribe to get the latest articles on Full Stack Development, AI Automation, and API Design. No spam, just pure code.
              </p>
              <Link href="/subscribe"
                className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                Subscribe Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] flex gap-4 items-start">
                <Code2 className="w-5 h-5 text-zinc-500 mt-1" />
                <div>
                  <h4 className="font-bold text-sm text-white">Full Stack Mastery</h4>
                  <p className="text-xs text-zinc-500 mt-1">Deep dives into React, Node, and scalable architecture.</p>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] flex gap-4 items-start">
                <BrainCircuit className="w-5 h-5 text-zinc-500 mt-1" />
                <div>
                  <h4 className="font-bold text-sm text-white">AI Automation</h4>
                  <p className="text-xs text-zinc-500 mt-1">Practical guides on LLMs and agentic workflows.</p>
                </div>
              </div>
            </div>
          </div>
        </SpotlightBox>
      </Reveal>

      {/* Solutions Section */}
      <Reveal id="solutions" className="py-32 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div>
            <h2 className="text-xs uppercase tracking-[0.4em] text-zinc-600 mb-4">{"// Business Layer"}</h2>
            <h3 className="text-4xl font-bold tracking-tighter text-white">Enterprise-Ready Solutions</h3>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="resend-card p-6 rounded-xl flex gap-6 items-center">
              <CheckCircle className="w-6 h-6 text-zinc-500" />
              <div>
                <h4 className="font-bold text-white">Enterprise Ready</h4>
                <p className="text-sm text-zinc-500">Odoo, ERPNext, Dolibarr implementation for scale.</p>
              </div>
            </div>
            <div className="resend-card p-6 rounded-xl flex gap-6 items-center">
              <Sliders className="w-6 h-6 text-zinc-500" />
              <div>
                <h4 className="font-bold text-white">Custom Configuration</h4>
                <p className="text-sm text-zinc-500">Tailored setup for specific industry needs.</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* CTA Section */}
      <Reveal className="py-48 text-center">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 gradient-heading">Let&apos;s build something <br />exceptional.</h2>
        <div className="flex justify-center gap-6">
          <Link href="/contact" className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
            Start Conversation
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
