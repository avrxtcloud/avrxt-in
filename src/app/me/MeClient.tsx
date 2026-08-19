'use client';

import { useEffect, useState, useRef } from 'react';
import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
    ExternalLink,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Cloud,
    Droplets,
    Wind,
    ChevronRight,
    Camera,
    BookOpen,
    ArrowRight,
    Github,
    Twitter,
    Instagram,
    Linkedin,
    LinkedinIcon,
    Youtube,
    Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';
import Magnetic from '@/components/Magnetic';
import { MeConfig } from '@/lib/me-config';
import { edgeUrl } from '@/lib/edge';
import { DISCORD_BADGES } from '@/lib/discord-badges';

const iconMap: Record<string, any> = {
    Github, Twitter, Instagram, Linkedin, LinkedinIcon, Youtube, ExternalLink, Mail
};


const LOCAL_QUOTES = [
    { content: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
    { content: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
    { content: 'Move fast, but don\'t break trust.', author: 'Unknown' },
    { content: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
    { content: 'Stay hungry. Stay foolish.', author: 'Steve Jobs' },
];

const pickQuote = () => LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];


const ensureYouTubeIframeApi = () => {
    if (typeof window === 'undefined') return Promise.resolve();

    const w = window as any;
    if (w.YT?.Player) return Promise.resolve();
    if (w.__ytIframeApiPromise) return w.__ytIframeApiPromise as Promise<void>;

    w.__ytIframeApiPromise = new Promise<void>((resolve, reject) => {
        const existing = document.getElementById('youtube-iframe-api');
        if (existing) {
            const check = () => {
                if (w.YT?.Player) resolve();
                else setTimeout(check, 50);
            };
            check();
            return;
        }

        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        tag.onerror = () => reject(new Error('Failed to load YouTube IFrame API'));

        const prev = w.onYouTubeIframeAPIReady;
        w.onYouTubeIframeAPIReady = () => {
            try {
                if (typeof prev === 'function') prev();
            } finally {
                resolve();
            }
        };

        document.head.appendChild(tag);
    });

    return w.__ytIframeApiPromise as Promise<void>;
};

export default function MeClient({ config }: { config: MeConfig }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isImmersive, setIsImmersive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [weather, setWeather] = useState<any>(null);
    const [quote, setQuote] = useState<any>(null);
    const [spotifyData, setSpotifyData] = useState<any>(null);
    const [spotifyLast, setSpotifyLast] = useState<any>(null);
    const [spotifyProgress, setSpotifyProgress] = useState(0);
    const spotifyEnabled = Boolean(config.music.spotifyEnabled);
    const spotifyAmbientEnabled = Boolean(config.music.spotifyAmbientEnabled);
    const weatherEnabled = config.profile.weatherEnabled !== false;
    const [lanyardData, setLanyardData] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [subscribeStatus, setSubscribeStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeBadgeId, setActiveBadgeId] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const ytContainerRef = useRef<HTMLDivElement>(null);
    const ytPlayerRef = useRef<any>(null);
    const ytPendingPlayRef = useRef(false);
    const [ytReady, setYtReady] = useState(false);
    const spotifyProgressBarRef = useRef<HTMLDivElement>(null);
    const spotifyProgressLastStateUpdateRef = useRef<number>(0);

    useEffect(() => {
        setIsMounted(true);
        setQuote(pickQuote());
        return () => { };
    }, []);

    // Weather: only fetch when enabled
    useEffect(() => {
        if (!weatherEnabled) return;
        const fetchWeather = async () => {
            try {
                const res = await fetch(edgeUrl('/v1/fnc/geo/forecast?latitude=13.0827&longitude=80.2707&current=temperature_2m,relative_humidity_2m,wind_speed_10m'), { cache: 'no-store' });
                const data = await res.json();
                setWeather(data.current);
            } catch (e) { console.error(e); }
        };
        fetchWeather();
        // Weather doesn't need aggressive polling (limits-friendly).
    }, [weatherEnabled]);

    // Discord Presence: only fetch when auto mode + id present, poll every 60s
    useEffect(() => {
        const discordId = config.profile.presence?.discordId;
        if (!discordId) return;

        const manualSelected = Object.keys(config.profile.presence?.badgesManual || {})
            .filter((k) => Boolean((config.profile.presence?.badgesManual || {})[k]))
            .sort()
            .join('|');

        const badgesEnabled = config.profile.presence?.badgesEnabled !== false;
        const badgesMode = config.profile.presence?.badgesMode || 'auto';
        const badgesNeeded = badgesEnabled && (badgesMode === 'auto' || manualSelected.length > 0);
        const serverTagNeeded = config.profile.presence?.serverTagEnabled !== false;

        const presenceNeeded =
            config.profile.presence?.mode === 'auto' ||
            serverTagNeeded ||
            badgesNeeded;
        if (!presenceNeeded) return;

        const fetchLanyard = async () => {
            try {
                const res = await fetch(edgeUrl(`/v1/realtime/dc-presence/${discordId}`), { cache: 'no-store' });
                const data = await res.json();
                if (data.success) setLanyardData(data.data);
            } catch (e) { console.error(e); }
        };
        fetchLanyard();
        const id = window.setInterval(fetchLanyard, 60000);
        return () => window.clearInterval(id);
    }, [
        config.profile.presence?.mode,
        config.profile.presence?.discordId,
        config.profile.presence?.serverTagEnabled,
        config.profile.presence?.badgesEnabled,
        config.profile.presence?.badgesMode,
        // Re-evaluate polling when the selected manual badges change.
        JSON.stringify(config.profile.presence?.badgesManual || {})
    ]);

    // 2. Spotify Listeners (Realtime & Local Progress)
    useEffect(() => {
        if (!spotifyEnabled) return;

        const supabase = createClient();
        let isActive = true;
        let pollTimeout: number | undefined;
        let inFlight: AbortController | null = null;
        let lastNowPlayingFetchAt = 0;

        const normalizeIncoming = (input: any) => {
            if (!input) return null;
            const isPlaying = Boolean(input.isPlaying ?? input.is_playing);
            const title = input.title ?? null;
            const artist = input.artist ?? null;
            const albumImageUrl = input.albumImageUrl ?? input.album_image_url ?? null;
            const songUrl = input.songUrl ?? input.song_url ?? null;
            const progressRaw = input.progressMs ?? input.progress_ms;
            const durationRaw = input.durationMs ?? input.duration_ms;
            const progressMs =
                progressRaw === null || typeof progressRaw === 'undefined' ? undefined : (Number(progressRaw) || 0);
            const durationMs =
                durationRaw === null || typeof durationRaw === 'undefined' ? undefined : (Number(durationRaw) || 0);
            const updatedAt = input.updatedAt ?? input.updated_at ?? null;
            return { isPlaying, title, artist, albumImageUrl, songUrl, progressMs, durationMs, updatedAt };
        };

        const applySpotifyState = (raw: any) => {
            const data = normalizeIncoming(raw);
            if (!data?.title) return;

            if (data.isPlaying) {
                setSpotifyLast(null);
                setSpotifyData((prev: any) => {
                    const prevTitle = prev?.title;
                    const prevArtist = prev?.artist;
                    const prevSongUrl = prev?.songUrl;
                    const sameTrack = Boolean(
                        prev &&
                        ((prevSongUrl && data.songUrl && prevSongUrl === data.songUrl) ||
                            (prevTitle === data.title && prevArtist === data.artist))
                    );

                    const next: any = {
                        ...(sameTrack ? prev : {}),
                        ...data,
                    };

                    // Preserve duration/progress if upstream update is partial.
                    if (typeof data.durationMs === 'undefined' && typeof prev?.durationMs !== 'undefined') {
                        next.durationMs = prev.durationMs;
                    }
                    if (typeof data.progressMs === 'undefined' && typeof prev?.progressMs !== 'undefined') {
                        next.progressMs = prev.progressMs;
                    }

                    // Update `fetchedAt` when we got a fresh progress reading; otherwise keep the previous base.
                    if (typeof data.progressMs !== 'undefined') {
                        next.fetchedAt = Date.now();
                    } else if (typeof prev?.fetchedAt !== 'undefined') {
                        next.fetchedAt = prev.fetchedAt;
                    } else {
                        next.fetchedAt = Date.now();
                    }

                    return next;
                });
            } else {
                setSpotifyData(null);
                setSpotifyLast(data);
            }
        };

        const clearPoll = () => {
            if (pollTimeout) window.clearTimeout(pollTimeout);
            pollTimeout = undefined;
        };

        const scheduleNext = (ms: number) => {
            if (!isActive) return;
            clearPoll();
            pollTimeout = window.setTimeout(() => {
                void syncNowPlaying();
            }, ms);
        };

        const syncNowPlaying = async () => {
            if (!isActive) return;

            // Reduce background churn; resync quickly when the tab returns.
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                scheduleNext(30_000);
                return;
            }

            // Vercel free-plan friendly throttle (even on focus/visibility triggers).
            const now = Date.now();
            if (lastNowPlayingFetchAt && now - lastNowPlayingFetchAt < 15_000) {
                scheduleNext(15_000 - (now - lastNowPlayingFetchAt));
                return;
            }
            lastNowPlayingFetchAt = now;

            try {
                const spotifyApiUrl = process.env.NEXT_PUBLIC_SPOTIFY_API_URL || edgeUrl('/v1/spotify/now-playing');

                try {
                    inFlight?.abort();
                } catch { }
                inFlight = new AbortController();

                const res = await fetch(spotifyApiUrl, {
                    cache: 'no-store',
                    signal: inFlight.signal,
                    headers: { accept: 'application/json' }
                });
                if (!res.ok) throw new Error(`Spotify sync failed: ${res.status}`);

                const data = await res.json();
                if (!isActive) return;

                const normalized = normalizeIncoming(data);
                applySpotifyState(normalized);
                scheduleNext(15_000);
            } catch (e: any) {
                if (e?.name === 'AbortError') return;
                console.error('Spotify sync failed', e);
                scheduleNext(15_000);
            }
        };

        const onVisibilityOrFocus = () => {
            if (!isActive) return;
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                void syncNowPlaying();
            }
        };
        window.addEventListener('focus', onVisibilityOrFocus);
        document.addEventListener('visibilitychange', onVisibilityOrFocus);

        void syncNowPlaying();

        // Subscribe to Realtime Updates (Directly from status table)
        const channel = supabase
            .channel('spotify_realtime_v2')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'spotify_status' },
                (payload) => {
                    const mapped = normalizeIncoming(payload.new);
                    if (!mapped) return;
                    applySpotifyState(mapped);
                    // Keep polling cadence predictable (limits-friendly).
                    scheduleNext(15_000);
                }
            )
            .subscribe();

        return () => {
            isActive = false;
            supabase.removeChannel(channel);
            clearPoll();
            try { inFlight?.abort(); } catch { }
            window.removeEventListener('focus', onVisibilityOrFocus);
            document.removeEventListener('visibilitychange', onVisibilityOrFocus);
        };
    }, [spotifyEnabled]);

    // 3. Spotify Progress Prediction (limits-friendly; avoids polling spam)
    useEffect(() => {
        const barEl = spotifyProgressBarRef.current;

        if (!spotifyData?.isPlaying || !spotifyData?.durationMs) {
            setSpotifyProgress(0);
            if (barEl) barEl.style.width = '0%';
            return;
        }

        const durationMs = Number(spotifyData.durationMs) || 0;
        if (durationMs <= 0) return;

        let raf = 0;
        const baseProgressMs = Number(spotifyData.progressMs) || 0;
        const baseTimestamp = Number(spotifyData.fetchedAt) || Date.now();

        const animate = () => {
            const elapsed = Date.now() - baseTimestamp;
            const current = Math.min(baseProgressMs + elapsed, durationMs);
            const pct = Math.min(100, Math.max(0, (current / durationMs) * 100));

            if (barEl) {
                barEl.style.width = `${pct}%`;
            }

            // Throttle state updates (range input / react render) to reduce churn.
            const now = Date.now();
            if (now - spotifyProgressLastStateUpdateRef.current >= 250) {
                spotifyProgressLastStateUpdateRef.current = now;
                setSpotifyProgress(pct);
            }

            raf = requestAnimationFrame(animate);
        };

        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [spotifyData?.isPlaying, spotifyData?.durationMs, spotifyData?.progressMs, spotifyData?.fetchedAt]);

    useEffect(() => {
        if (!spotifyData?.isPlaying) return;

        // Prevent double-audio if local player was active
        setIsPlaying(false);
        try { audioRef.current?.pause(); } catch { }
        try { ytPlayerRef.current?.pauseVideo?.(); } catch { }
    }, [spotifyData?.isPlaying]);

    const audioUrl = (config.music.audioUrl || '').trim();
    const youtubeVideoId = (config.music.youtubeVideoId || '').trim();
    const isUsingYouTube = Boolean(youtubeVideoId);

    const isMutedRef = useRef(isMuted);
    const isPlayingRef = useRef(isPlaying);

    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        if (!isUsingYouTube) {
            setYtReady(false);
            ytPendingPlayRef.current = false;
            if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy();
            ytPlayerRef.current = null;
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                await ensureYouTubeIframeApi();
                if (cancelled) return;

                const w = window as any;
                if (!ytContainerRef.current) return;

                if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy();
                ytPlayerRef.current = null;

                const player = new w.YT.Player(ytContainerRef.current, {
                    host: 'https://www.youtube-nocookie.com',
                    videoId: youtubeVideoId,
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        rel: 0,
                        modestbranding: 1,
                        playsinline: 1,
                    },
                    events: {
                        onReady: () => {
                            if (cancelled) return;
                            setYtReady(true);

                            try {
                                if (isMutedRef.current) {
                                    player.mute();
                                } else {
                                    player.unMute();
                                    player.setVolume(100);
                                }
                            } catch { }

                            if (ytPendingPlayRef.current || isPlayingRef.current) {
                                try {
                                    player.unMute();
                                    player.setVolume(100);
                                    player.playVideo();
                                } catch { }
                                ytPendingPlayRef.current = false;
                                setIsPlaying(true);
                            }
                        },
                        onStateChange: (e: any) => {
                            if (cancelled) return;
                            // 0 = ended
                            if (e?.data === 0) {
                                setIsPlaying(false);
                            }
                        },
                    },
                });

                ytPlayerRef.current = player;
            } catch (err) {
                console.error(err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isUsingYouTube, youtubeVideoId]);

    useEffect(() => {
        if (!isUsingYouTube || !ytReady) return;
        const player = ytPlayerRef.current;
        if (!player) return;

        const id = window.setInterval(() => {
            try {
                const duration = player.getDuration?.() || 0;
                const current = player.getCurrentTime?.() || 0;
                if (duration > 0) setProgress((current / duration) * 100);
            } catch { }
        }, 250);

        return () => window.clearInterval(id);
    }, [isUsingYouTube, ytReady]);


    useEffect(() => {
        setYtReady(false);
    }, [youtubeVideoId]);

    const togglePlay = () => {
        if (isUsingYouTube) {
            const player = ytPlayerRef.current;

            if (!player || !ytReady) {
                setIsPlaying((prev) => {
                    const next = !prev;
                    ytPendingPlayRef.current = next;
                    return next;
                });
                return;
            }

            if (isPlaying) {
                try { player.pauseVideo(); } catch { }
                setIsPlaying(false);
            } else {
                try {
                    player.unMute();
                    player.setVolume(100);
                    player.playVideo();
                } catch { }
                setIsPlaying(true);
            }
            return;
        }

        if (audioRef.current && audioUrl) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.log("Playback failed", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (isUsingYouTube) {
            const player = ytPlayerRef.current;
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);

            if (player && ytReady) {
                try {
                    if (nextMuted) {
                        player.mute();
                    } else {
                        player.unMute();
                        player.setVolume(100);
                    }
                } catch { }
            }
            return;
        }

        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (spotifyData?.isPlaying) return;
        const value = parseFloat(e.target.value);
        setProgress(value);

        if (isUsingYouTube) {
            const player = ytPlayerRef.current;
            if (player && ytReady) {
                try {
                    const duration = player.getDuration?.() || 0;
                    if (duration > 0) player.seekTo((value / 100) * duration, true);
                } catch { }
            }
            return;
        }
        if (audioRef.current) {
            audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
        }
    };
    useEffect(() => {
        if (isUsingYouTube) return;
        if (!audioUrl) return;
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl, isUsingYouTube]);

    const formatTimeAgo = (timestamp?: number) => {
        if (!timestamp) return 'Slightly earlier';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

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

    // Hydration guard for everything that depends on isMounted
    if (!isMounted) return null;

    const rawHandle = (config.profile.handle || '').trim();
    const headingName = rawHandle.startsWith('@') ? rawHandle.slice(1) : rawHandle;

    const formatLocation = (raw: string | undefined | null) => {
        const value = (raw || '').trim() || 'PLANET_EARTH';
        const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
            const city = parts[0].toUpperCase();
            const country = parts.slice(1).join(', ').toUpperCase();
            return `// ${city} // ${country}`;
        }
        return `// ${value.toUpperCase()}`;
    };

    // Presence Logic
    const isManual = config.profile.presence?.mode === 'manual';
    const discordStatus = (lanyardData?.discord_status || 'offline') as string;
    const displayStatus = isManual
        ? config.profile.status?.text || 'Online'
        : (discordStatus === 'online' ? 'Active'
            : discordStatus === 'idle' ? 'Sleep'
                : discordStatus === 'dnd' ? 'DND'
                    : 'Offline');
    const statusColor = isManual ? (config.profile.status?.color || 'green') : discordStatus;

    const showSpotifyAmbient =
        spotifyEnabled &&
        spotifyAmbientEnabled &&
        Boolean(spotifyData?.isPlaying) &&
        Boolean(spotifyData?.albumImageUrl);

    const getPresenceClasses = (color: string) => {
        // Auto presence (Lanyard): online/idle/dnd/offline
        if (color === 'online') return { dot: 'bg-emerald-500', text: 'text-emerald-400' };
        if (color === 'idle') return { dot: 'bg-yellow-500', text: 'text-yellow-400' };
        if (color === 'dnd') return { dot: 'bg-red-500', text: 'text-red-400' };
        if (color === 'offline') return { dot: 'bg-zinc-600', text: 'text-zinc-400' };

        // Manual palette fallback
        if (color === 'green') return { dot: 'bg-emerald-500', text: 'text-emerald-400' };
        if (color === 'yellow') return { dot: 'bg-yellow-500', text: 'text-yellow-400' };
        if (color === 'red') return { dot: 'bg-red-500', text: 'text-red-400' };
        if (color === 'blue') return { dot: 'bg-blue-500', text: 'text-blue-400' };
        if (color === 'purple') return { dot: 'bg-purple-500', text: 'text-purple-400' };
        return { dot: 'bg-zinc-600', text: 'text-zinc-400' };
    };

    const presenceClasses = getPresenceClasses(statusColor);

    const discordUser = lanyardData?.discord_user as any;
    const showServerTag = config.profile.presence?.serverTagEnabled !== false;
    const badgesEnabled = config.profile.presence?.badgesEnabled !== false;
    const badgesMode = config.profile.presence?.badgesMode || 'auto';
    const manualBadges = config.profile.presence?.badgesManual || {};

    const publicFlags = Number(discordUser?.public_flags ?? discordUser?.publicFlags ?? 0) || 0;
    const hasDecorations = Boolean(discordUser?.avatar_decoration_data);
    const hasCollectibles = Boolean(discordUser?.collectibles);

    // Best-effort detection for newer profile collectibles.
    const collectibleStr = JSON.stringify(discordUser?.collectibles || {});
    const hasOrb = /orb/i.test(collectibleStr) || /orb/i.test(String(discordUser?.avatar_decoration_data?.asset || ''));
    const hasQuest = /quest/i.test(collectibleStr) || /quest/i.test(JSON.stringify(lanyardData?.kv || {}));

    const discordBadges = DISCORD_BADGES.filter((badge) => {
        if (!badgesEnabled) return false;

        if (badgesMode === 'manual') {
            return Boolean(manualBadges[badge.id]);
        }

        // auto
        if (typeof badge.bit === 'number') {
            return (publicFlags & badge.bit) === badge.bit;
        }
        if (badge.detection === 'nitro') return hasDecorations || hasCollectibles;
        if (badge.detection === 'orb') return hasOrb;
        if (badge.detection === 'quest') return hasQuest;
        return false;
    });

    const primaryGuild = discordUser?.primary_guild;
    const guildTag = showServerTag ? ((primaryGuild?.tag as string | undefined) || '') : '';
    const guildId = (primaryGuild?.identity_guild_id as string | undefined) || '';
    const guildBadgeHash = (primaryGuild?.badge as string | undefined) || '';
    const guildTagBadgeUrl =
        guildId && guildBadgeHash ? `https://cdn.discordapp.com/guild-tag-badges/${guildId}/${guildBadgeHash}?size=48` : '';

    return (
        <main className={cn(
            "me-v7 min-h-[100dvh] bg-[#050505] text-white relative flex flex-col items-center select-none overflow-x-hidden px-1 pt-12 pb-12 sm:pt-16",
            isImmersive && "immersive-mode"
        )}>
            {/* Background Decor */}
            <div className={cn(
                "fixed inset-0 z-0 transition-all duration-1000",
                isImmersive ? "blur-xl scale-110" : ""
            )}>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(139,92,246,0.08),transparent_32%),#050505]"></div>

                {/* Spotify Ambient (cover-based) */}
                {showSpotifyAmbient && (
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-700">
                        <div
                            className="absolute inset-0 opacity-35 blur-3xl scale-125 saturate-150"
                            style={{
                                backgroundImage: `url(${spotifyData.albumImageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(circle_at_75%_85%,rgba(59,130,246,0.14),transparent_60%)] mix-blend-screen opacity-80" />
                        <div className="absolute inset-0 bg-black/55" />
                    </div>
                )}

                {/* Immersive Glows */}
                <div className={cn(
                    "absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full transition-opacity duration-1000",
                    isImmersive ? "opacity-40 animate-pulse" : "opacity-0"
                )} />
                <div className={cn(
                    "absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full transition-opacity duration-1000",
                    isImmersive ? "opacity-30 animate-pulse" : "opacity-0"
                )} />
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/5 blur-[150px] rounded-full transition-opacity duration-1000",
                    isImmersive ? "opacity-20 animate-pulse" : "opacity-0"
                )} />

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none"></div>
            </div>

            <div className="relative z-20 w-full max-w-2xl px-5 sm:px-8 flex flex-col items-center [perspective:1000px]">
                {/* Profile Header */}
                <Reveal className="me-profile-header w-full border-l border-white/20 py-7 pl-5 text-left mb-10 sm:py-10 sm:pl-8" direction="down" delay={0.1}>
                    <div className="mb-6 relative inline-block">
                        <div className="absolute inset-0 animate-pulse bg-emerald-500/20 blur-2xl rounded-full scale-110 opacity-30"></div>
                        <img
                            src={config.profile.avatarUrl}
                            alt={config.profile.handle}
                            className="w-24 h-24 rounded-none border border-white/20 relative z-10 shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                        <div className={cn(
                            "absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-black z-20 transition-colors duration-500",
                            presenceClasses.dot
                        )} />
                    </div>
                    <h1 className="me-profile-title font-[family-name:var(--font-outfit)] text-[clamp(3.5rem,12vw,7rem)] font-black tracking-[-0.085em] leading-[0.82] mb-3 uppercase text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.78)]">
                        {headingName}
                    </h1>
                    {weatherEnabled && (
                        <p className="text-[10px] font-mono text-cyan-400/70 tracking-[0.3em] uppercase mb-4">
                            {formatLocation(config.profile.location)}
                        </p>
                    )}
                    {weatherEnabled && (
                        <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-zinc-600 bg-white/5 py-1.5 px-4 rounded-full border border-white/5 backdrop-blur">
                        <span className="flex items-center gap-1.5"><Cloud size={10} /> {weather?.temperature_2m || '??'}°C</span>
                        <span className="opacity-20">|</span>
                        <span className="flex items-center gap-1.5"><Droplets size={10} /> {weather?.relative_humidity_2m || '??'}%</span>
                        <span className="opacity-20">|</span>
                        <span className="flex items-center gap-1.5"><Wind size={10} /> {weather?.wind_speed_10m || '??'}km/h</span>
                        </div>
                    )}
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10">
                        <span className={cn("text-[8px] font-mono uppercase tracking-widest", presenceClasses.text)}>{displayStatus}</span>
                    </div>

                    {(guildTag || discordBadges.length > 0) && (
                        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                            {guildTag && (
                                <div
                                    className="group relative inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur"
                                    aria-label={`Discord primary guild tag ${guildTag}`}
                                    title={`Discord Server Tag: ${guildTag}`}
                                >
                                    {guildTagBadgeUrl && (
                                        <img
                                            src={guildTagBadgeUrl}
                                            alt={`Discord server tag badge (${guildTag})`}
                                            title={`Discord server tag badge (${guildTag})`}
                                            className="w-4 h-4 rounded-[4px]"
                                            loading="lazy"
                                            onError={(e) => {
                                                // Hide if CDN asset is missing for some reason.
                                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest">{guildTag}</span>
                                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[9px] font-mono text-zinc-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                                        {`Server Tag: ${guildTag}`}
                                    </span>
                                </div>
                            )}

                            {discordBadges.map((badge) => {
                                const isActive = activeBadgeId === badge.id;
                                return (
                                    <button
                                        key={badge.id}
                                        type="button"
                                        aria-label={badge.label}
                                        onClick={() => setActiveBadgeId((prev) => (prev === badge.id ? null : badge.id))}
                                        className="group relative"
                                    >
                                        <img
                                            src={badge.src}
                                            alt={badge.label}
                                            className="w-5 h-5 opacity-90 hover:opacity-100 transition-opacity"
                                            loading="lazy"
                                            draggable={false}
                                        />
                                        <span className={cn(
                                            "pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[9px] font-mono text-zinc-200 transition-opacity duration-200",
                                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                                        )}>
                                            {badge.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </Reveal>

                {/* Status/Quote Widget */}
                {config.widgets?.quotesEnabled && (
                    <Reveal className="w-full mb-8" direction="up" delay={0.2}>
                        <div className="card-3d p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-xl group">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Inspirational_Feed</span>
                            </div>
                            {quote ? (
                                <div className="space-y-1">
                                    <p className="text-[11px] leading-relaxed text-zinc-300 italic">&quot;{quote.content}&quot;</p>
                                    <p className="text-[9px] text-zinc-600 font-mono text-right">— {quote.author}</p>
                                </div>
                            ) : (
                                <div className="h-10 w-full animate-pulse bg-white/5 rounded"></div>
                            )}
                        </div>
                    </Reveal>
                )}

                {/* Links Section */}
                <div className="w-full mb-8">
                    <span className="me-section-label text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] mb-3 ml-1 block">Social_Connections</span>
                    <div className="space-y-3">
                        {config.links.map((link, idx) => {
                            const isCustomIcon = link.icon && (link.icon.startsWith('http') || link.icon.startsWith('/') || link.icon.startsWith('data:'));
                            const Icon = !isCustomIcon ? (iconMap[link.icon || 'ExternalLink'] || ExternalLink) : null;

                            return (
                                <Reveal key={link.id} delay={idx * 0.05} direction="up">
                                    <Tilt intensity={5}>
                                        <Link
                                            href={link.url}
                                            target="_blank"
                                            className="link-card flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    {isCustomIcon ? (
                                                        <img src={link.icon} alt={link.name} className="w-4 h-4" />
                                                    ) : (
                                                        <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-bold tracking-tight uppercase group-hover:translate-x-1 transition-transform">{link.name}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-all group-hover:translate-x-1" />
                                        </Link>
                                    </Tilt>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>

                {/* Music Player Section */}
                <div className="w-full mb-8">
                    <div className="flex items-center justify-between mb-3 ml-1">
                        <span className="me-section-label text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] block">Audio_Terminal</span>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsImmersive(!isImmersive)} className={cn(
                                "text-[9px] font-mono uppercase tracking-widest transition-all",
                                isImmersive ? "text-emerald-500" : "text-zinc-700 hover:text-zinc-400"
                            )}>
                                {isImmersive ? "[IMMERSIVE_ON]" : "Immersive_Mode"}
                            </button>
                        </div>
                    </div>

                    <Reveal direction="up" delay={0.3}>
                        <Tilt intensity={10}>
                            <div className="card-3d p-4 rounded-xl flex items-center gap-4 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group">
                                <div className="relative w-16 h-16 shrink-0">
                                    {spotifyData?.isPlaying ? (
                                        <img
                                            src={spotifyData.albumImageUrl}
                                            alt="Cover"
                                            className="w-full h-full rounded-lg object-cover shadow-lg group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <img
                                            src={config.music.coverUrl}
                                            alt="Cover"
                                            className="w-full h-full rounded-lg object-cover shadow-lg opacity-50 group-hover:opacity-100 transition-opacity"
                                        />
                                    )}
                                    {(spotifyData?.isPlaying || isPlaying) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg">
                                            <div className="flex gap-1">
                                                <div className="w-1 h-3 bg-white rounded-full animate-[bounce_0.6s_infinite] delay-100"></div>
                                                <div className="w-1 h-4 bg-white rounded-full animate-[bounce_0.6s_infinite] delay-200"></div>
                                                <div className="w-1 h-2 bg-white rounded-full animate-[bounce_0.6s_infinite] delay-300"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={cn(
                                            "w-1 h-1 rounded-full animate-pulse",
                                            spotifyData?.isPlaying ? "bg-emerald-500" : "bg-zinc-800"
                                        )}></div>
                                        <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">
                                            {spotifyData?.isPlaying ? "Spotify_Live" : "Local_Stream"}
                                        </span>
                                    </div>
                                    <h5 className="text-[12px] font-bold text-white uppercase tracking-wider truncate mb-0.5">
                                        {spotifyData?.title || config.music.title || "Standby"}
                                    </h5>
                                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter truncate">
                                        {spotifyData?.artist || config.music.artist || "No Signal"}
                                    </p>
                                    {spotifyEnabled && !spotifyData?.isPlaying && spotifyLast?.title && spotifyLast?.artist && (
                                        <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-tighter truncate">
                                            Last_Played: {spotifyLast.title} // {spotifyLast.artist}
                                        </p>
                                    )}

                                    <div className="mt-3 relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            ref={spotifyProgressBarRef}
                                            className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            style={{ width: `${spotifyData?.isPlaying ? spotifyProgress : progress}%` }}
                                        />
                                        <input
                                            type="range"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            value={spotifyData?.isPlaying ? spotifyProgress : progress}
                                            onChange={handleProgressChange}
                                            min="0"
                                            max="100"
                                            disabled={spotifyData?.isPlaying}
                                        />
                                        <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            if (spotifyData?.isPlaying && spotifyData?.songUrl) {
                                                window.open(spotifyData.songUrl, '_blank', 'noopener,noreferrer');
                                                return;
                                            }
                                            togglePlay();
                                        }}
                                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl"
                                    >
                                        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                                    </button>
                                    <button
                                        onClick={toggleMute}
                                        disabled={spotifyData?.isPlaying}
                                        className="w-10 h-10 rounded-full bg-white/0 flex items-center justify-center text-zinc-700 hover:text-white transition-all"
                                    >
                                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                    </button>
                                </div>
                            </div>
                        </Tilt>
                    </Reveal>

                    {isUsingYouTube && (
                        <div
                            key={youtubeVideoId}
                            ref={ytContainerRef}
                            style={{ position: 'absolute', width: '200px', height: '200px', opacity: 0.01, pointerEvents: 'none', left: '-9999px', top: '-9999px' }}
                            aria-hidden="true"
                        />
                    )}
                </div>

                {/* Gallery Section */}
                {config.gallery && config.gallery.length > 0 && (
                    <div className="w-full mb-10">
                        <span className="me-section-label text-[10px] font-mono text-violet-400 uppercase tracking-[0.3em] mb-3 ml-1 block">Visual_Feed</span>
                        <div className="grid grid-cols-2 gap-3">
                            {config.gallery.map((item) => (
                                <Reveal key={item.id} direction="up" delay={0.4}>
                                    <div className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-zinc-900/50">
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
                                            <img src={item.url} alt={item.caption || 'Gallery Image'} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" />
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
                                </Reveal>
                            ))}
                        </div>
                    </div>
                )}

                {/* Newsletter Card */}
                <Reveal className="w-full mb-10" direction="up" delay={0.6}>
                    <Tilt intensity={5}>
                        <div className="sub-card p-6 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-3xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                            <span className="me-section-label text-[10px] font-mono text-violet-400 uppercase tracking-[0.3em] mb-3 block">// Newsletter</span>
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
                                    style={{
                                        backgroundColor: config.profile.themeColor || '#ffffff',
                                        color: config.profile.themeColor ? (parseInt(config.profile.themeColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff') : '#000'
                                    }}
                                >
                                    {isSubmitting ? 'CONNECTING...' : 'Subscribe_'}
                                </button>
                            </form>
                        </div>
                    </Tilt>
                </Reveal>

                {/* Resources */}
                <div className="w-full mb-10">
                    <span className="me-section-label text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-3 ml-1 block">Resources_&_Visuals</span>
                    <div className="space-y-3">
                        {config.resources.map((res, i) => (
                            <Reveal key={res.id} direction="up" delay={0.5 + (i * 0.05)}>
                                {res.type === 'gallery' ? (
                                    <Link href={res.url} className="link-card block aspect-[16/5] rounded-xl group relative overflow-hidden bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center grayscale-[40%] group-hover:grayscale-0 transition-all duration-500"
                                            style={{ backgroundImage: `url('${config.profile.bannerUrl || "https://cdn.avxt.qzz.io/images/aviorxt_01.jpg"}')` }}
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
                                ) : res.type === 'doc' ? (
                                    <Link href={res.url} className="link-card flex items-center justify-between p-4 rounded-xl group bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.07] transition-all">
                                        <div className="flex items-center">
                                            <BookOpen className="w-5 h-5 mr-4 text-zinc-400" />
                                            <span className="text-sm font-semibold tracking-tight text-white underline underline-offset-4 decoration-zinc-800">{res.title}</span>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-zinc-700" />
                                    </Link>
                                ) : (
                                    <Link href={res.url} className="link-card block rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group overflow-hidden">
                                        {res.previewUrl && (
                                            <div className="relative h-28 overflow-hidden">
                                                <img src={res.previewUrl}
                                                    alt="Post Preview"
                                                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent"></div>
                                                <div className="absolute top-3 left-4">
                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/10 backdrop-blur-md text-zinc-300 uppercase tracking-tighter border border-white/5">Latest Post</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-4 pt-4">
                                            <h4 className="text-sm font-bold leading-tight text-white group-hover:text-zinc-300 transition-colors">{res.title}</h4>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-[10px] text-zinc-500 font-mono">{res.meta}</span>
                                                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </Reveal>
                        ))}
                    </div>
                </div>

                {/* Footer Section */}
                <Reveal className="mt-auto pt-8 text-center" direction="up" delay={0.7}>
                    <div className="flex items-center justify-center mb-4">
                        <Magnetic>
                            <StatusBadge />
                        </Magnetic>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-700 font-mono uppercase tracking-widest mt-2">
                        <span>&copy; {isMounted ? new Date().getFullYear() : '2026'} avrxt.dev</span>
                        <span className="text-zinc-800">|</span>
                        <Link href="/me/admin" className="text-zinc-800 hover:text-zinc-500 transition-colors">
                            ADMIN
                        </Link>
                    </div>
                </Reveal>
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
                .me-v7 .me-profile-header {
                    position: relative;
                }
                .me-v7 .me-profile-header::before,
                .me-v7 .me-profile-header::after {
                    content: '';
                    position: absolute;
                    left: -3px;
                    width: 6px;
                    height: 6px;
                    border-radius: 999px;
                    background: white;
                }
                .me-v7 .me-profile-header::before { top: 0; }
                .me-v7 .me-profile-header::after { bottom: 0; }
                .me-v7 .me-section-label {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }
                .me-v7 .me-section-label::after {
                    content: '';
                    height: 1px;
                    flex: 1;
                    background: linear-gradient(90deg, currentColor, transparent);
                    opacity: 0.22;
                }
                .me-v7 .link-card,
                .me-v7 .card-3d,
                .me-v7 .sub-card {
                    border-radius: 0 !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    background: rgba(255, 255, 255, 0.025) !important;
                    box-shadow: none;
                }
                .me-v7 .link-card:hover,
                .me-v7 .card-3d:hover,
                .me-v7 .sub-card:hover {
                    border-color: rgba(96, 165, 250, 0.4) !important;
                    background: linear-gradient(110deg, rgba(34, 211, 238, 0.045), rgba(139, 92, 246, 0.035)) !important;
                }
                .me-v7 input:not([type='range']) {
                    border-radius: 0 !important;
                }
                .me-v7 .sub-card button[type='submit'] {
                    border-radius: 0 !important;
                    background: linear-gradient(90deg, #67e8f9, #60a5fa, #a78bfa) !important;
                    color: #050505 !important;
                }
                @media (max-width: 420px) {
                    .me-v7 .me-profile-title {
                        font-size: clamp(3rem, 18vw, 4.5rem);
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .me-v7 *,
                    .me-v7 *::before,
                    .me-v7 *::after {
                        scroll-behavior: auto !important;
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </main>
    );
}
