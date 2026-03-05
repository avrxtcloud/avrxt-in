'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
    Instagram, Github, Mail, Play, Pause, Camera, BookOpen,
    ExternalLink, ArrowRight, ChevronRight, Share2, Activity,
    Cloud, Sun, Thermometer, MapPin, Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import { MeConfig } from '@/lib/me-config';

const iconMap: Record<string, any> = {
    Instagram, Github, Mail, Camera, BookOpen, ExternalLink, ArrowRight, ChevronRight, Share2
};

interface MeClientProps {
    initialConfig: MeConfig;
}

export default function MeClient({ initialConfig }: MeClientProps) {
    const [config, setConfig] = useState<MeConfig>(initialConfig);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isImmersive, setIsImmersive] = useState(false);
    const [subscribeStatus, setSubscribeStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const ytIframeRef = useRef<HTMLIFrameElement>(null);
    const [isYtPlaying, setIsYtPlaying] = useState(false);
    const ytProgressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const [ytProgress, setYtProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (!isNaN(audio.duration)) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setIsImmersive(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            audio.play().catch(() => { });
            setIsPlaying(true);
            setIsImmersive(true);
        } else {
            audio.pause();
            setIsPlaying(false);
            setIsImmersive(false);
        }
    };

    // YouTube iframe postMessage play/pause
    const toggleYtPlay = () => {
        const iframe = ytIframeRef.current;
        if (!iframe?.contentWindow) return;
        if (isYtPlaying) {
            iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
            setIsYtPlaying(false);
            setIsImmersive(false);
            if (ytProgressTimer.current) clearInterval(ytProgressTimer.current);
        } else {
            iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
            setIsYtPlaying(true);
            setIsImmersive(true);
            // Animate progress bar locally (YouTube doesn't expose currentTime via postMessage)
            ytProgressTimer.current = setInterval(() => {
                setYtProgress(p => {
                    if (p >= 100) {
                        clearInterval(ytProgressTimer.current!);
                        setIsYtPlaying(false);
                        setIsImmersive(false);
                        return 0;
                    }
                    return p + 0.05; // ~3 minute song assumption; visual only
                });
            }, 1000);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const value = parseFloat(e.target.value);
        audio.currentTime = (value / 100) * audio.duration;
        setProgress(value);
    };

    const [weather, setWeather] = useState<any>(null);

    // Weather Fetching (Open-Meteo)
    useEffect(() => {
        if (!config.profile.weatherEnabled || !config.profile.location) {
            setWeather(null);
            return;
        }

        const fetchWeather = async () => {
            try {
                // 1. Geocoding - use only city name if comma provided to increase hit rate
                const cityName = config.profile.location?.split(',')[0].trim() || '';
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
                const geoData = await geoRes.json();

                if (!geoData.results?.[0]) {
                    console.warn('Geocoding failed for:', cityName);
                    return;
                }
                const { latitude, longitude, name, country } = geoData.results[0];

                // 2. Weather
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,apparent_temperature`);
                const weatherData = await weatherRes.json();

                if (weatherData.current_weather) {
                    setWeather({
                        temp: Math.round(weatherData.current_weather.temperature),
                        condition: weatherData.current_weather.weathercode,
                        location: `${name}, ${country || ''}`,
                        humidity: weatherData.hourly.relativehumidity_2m[0],
                        feelsLike: Math.round(weatherData.hourly.apparent_temperature[0])
                    });
                }
            } catch (error) {
                console.error('Weather fetch error:', error);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 1800000); // 30 mins
        return () => clearInterval(interval);
    }, [config.profile.location, config.profile.weatherEnabled]);

    const [dailyQuote, setDailyQuote] = useState<{ text: string, author: string } | null>(null);

    // Daily Quote Fetching (Every 24h)
    useEffect(() => {
        if (!config.widgets?.quotesEnabled) return;

        const fetchQuote = async () => {
            try {
                // Use a proxy to avoid CORS OR use a daily seed if no API
                // For now, let's use a very reliable daily endpoint
                const res = await fetch('https://api.quotable.io/random?tags=inspirational');
                if (res.ok) {
                    const data = await res.json();
                    setDailyQuote({ text: data.content, author: data.author });
                } else {
                    // Fallback
                    setDailyQuote({ text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" });
                }
            } catch (error) {
                setDailyQuote({ text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" });
            }
        };

        fetchQuote();
    }, [config.widgets?.quotesEnabled]);

    // Check if Note is active (24h)
    const isNoteActive = () => {
        if (!config.widgets?.notesEnabled || !config.widgets?.note?.text || !config.widgets?.note?.createdAt) return false;

        const noteDate = new Date(config.widgets.note.createdAt).getTime();
        const now = new Date().getTime();
        const diffHours = (now - noteDate) / (1000 * 60 * 60);

        return diffHours < 24;
    };

    const [spotifyData, setSpotifyData] = useState<any>(null);
    const [isSpotifyLive, setIsSpotifyLive] = useState(config.music.spotifyEnabled);

    // Spotify Live Polling
    useEffect(() => {
        if (!config.music.spotifyEnabled) return;

        const fetchNowPlaying = async () => {
            try {
                const res = await fetch('/api/spotify/now-playing');
                const data = await res.json();
                setSpotifyData(data);
            } catch (error) {
                console.error('Spotify fetch error:', error);
            }
        };

        fetchNowPlaying();
        const interval = setInterval(fetchNowPlaying, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [config.music.spotifyEnabled]);

    const [presenceData, setPresenceData] = useState<any>(null);

    // Lanyard WebSocket Real-time Connection
    useEffect(() => {
        const discordId = config.profile.presence?.discordId?.trim();
        if (config.profile.presence?.mode !== 'auto' || !discordId) {
            setPresenceData(null);
            return;
        }

        let socket: WebSocket | null = null;
        let heartbeatInterval: any = null;

        const connect = () => {
            const ws = new WebSocket('wss://api.lanyard.rest/socket');
            socket = ws;

            ws.onopen = () => {
                console.log('Lanyard Uplink: CONNECTED');
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log(`Lanyard Op:${message.op} Type:${message.t}`, message.d);

                // Initial Hello (Receive Heartbeat Interval)
                if (message.op === 1) {
                    heartbeatInterval = setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ op: 3 }));
                        }
                    }, message.d.heartbeat_interval);

                    // Subscribe to individual user
                    ws.send(JSON.stringify({
                        op: 2,
                        d: { subscribe_to_id: discordId }
                    }));
                }

                // Initial State or Update
                if (message.op === 0) {
                    if (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE') {
                        setPresenceData(message.d);
                    }
                }
            };

            ws.onclose = () => {
                console.log('Lanyard Uplink: DISCONNECTED');
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                // Attempt to reconnect after 5s if still in auto mode
                setTimeout(() => {
                    if (config.profile.presence?.mode === 'auto') connect();
                }, 5000);
            };

            ws.onerror = (err) => {
                console.error('Lanyard Socket Error:', err);
                ws.close();
            };
        };

        connect();

        return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            if (socket) {
                socket.onclose = null; // Prevent reconnect on cleanup
                socket.close();
            }
        };
    }, [config.profile.presence?.mode, config.profile.presence?.discordId]);

    // Supabase Realtime Subscription
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('me_config_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'me_config',
                    filter: 'key=eq.main_config'
                },
                (payload) => {
                    console.log('Me Config Synchronized:', payload.new);
                    if (payload.new && (payload.new as any).data) {
                        setConfig((payload.new as any).data as MeConfig);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const formatTimeAgo = (date: string) => {
        if (!date) return '';
        const now = new Date();
        const playedAt = new Date(date);
        const diffInSeconds = Math.floor((now.getTime() - playedAt.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays}d ago`;
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `${diffInMonths}mo ago`;
        return `${Math.floor(diffInMonths / 12)}y ago`;
    };

    const getStatusInfo = () => {
        if (config.profile.presence?.mode === 'auto') {
            if (!presenceData) return { text: 'Uplink_Sync...', color: 'blue' as const };

            const status = presenceData.discord_status;
            // Find custom status activity (type 4)
            const customStatus = presenceData.activities?.find((a: any) => a.type === 4);
            const statusText = customStatus?.state || customStatus?.details || (status.charAt(0).toUpperCase() + status.slice(1));

            switch (status) {
                case 'online': return { text: statusText, color: 'green' as const };
                case 'idle': return { text: statusText, color: 'yellow' as const };
                case 'dnd': return { text: statusText, color: 'red' as const };
                case 'offline': return { text: 'Offline', color: 'gray' as const };
                default: return { text: statusText, color: 'gray' as const };
            }
        }
        return {
            text: config.profile.status?.text || 'Offline',
            color: (config.profile.status?.color || 'gray') as any
        };
    };

    const statusInfo = getStatusInfo();

    // Live progress for Spotify
    useEffect(() => {
        if (!spotifyData?.isPlaying) return;

        const tick = setInterval(() => {
            setSpotifyData((prev: any) => {
                if (!prev) return prev;
                const newProgress = prev.progressMs + 1000;
                if (newProgress >= prev.durationMs) return prev;
                return { ...prev, progressMs: newProgress };
            });
        }, 1000);

        return () => clearInterval(tick);
    }, [spotifyData?.isPlaying, spotifyData?.title]);

    const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubscribeStatus({ type: null, message: '' });

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                setSubscribeStatus({ type: 'success', message: result.message || '// SUCCESS: SUBSCRIPTION_ACTIVE' });
                e.currentTarget.reset();
            } else {
                setSubscribeStatus({ type: 'error', message: `// ERROR: ${result.error || 'UPLINK_DENIED'}` });
            }
        } catch {
            setSubscribeStatus({ type: 'error', message: '// ERROR: UPLINK_LOST' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={cn(
            "min-h-screen bg-black text-white relative flex flex-col items-center select-none overflow-x-hidden pt-16 pb-12",
            isImmersive && "immersive-mode"
        )}>
            {/* Background Decor */}
            <div className={cn(
                "fixed inset-0 z-0 transition-all duration-1000",
                isImmersive ? "blur-2xl brightness-[0.3]" : ""
            )}>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#000_70%)]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay"></div>
            </div>

            <div className="relative z-20 w-full max-w-md px-6 flex flex-col items-center [perspective:1000px]">
                {/* Profile Header */}
                <div className="text-center mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="mb-6 relative inline-block">
                        <div className="absolute inset-0 z-10" onTouchStart={(e) => e.preventDefault()}></div>

                        {/* Note Bubble (Instagram Style) */}
                        {isNoteActive() && (
                            <div className="absolute -top-6 -right-12 z-20 animate-bounce-slow">
                                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl shadow-2xl max-w-[140px]">
                                    <p className="text-[10px] font-medium text-white leading-tight break-words">
                                        {config.widgets?.note?.text}
                                    </p>
                                    {/* Bubble Tail */}
                                    <div className="absolute -bottom-1 left-2 w-2 h-2 bg-white/10 border-r border-b border-white/20 rotate-45 backdrop-blur-xl"></div>
                                </div>
                            </div>
                        )}

                        <img
                            src={config.profile.avatarUrl}
                            alt="avrxt"
                            className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-white/10 shadow-2xl pointer-events-none"
                        />
                    </div>
                    <h1 className="text-2xl font-bold font-mono tracking-[0.15em] uppercase text-white">{config.profile.handle}</h1>
                    <p className="text-sm font-light tracking-[0.2em] text-zinc-400 mt-3 uppercase italic">{config.profile.bio}</p>

                    {/* Status Indicator */}
                    {statusInfo.text && (
                        <div className={cn(
                            "mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-black/50 backdrop-blur-md transition-all duration-500",
                            statusInfo.color === 'green' && "border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
                            statusInfo.color === 'yellow' && "border-yellow-500/30 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]",
                            statusInfo.color === 'red' && "border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
                            statusInfo.color === 'blue' && "border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
                            statusInfo.color === 'purple' && "border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
                            statusInfo.color === 'gray' && "border-zinc-500/30 text-zinc-400 shadow-[0_0_15px_rgba(113,113,122,0.1)]",
                        )}>
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full relative transition-all duration-500",
                                statusInfo.color === 'green' && "bg-emerald-500",
                                statusInfo.color === 'yellow' && "bg-yellow-500",
                                statusInfo.color === 'red' && "bg-red-500",
                                statusInfo.color === 'blue' && "bg-blue-500",
                                statusInfo.color === 'purple' && "bg-purple-500",
                                statusInfo.color === 'gray' && "bg-zinc-500",
                            )}>
                                <span className={cn(
                                    "absolute inset-0 rounded-full animate-ping opacity-75",
                                    statusInfo.color === 'green' && "bg-emerald-400",
                                    statusInfo.color === 'yellow' && "bg-yellow-400",
                                    statusInfo.color === 'red' && "bg-red-400",
                                    statusInfo.color === 'blue' && "bg-blue-400",
                                    statusInfo.color === 'purple' && "bg-purple-400",
                                    statusInfo.color === 'gray' && "bg-zinc-400",
                                )}></span>
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-widest">{statusInfo.text}</span>
                        </div>
                    )}


                    {/* Weather & Location Widget */}
                    {weather && (
                        <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl transition-all hover:bg-white/[0.06] group cursor-default">
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={10} className="text-zinc-500" />
                                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">{weather.location}</span>
                                </div>
                                <div className="w-[1px] h-3 bg-white/10"></div>
                                <div className="flex items-center gap-2">
                                    {weather.condition <= 3 ? (
                                        <Sun size={12} className="text-yellow-500 animate-pulse" />
                                    ) : (
                                        <Cloud size={12} className="text-blue-400" />
                                    )}
                                    <span className="text-[10px] font-bold font-mono text-white">{weather.temp}°C</span>
                                </div>
                                <div className="hidden group-hover:flex items-center gap-2 transition-all animate-in fade-in slide-in-from-left-2">
                                    <div className="w-[1px] h-3 bg-white/10"></div>
                                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-tighter">Feels {weather.feelsLike}°C</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Social Links */}
                <div className="w-full mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3 ml-1 block">Social_Connections</span>
                    <div className="space-y-3">
                        {config.links.map((link, idx) => {
                            const isCustomIcon = link.icon && (link.icon.startsWith('http') || link.icon.startsWith('/') || link.icon.startsWith('data:'));

                            if (link.icon === 'Discord' || link.name === 'Discord') {
                                return (
                                    <Link key={link.id} href={link.url} target="_blank" className="link-card flex items-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.07] transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" className="w-5 h-5 mr-4 fill-zinc-400"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6,0.48,80.21a105.73,105.73,0,0,0,32.28,16.15,77.7,77.7,0,0,0,7.37-12,67.39,67.39,0,0,1-11.87-5.65c0.99-.71,2-1.47,3-2.25a74.61,74.61,0,0,0,64.74,0c1,0.78,2,1.54,3,2.25a67.49,67.49,0,0,1-11.89,5.65,77.83,77.83,0,0,0,7.38,12,105.51,105.51,0,0,0,32.31-16.15C130.58,50.46,126.1,26.79,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                                        <span className="text-sm font-semibold tracking-tight text-white">{link.name}</span>
                                    </Link>
                                );
                            }

                            const Icon = !isCustomIcon ? (iconMap[link.icon || 'ExternalLink'] || ExternalLink) : null;

                            return (
                                <Link key={link.id} href={link.url} target={link.url.startsWith('mailto') ? undefined : "_blank"} className="link-card flex items-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.07] transition-all">
                                    {isCustomIcon ? (
                                        <img src={link.icon} alt="Icon" className="w-5 h-5 mr-4 object-contain rounded-sm" />
                                    ) : (
                                        <Icon className="w-5 h-5 mr-4 text-zinc-400" />
                                    )}
                                    <span className="text-sm font-semibold tracking-tight text-white">{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Daily Quote Widget */}
                {config.widgets?.quotesEnabled && dailyQuote && (
                    <div className="w-full mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group">
                            <Quote size={24} className="absolute -top-2 -left-2 text-white/5 rotate-12" />
                            <p className="text-[11px] font-medium leading-relaxed text-zinc-300 italic">
                                "{dailyQuote.text}"
                            </p>
                            <p className="mt-2 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                                — {dailyQuote.author}
                            </p>
                        </div>
                    </div>
                )}

                {/* Music Player */}
                <div className="w-full mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center justify-between mb-3 ml-1">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] block">
                            {config.music.spotifyEnabled && spotifyData?.isPlaying ? '// Currently_Playing' : '// Current_Freq'}
                        </span>
                        {config.music.spotifyEnabled && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-colors duration-500",
                                spotifyData?.isPlaying
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                    : "bg-red-500/10 border-red-500/20 text-red-500"
                            )}>
                                <div className={cn(
                                    "w-1 h-1 rounded-full transition-colors duration-500",
                                    spotifyData?.isPlaying ? "bg-emerald-500" : "bg-red-500"
                                )} />
                                <span className="text-[8px] font-bold uppercase tracking-tighter">
                                    {spotifyData?.isPlaying ? 'Live_Spotify' : 'Offline'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="card-3d p-4 rounded-xl flex items-center gap-4 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group">
                        <div className="relative w-16 h-16 shrink-0">
                            <img
                                src={config.music.spotifyEnabled && spotifyData?.isPlaying && spotifyData?.albumImageUrl ? spotifyData.albumImageUrl : config.music.coverUrl}
                                className="w-full h-full rounded-lg object-cover shadow-lg border border-white/5 transition-transform duration-500"
                                alt="Cover"
                            />
                        </div>

                        <div className="flex-1 min-w-0 z-10">
                            <div className="flex items-center justify-between mb-1">
                                <div className="min-w-0">
                                    <h4 className="text-[11px] font-black uppercase tracking-wider truncate text-white">
                                        {config.music.spotifyEnabled && spotifyData?.isPlaying && spotifyData?.title ? spotifyData.title : config.music.title}
                                    </h4>
                                    <p className="text-[9px] text-zinc-500 font-mono italic truncate">
                                        {config.music.spotifyEnabled && spotifyData?.isPlaying && spotifyData?.artist ? spotifyData.artist : config.music.artist}
                                    </p>
                                </div>
                                {(!config.music.spotifyEnabled || !spotifyData?.isPlaying) ? (
                                    <button
                                        onClick={config.music.youtubeVideoId ? toggleYtPlay : togglePlay}
                                        className={cn(
                                            "w-8 h-8 flex items-center justify-center rounded-full hover:scale-110 transition-all shrink-0 shadow-xl",
                                            (isPlaying || isYtPlaying)
                                                ? "bg-white text-black"
                                                : "bg-white text-black"
                                        )}
                                    >
                                        {(config.music.youtubeVideoId ? isYtPlaying : isPlaying)
                                            ? <Pause className="w-3.5 h-3.5 fill-black" />
                                            : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                                    </button>
                                ) : (
                                    spotifyData?.songUrl && (
                                        <a
                                            href={spotifyData.songUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1DB954] text-black hover:scale-110 transition-transform shrink-0 shadow-[0_0_15px_rgba(29,185,84,0.3)]"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.485 17.303c-.212.347-.662.455-1.009.244-2.822-1.725-6.375-2.113-10.559-1.159-.396.091-.796-.159-.887-.556-.092-.396.159-.797.555-.888 4.582-1.048 8.514-.606 11.656 1.312.347.213.454.662.244 1.047zm1.464-3.264c-.268.434-.833.573-1.267.306-3.227-1.983-8.147-2.556-11.963-1.397-.49.149-1.009-.129-1.157-.619-.149-.489.13-1.009.619-1.157 4.364-1.324 9.802-.68 13.464 1.571.434.267.573.833.306 1.267.001-.001.001 0 0 .029zm.126-3.4c-3.871-2.298-10.264-2.509-13.974-1.383-.593.18-1.224-.162-1.404-.755-.18-.593.162-1.224.755-1.404 4.256-1.291 11.316-1.039 15.786 1.614.533.317.708 1.005.392 1.538-.316.533-1.005.708-1.538.391l-.017-.001z" />
                                            </svg>
                                        </a>
                                    )
                                )}
                            </div>

                            {/* Spotify live progress bar */}
                            {config.music.spotifyEnabled && spotifyData?.isPlaying && (
                                <div className="mt-3 space-y-1.5">
                                    <div className="flex justify-between items-center px-0.5">
                                        <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-tighter">
                                            {Math.floor(spotifyData.progressMs / 60000)}:{Math.floor((spotifyData.progressMs % 60000) / 1000).toString().padStart(2, '0')}
                                        </span>
                                        <div className="flex gap-0.5">
                                            <div className="w-0.5 h-2 bg-emerald-500/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-0.5 h-3 bg-emerald-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-0.5 h-2 bg-emerald-500/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-tighter">
                                            {Math.floor(spotifyData.durationMs / 60000)}:{Math.floor((spotifyData.durationMs % 60000) / 1000).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full animate-progress-flow transition-all duration-1000 shadow-[0_0_8px_#10b981] bg-gradient-to-r from-emerald-400 to-emerald-600"
                                            style={{ width: `${(spotifyData.progressMs / spotifyData.durationMs) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Play section: YouTube audio (hidden) or legacy audio fallback */}
                            {(!config.music.spotifyEnabled || !spotifyData?.isPlaying) && (
                                config.music.youtubeVideoId ? (
                                    /* ── YouTube Audio Mode — animated progress bar ── */
                                    <div className="mt-4 relative">
                                        <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    isYtPlaying
                                                        ? "animate-progress-flow bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                                        : "bg-zinc-700"
                                                )}
                                                style={{ width: `${ytProgress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <div className={cn("w-1 h-1 rounded-full transition-colors", isYtPlaying ? "bg-red-500 animate-pulse" : "bg-zinc-700")} />
                                            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                                                {isYtPlaying ? 'Playing · YouTube' : 'Full_Song · YouTube'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Audio fallback (legacy) ── */
                                    <div className="mt-4 relative group/progress">
                                        <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden relative">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-300",
                                                    isPlaying ? "animate-progress-flow bg-white shadow-[0_0_8px_#ffffff]" : "bg-zinc-600"
                                                )}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            value={progress}
                                            onChange={handleProgressChange}
                                            min="0"
                                            max="100"
                                        />
                                        <audio ref={audioRef} src={config.music.audioUrl} />
                                    </div>
                                )
                            )}

                        </div>
                    </div>

                    {/* Hidden YouTube iframe — audio plays here invisibly */}
                    {config.music.youtubeVideoId && (
                        <iframe
                            ref={ytIframeRef}
                            src={`https://www.youtube-nocookie.com/embed/${config.music.youtubeVideoId}?enablejsapi=1&controls=0&rel=0&modestbranding=1`}
                            title="yt-audio"
                            allow="autoplay"
                            style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', left: '-9999px', top: '-9999px' }}
                            aria-hidden="true"
                        />
                    )}
                </div>

                {/* Recently Played Section (New 3D Section) */}
                {config.music.spotifyEnabled && spotifyData?.title && !spotifyData?.isPlaying && (
                    <div className="w-full mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3 ml-1 block">Recently_Synchronized</span>
                        <div className="card-3d p-3 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] flex items-center gap-3 relative overflow-hidden group">
                            {/* 3D Highlight Effect */}
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/5 transition-colors duration-700" />

                            <img
                                src={spotifyData.albumImageUrl}
                                alt="Last Played"
                                className="w-12 h-12 rounded-md object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 shadow-lg"
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[7px] font-mono text-zinc-500 px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/5 tracking-widest uppercase">Last_Seen</span>
                                    <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">{formatTimeAgo(spotifyData.playedAt)}</span>
                                </div>
                                <h5 className="text-[10px] font-bold text-white/80 uppercase tracking-wider truncate mb-0.5">{spotifyData.title}</h5>
                                <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-tighter truncate">{spotifyData.artist}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gallery Section */}
                {config.gallery && config.gallery.length > 0 && (
                    <div className="w-full mb-10 animate-fade-in" style={{ animationDelay: '0.45s' }}>
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3 ml-1 block">Visual_Feed</span>
                        <div className="grid grid-cols-2 gap-3">
                            {config.gallery.map((item) => (
                                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-zinc-900/50">
                                    {item.type === 'video' ? (
                                        <video
                                            src={item.url}
                                            className="w-full h-full object-cover"
                                            controls={false}
                                            muted
                                            loop
                                            playsInline
                                            onMouseOver={e => e.currentTarget.play()}
                                            onMouseOut={e => e.currentTarget.pause()}
                                        />
                                    ) : (
                                        <img src={item.url} alt={item.caption} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" />
                                    )}
                                    {item.caption && (
                                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[8px] font-mono text-white text-center uppercase tracking-widest truncate">{item.caption}</p>
                                        </div>
                                    )}
                                    {item.type === 'video' && (
                                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/20 select-none pointer-events-none">
                                            <Play size={6} className="fill-white text-white ml-0.5" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resources Cards */}
                <div className="w-full mb-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3 ml-1 block">Resources_&_Visuals</span>
                    <div className="space-y-3">
                        {config.resources.map(res => {
                            if (res.type === 'gallery') {
                                return (
                                    <Link key={res.id} href={res.url} className="link-card block aspect-[16/5] rounded-xl group relative overflow-hidden bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center grayscale-[40%] group-hover:grayscale-0 transition-all duration-500"
                                            style={{ backgroundImage: `url('${config.profile.bannerUrl || "https://objects.avrxt.in/images/aviorxt_01.jpg"}')` }}
                                        ></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                        <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between z-20">
                                            <div className="flex items-center">
                                                <Camera className="w-5 h-5 mr-4 text-white" />
                                                <span className="text-sm font-semibold tracking-tight text-white uppercase">{res.title}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                );
                            }
                            if (res.type === 'doc') {
                                return (
                                    <Link key={res.id} href={res.url} className="link-card flex items-center justify-between p-4 rounded-xl group bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.07] transition-all">
                                        <div className="flex items-center">
                                            <BookOpen className="w-5 h-5 mr-4 text-zinc-400" />
                                            <span className="text-sm font-semibold tracking-tight text-white underline underline-offset-4 decoration-zinc-800">{res.title}</span>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-zinc-700" />
                                    </Link>
                                );
                            }
                            return (
                                <Link key={res.id} href={res.url} className="link-card block rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group overflow-hidden">
                                    <div className="relative h-28 overflow-hidden">
                                        <img src={res.previewUrl}
                                            alt="Post Preview"
                                            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent"></div>
                                        <div className="absolute top-3 left-4">
                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/10 backdrop-blur-md text-zinc-300 uppercase tracking-tighter border border-white/5">Latest Post</span>
                                        </div>
                                    </div>
                                    <div className="p-4 pt-0">
                                        <h4 className="text-sm font-bold leading-tight text-white group-hover:text-zinc-300 transition-colors">{res.title}</h4>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-[10px] text-zinc-500 font-mono">{res.meta}</span>
                                            <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Newsletter Inline Card */}
                <div className="w-full mb-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <div className="sub-card p-6 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-3xl">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3 block">// Newsletter</span>
                        <h3 className="text-lg font-bold tracking-tight mb-1 text-white">Stay Synchronized</h3>
                        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                            Get Your Special Note&apos;s <span className="inline-block animate-bounce">🍂</span>
                        </p>

                        {subscribeStatus.type && (
                            <p className={cn(
                                "mb-4 text-[10px] font-mono text-center uppercase tracking-widest",
                                "font-bold",
                                subscribeStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'
                            )}>
                                {subscribeStatus.message}
                            </p>
                        )}

                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 font-mono focus:border-white/40 transition-all outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-all font-mono disabled:opacity-50"
                                style={{ backgroundColor: config.profile.themeColor || '#ffffff', color: config.profile.themeColor ? (parseInt(config.profile.themeColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff') : '#000' }}
                            >
                                {isSubmitting ? 'CONNECTING...' : 'Subscribe_'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-auto pt-8 text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
                    <div className="flex items-center justify-center mb-4">
                        <StatusBadge />
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-700 font-mono uppercase tracking-widest mt-2">
                        <span>&copy; {new Date().getFullYear()} avrxt.in</span>
                        <span className="text-zinc-800">|</span>
                        <Link href="/me/admin" className="text-zinc-800 hover:text-zinc-500 transition-colors">
                            ADMIN
                        </Link>
                    </div>
                </footer>
            </div>

            <style jsx global>{`
                .immersive-mode {
                    transition: all 1s ease;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease forwards;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </main >
    );
}

