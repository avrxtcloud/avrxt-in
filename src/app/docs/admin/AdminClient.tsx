'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
    BookOpen, Plus, Trash2, Save, LogOut, Edit2, Eye, Search,
    FileText, Check, Globe, Lock, Image, Link2, Code2, Bold,
    Italic, List, ListOrdered, Quote, Minus, Youtube, AlertTriangle,
    X, Upload, Loader2, ChevronDown, Hash, ExternalLink, Type,
    AlignLeft, Heading1, Heading2, Heading3, LayoutTemplate, Columns
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocArticle } from '@/lib/docs-config';
import { createDocAction, updateDocAction, deleteDocAction } from '@/app/actions/docs';
import { getPresignedR2UrlAction } from '@/app/actions/r2';
import { logout } from '@/app/actions/auth';

interface AdminClientProps {
    initialDocs: DocArticle[];
    userEmail: string;
}

// ─── Toolbar Button ────────────────────────────────────────────────────────────
function ToolbarBtn({
    icon: Icon, label, onClick, active, className
}: {
    icon: React.ElementType; label: string; onClick: () => void; active?: boolean; className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg transition-all text-zinc-400 hover:text-white hover:bg-white/10',
                active && 'bg-blue-600/30 text-blue-400',
                className
            )}
        >
            <Icon size={14} />
        </button>
    );
}

// ─── Image Upload Modal ────────────────────────────────────────────────────────
function ImageUploadModal({ onInsert, onClose }: { onInsert: (md: string) => void; onClose: () => void }) {
    const [tab, setTab] = useState<'url' | 'upload'>('url');
    const [url, setUrl] = useState('');
    const [alt, setAlt] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUrlInsert = () => {
        if (!url) return;
        onInsert(`![${alt || 'image'}](${url})`);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const res = await getPresignedR2UrlAction(file.name, file.type);
            if (res.error) throw new Error(res.error);
            // Upload directly to R2
            await fetch(res.uploadUrl!, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
            onInsert(`![${alt || file.name}](${res.publicUrl})`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold font-mono uppercase tracking-widest text-sm">Insert Image</h3>
                    <button onClick={onClose}><X size={16} className="text-zinc-500 hover:text-white" /></button>
                </div>
                <div className="flex gap-2 mb-4">
                    {(['url', 'upload'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={cn('px-4 py-1.5 rounded-lg text-xs font-mono uppercase transition-all', tab === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="space-y-3">
                    <input value={alt} onChange={e => setAlt(e.target.value)} placeholder="Alt text (optional)"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-mono" />
                    {tab === 'url' ? (
                        <>
                            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/image.jpg"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-mono" />
                            <button onClick={handleUrlInsert}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold font-mono uppercase transition-all">
                                Insert Image
                            </button>
                        </>
                    ) : (
                        <>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                            <button onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold font-mono uppercase transition-all flex items-center justify-center gap-2 border border-white/10">
                                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                {uploading ? 'Uploading to R2...' : 'Choose File & Upload'}
                            </button>
                            {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Link Modal ────────────────────────────────────────────────────────────────
function LinkModal({ onInsert, onClose }: { onInsert: (md: string) => void; onClose: () => void }) {
    const [href, setHref] = useState('');
    const [text, setText] = useState('');
    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold font-mono uppercase tracking-widest text-sm">Insert Link</h3>
                    <button onClick={onClose}><X size={16} className="text-zinc-500 hover:text-white" /></button>
                </div>
                <div className="space-y-3">
                    <input value={text} onChange={e => setText(e.target.value)} placeholder="Link text"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-mono" />
                    <input value={href} onChange={e => setHref(e.target.value)} placeholder="https://..."
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-mono" />
                    <button onClick={() => { if (href) onInsert(`[${text || href}](${href})`); }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold font-mono uppercase transition-all">
                        Insert Link
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Embed Modal ────────────────────────────────────────────────────────────────
function EmbedModal({ onInsert, onClose }: { onInsert: (md: string) => void; onClose: () => void }) {
    const [type, setType] = useState<'youtube' | 'tweet' | 'custom'>('youtube');
    const [input, setInput] = useState('');
    const insert = () => {
        if (!input) return;
        if (type === 'youtube') {
            const id = input.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] || input;
            onInsert(`\n<iframe width="100%" height="400" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>\n`);
        } else if (type === 'tweet') {
            onInsert(`\n<blockquote class="twitter-tweet"><a href="${input}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>\n`);
        } else {
            onInsert(`\n<iframe src="${input}" width="100%" height="400" frameborder="0"></iframe>\n`);
        }
    };
    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold font-mono uppercase tracking-widest text-sm">Embed Content</h3>
                    <button onClick={onClose}><X size={16} className="text-zinc-500 hover:text-white" /></button>
                </div>
                <div className="flex gap-2 mb-4">
                    {(['youtube', 'tweet', 'custom'] as const).map(t => (
                        <button key={t} onClick={() => setType(t)}
                            className={cn('px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all', type === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="space-y-3">
                    <input value={input} onChange={e => setInput(e.target.value)}
                        placeholder={type === 'youtube' ? 'YouTube URL or video ID' : type === 'tweet' ? 'Tweet URL' : 'Embed URL'}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-mono" />
                    <button onClick={insert}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold font-mono uppercase transition-all">
                        Insert Embed
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Markdown Preview ──────────────────────────────────────────────────────────
function MarkdownPreview({ content }: { content: string }) {
    const [html, setHtml] = useState('');
    useEffect(() => {
        let active = true;
        (async () => {
            const { unified } = await import('unified');
            const { default: remarkParse } = await import('remark-parse');
            const { default: remarkGfm } = await import('remark-gfm');
            const { default: remarkRehype } = await import('remark-rehype');
            const { default: rehypeRaw } = await import('rehype-raw');
            const { default: rehypeHighlight } = await import('rehype-highlight');
            const { default: rehypeStringify } = await import('rehype-stringify');
            const result = await unified()
                .use(remarkParse)
                .use(remarkGfm)
                .use(remarkRehype, { allowDangerousHtml: true })
                .use(rehypeRaw)
                .use(rehypeHighlight)
                .use(rehypeStringify)
                .process(content);
            if (active) setHtml(String(result));
        })();
        return () => { active = false; };
    }, [content]);
    return (
        <div
            className="prose prose-invert prose-sm max-w-none px-1"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

// ─── Main Editor ────────────────────────────────────────────────────────────────
export default function AdminClient({ initialDocs, userEmail }: AdminClientProps) {
    const [docs, setDocs] = useState<DocArticle[]>(initialDocs);
    const [selectedDoc, setSelectedDoc] = useState<Partial<DocArticle> | null>(null);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('edit');
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [saveOk, setSaveOk] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');
    const [isPending, setIsPending] = useState(false);
    const [modal, setModal] = useState<null | 'image' | 'link' | 'embed'>(null);
    const [indexMsg, setIndexMsg] = useState('');
    const [authors] = useState(['avrxt', 'guest', 'team']);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // ── Toolbar insert helper ──────────────────────────────────────────────────
    const insertAtCursor = useCallback((before: string, after = '', placeholder = '') => {
        const ta = textareaRef.current;
        if (!ta || !selectedDoc) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = ta.value.slice(start, end) || placeholder;
        const newVal = ta.value.slice(0, start) + before + selected + after + ta.value.slice(end);
        setSelectedDoc(prev => ({ ...prev, content: newVal }));
        // Restore cursor
        requestAnimationFrame(() => {
            ta.selectionStart = start + before.length;
            ta.selectionEnd = start + before.length + selected.length;
            ta.focus();
        });
    }, [selectedDoc]);

    const insertLine = useCallback((prefix: string, placeholder: string) => {
        const ta = textareaRef.current;
        if (!ta || !selectedDoc) return;
        const start = ta.selectionStart;
        const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1;
        const before = ta.value.slice(0, lineStart);
        const lineEnd = ta.value.indexOf('\n', start);
        const after = lineEnd === -1 ? '' : ta.value.slice(lineEnd);
        const line = ta.value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd) || placeholder;
        const newVal = `${before}${prefix}${line}${after}`;
        setSelectedDoc(prev => ({ ...prev, content: newVal }));
        requestAnimationFrame(() => ta.focus());
    }, [selectedDoc]);

    const toolbarActions = [
        { icon: Heading1, label: 'Heading 1', action: () => insertLine('# ', 'Heading') },
        { icon: Heading2, label: 'Heading 2', action: () => insertLine('## ', 'Heading') },
        { icon: Heading3, label: 'Heading 3', action: () => insertLine('### ', 'Heading') },
        { icon: Bold, label: 'Bold', action: () => insertAtCursor('**', '**', 'bold text') },
        { icon: Italic, label: 'Italic', action: () => insertAtCursor('*', '*', 'italic text') },
        { icon: Code2, label: 'Inline Code', action: () => insertAtCursor('`', '`', 'code') },
        { icon: Quote, label: 'Blockquote', action: () => insertLine('> ', 'quote') },
        { icon: List, label: 'Bullet List', action: () => insertLine('- ', 'item') },
        { icon: ListOrdered, label: 'Numbered List', action: () => insertLine('1. ', 'item') },
        { icon: Minus, label: 'Divider', action: () => insertAtCursor('\n---\n', '', '') },
        {
            icon: Code2, label: 'Code Block', action: () => insertAtCursor('\n```\n', '\n```\n', 'code here')
        },
        { icon: Image, label: 'Image', action: () => setModal('image') },
        { icon: Link2, label: 'Link', action: () => setModal('link') },
        { icon: Youtube, label: 'Embed', action: () => setModal('embed') },
        {
            icon: AlertTriangle, label: 'Callout', action: () => insertAtCursor(
                '\n> **⚠️ Note:** ', '', 'important note'
            )
        },
    ];

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!selectedDoc) return;
        setIsPending(true);
        setSaveStatus('SYNCING...');
        try {
            let result;
            const isNew = !selectedDoc.id;
            if (selectedDoc.id) {
                result = await updateDocAction(selectedDoc.id, selectedDoc);
            } else {
                result = await createDocAction(selectedDoc);
            }
            if (result.error) {
                setSaveOk(false);
                setSaveStatus(`ERROR: ${result.error}`);
            } else {
                setSaveOk(true);
                setSaveStatus('✓ SYNCED');
                if (result.data) {
                    if (isNew) {
                        setDocs([result.data as DocArticle, ...docs]);
                        setSelectedDoc(result.data as DocArticle);
                    } else {
                        setDocs(docs.map(d => d.id === result.data.id ? result.data as DocArticle : d));
                        setSelectedDoc(result.data as DocArticle);
                    }
                }
                // Auto-index if published and new doc
                if (isNew && selectedDoc.published && selectedDoc.slug) {
                    triggerGoogleIndex(selectedDoc.slug);
                }
                setTimeout(() => setSaveStatus(''), 3000);
            }
        } catch {
            setSaveOk(false);
            setSaveStatus('SYSTEM_FAILURE');
        } finally {
            setIsPending(false);
        }
    };

    const triggerGoogleIndex = async (slug: string) => {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://avrxt.in';
        const url = `${siteUrl}/docs/${slug}`;
        try {
            const res = await fetch('/api/search-console-index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (data.success) {
                setIndexMsg(`🔍 Submitted to Google: ${url}`);
                setTimeout(() => setIndexMsg(''), 5000);
            }
        } catch { }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this document? THIS CANNOT BE UNDONE.')) return;
        setIsPending(true);
        await deleteDocAction(id);
        setDocs(docs.filter(d => d.id !== id));
        setSelectedDoc(null);
        setIsPending(false);
    };

    const handleNewDoc = () => {
        setSelectedDoc({
            category: 'General',
            title: 'New Document',
            description: '',
            content: '# New Document\n\nStart writing your content here...\n\n## Section\n\nYour text...\n',
            color: 'blue',
            published: false,
            author: authors[0],
            tags: [],
        });
        setActiveTab('edit');
    };

    const filteredDocs = docs.filter(doc => {
        const q = searchQuery.toLowerCase();
        const matchQ = doc.title.toLowerCase().includes(q) ||
            doc.description?.toLowerCase().includes(q) ||
            doc.category.toLowerCase().includes(q);
        const matchF = filterPublished === 'all' ||
            (filterPublished === 'published' && doc.published) ||
            (filterPublished === 'draft' && !doc.published);
        return matchQ && matchF;
    });

    const colorMap: Record<string, string> = {
        blue: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
        cyan: 'bg-cyan-900/30 text-cyan-400 border-cyan-500/30',
        purple: 'bg-purple-900/30 text-purple-400 border-purple-500/30',
        green: 'bg-green-900/30 text-green-400 border-green-500/30',
        orange: 'bg-orange-900/30 text-orange-400 border-orange-500/30',
        pink: 'bg-pink-900/30 text-pink-400 border-pink-500/30',
    };

    return (
        <main className="min-h-screen bg-[#080808] text-white">
            {/* ── Modals ─────────────────────────────────────────────────────── */}
            {modal === 'image' && (
                <ImageUploadModal
                    onInsert={md => { insertAtCursor(md, ''); setModal(null); }}
                    onClose={() => setModal(null)}
                />
            )}
            {modal === 'link' && (
                <LinkModal
                    onInsert={md => { insertAtCursor(md, ''); setModal(null); }}
                    onClose={() => setModal(null)}
                />
            )}
            {modal === 'embed' && (
                <EmbedModal
                    onInsert={md => { insertAtCursor(md, ''); setModal(null); }}
                    onClose={() => setModal(null)}
                />
            )}

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080808]/90 backdrop-blur-xl">
                <div className="max-w-[1900px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-bold tracking-tighter font-mono whitespace-nowrap">DOCS_PUBLISHER</span>
                        <span className="text-[10px] text-zinc-600 font-mono hidden sm:inline">v4.0</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="text-[10px] text-zinc-600 font-mono hidden xl:inline truncate max-w-[180px]">{userEmail}</span>
                        {saveStatus && (
                            <span className={cn('text-[10px] font-mono px-3 py-1 rounded-full border', saveOk
                                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-900/20'
                                : 'text-red-400 border-red-500/30 bg-red-900/20')}>
                                {saveStatus}
                            </span>
                        )}
                        <Link href="/docs" target="_blank" prefetch={false}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold font-mono transition-all border border-white/5">
                            <Eye size={11} /> PREVIEW
                        </Link>
                        <Link href="/me/admin" prefetch={false}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 rounded-lg text-[10px] font-bold font-mono transition-all border border-purple-500/20">
                            PROFILE
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={isPending || !selectedDoc}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold font-mono transition-all shadow-[0_0_15px_rgba(59,130,246,0.25)]">
                            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            {isPending ? 'SAVING...' : 'SAVE'}
                        </button>
                        <button onClick={() => logout('/docs')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs font-bold font-mono transition-all">
                            <LogOut size={12} /> EXIT
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Google Index Toast ────────────────────────────────────────── */}
            {indexMsg && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-emerald-900/80 border border-emerald-500/30 rounded-2xl backdrop-blur-xl text-emerald-400 text-sm font-mono shadow-2xl">
                    {indexMsg}
                </div>
            )}

            {/* ── Body ──────────────────────────────────────────────────────── */}
            <div className="max-w-[1900px] mx-auto p-4 flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-56px)]">

                {/* ── Sidebar ────────────────────────────────────────────────── */}
                <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-3">
                    {/* Search & Filter */}
                    <div className="p-3 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-2.5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search docs..." id="admin-search"
                                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs outline-none focus:border-blue-500/50 transition-all font-mono text-white" />
                        </div>
                        <div className="flex gap-1.5">
                            {(['all', 'published', 'draft'] as const).map(f => (
                                <button key={f} onClick={() => setFilterPublished(f)}
                                    className={cn('flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase transition-all',
                                        filterPublished === f ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}>
                                    {f === 'published' && <Globe className="w-2.5 h-2.5 inline mr-1" />}
                                    {f === 'draft' && <Lock className="w-2.5 h-2.5 inline mr-1" />}
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* New Doc Button */}
                    <button onClick={handleNewDoc}
                        className="w-full p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <Plus size={16} /> New Document
                    </button>

                    {/* Doc List */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest px-1">{filteredDocs.length} doc{filteredDocs.length !== 1 ? 's' : ''}</p>
                        {filteredDocs.map(doc => (
                            <button key={doc.id} onClick={() => { setSelectedDoc(doc); setActiveTab('edit'); }}
                                className={cn(
                                    'w-full p-3 rounded-xl text-left transition-all border group',
                                    selectedDoc?.id === doc.id
                                        ? 'bg-blue-600/15 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.08)]'
                                        : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60 hover:border-white/10'
                                )}>
                                <div className="flex items-start justify-between mb-1.5">
                                    <h3 className="text-xs font-bold text-white line-clamp-1 flex-1 font-mono">{doc.title}</h3>
                                    {doc.published
                                        ? <Globe className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-2 mt-0.5" />
                                        : <Lock className="w-3 h-3 text-orange-500 flex-shrink-0 ml-2 mt-0.5" />}
                                </div>
                                <p className="text-[10px] text-zinc-500 line-clamp-1 mb-1.5 font-mono">{doc.description}</p>
                                <span className={cn('text-[9px] px-2 py-0.5 rounded-full font-mono uppercase border', colorMap[doc.color] || colorMap.blue)}>
                                    {doc.category}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* ── Editor Area ────────────────────────────────────────────── */}
                <section className="flex-1 min-w-0 flex flex-col gap-4">
                    {selectedDoc ? (
                        <>
                            {/* ── Meta Fields ──────────────────────────────── */}
                            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                    {/* Title */}
                                    <div className="xl:col-span-2">
                                        <label className="editor-label">Title</label>
                                        <input type="text" id="doc-title" value={selectedDoc.title || ''}
                                            onChange={e => setSelectedDoc(p => ({ ...p, title: e.target.value }))}
                                            className="editor-input" placeholder="Document Title" />
                                    </div>
                                    {/* Slug */}
                                    <div>
                                        <label className="editor-label">Slug (URL)</label>
                                        <input type="text" id="doc-slug" value={selectedDoc.slug || ''}
                                            onChange={e => setSelectedDoc(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                            className="editor-input font-mono" placeholder="doc-slug" />
                                    </div>
                                    {/* Category */}
                                    <div>
                                        <label className="editor-label">Category</label>
                                        <input type="text" id="doc-category" value={selectedDoc.category || ''}
                                            onChange={e => setSelectedDoc(p => ({ ...p, category: e.target.value }))}
                                            className="editor-input" placeholder="Category" />
                                    </div>
                                    {/* Author */}
                                    <div>
                                        <label className="editor-label">Author</label>
                                        <select id="doc-author" value={selectedDoc.author || authors[0]}
                                            onChange={e => setSelectedDoc(p => ({ ...p, author: e.target.value }))}
                                            className="editor-input bg-black">
                                            {authors.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                    {/* Color */}
                                    <div>
                                        <label className="editor-label">Color Theme</label>
                                        <select id="doc-color" value={selectedDoc.color || 'blue'}
                                            onChange={e => setSelectedDoc(p => ({ ...p, color: e.target.value as DocArticle['color'] }))}
                                            className="editor-input bg-black">
                                            {['blue', 'cyan', 'purple', 'green', 'orange', 'pink'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    {/* Tags */}
                                    <div>
                                        <label className="editor-label">Tags (comma-separated)</label>
                                        <input type="text" id="doc-tags" value={(selectedDoc.tags || []).join(', ')}
                                            onChange={e => setSelectedDoc(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                                            className="editor-input" placeholder="tag1, tag2" />
                                    </div>
                                    {/* Description */}
                                    <div className="sm:col-span-2 xl:col-span-4">
                                        <label className="editor-label">Description</label>
                                        <textarea id="doc-description" value={selectedDoc.description || ''}
                                            onChange={e => setSelectedDoc(p => ({ ...p, description: e.target.value }))}
                                            className="editor-input resize-none" rows={2} placeholder="Brief description for SEO and doc cards..." />
                                    </div>
                                    {/* Publish toggle */}
                                    <div className="sm:col-span-2 xl:col-span-4">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-900 rounded-xl border border-white/5 hover:border-white/10 transition-all group w-fit">
                                            <div className={cn(
                                                'w-10 h-5 rounded-full transition-all relative flex-shrink-0',
                                                selectedDoc.published ? 'bg-emerald-600' : 'bg-zinc-700'
                                            )}>
                                                <div className={cn(
                                                    'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
                                                    selectedDoc.published ? 'left-5' : 'left-0.5'
                                                )} />
                                            </div>
                                            <input type="checkbox" className="hidden" checked={!!selectedDoc.published}
                                                onChange={e => setSelectedDoc(p => ({ ...p, published: e.target.checked }))} />
                                            <span className="text-sm font-mono text-white">
                                                {selectedDoc.published ? '🌐 Published — Visible to public' : '🔒 Draft — Only visible to admin'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* ── Content Editor Card ───────────────────────── */}
                            <div className="flex-1 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col overflow-hidden">
                                {/* Editor toolbar + tabs */}
                                <div className="border-b border-white/5 flex flex-col">
                                    {/* Tab row */}
                                    <div className="flex items-center justify-between px-3 py-2 gap-2">
                                        <div className="flex items-center gap-1">
                                            {(['edit', 'split', 'preview'] as const).map(t => (
                                                <button key={t} onClick={() => setActiveTab(t)}
                                                    className={cn('px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase transition-all flex items-center gap-1.5',
                                                        activeTab === t ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5')}>
                                                    {t === 'edit' && <Edit2 size={10} />}
                                                    {t === 'preview' && <Eye size={10} />}
                                                    {t === 'split' && <Columns size={10} />}
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {selectedDoc.id && (
                                                <button onClick={() => handleDelete(selectedDoc.id!)}
                                                    disabled={isPending}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg text-[10px] font-mono uppercase transition-all border border-red-500/20">
                                                    <Trash2 size={10} /> Delete
                                                </button>
                                            )}
                                            {selectedDoc.slug && selectedDoc.published && (
                                                <button onClick={() => triggerGoogleIndex(selectedDoc.slug!)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 text-green-500 rounded-lg text-[10px] font-mono uppercase transition-all border border-green-500/20">
                                                    <Globe size={10} /> Index
                                                </button>
                                            )}
                                            {selectedDoc.slug && (
                                                <Link href={`/docs/${selectedDoc.slug}`} target="_blank"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[10px] font-mono uppercase transition-all">
                                                    <ExternalLink size={10} /> Open
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Formatting toolbar (only in edit / split) */}
                                    {activeTab !== 'preview' && (
                                        <div className="flex items-center gap-0.5 px-3 py-1.5 overflow-x-auto border-t border-white/5 scrollbar-hide">
                                            {toolbarActions.map((a, i) => (
                                                <ToolbarBtn key={i} icon={a.icon} label={a.label} onClick={a.action} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Editor / Preview panels */}
                                <div className={cn('flex-1 flex overflow-hidden', activeTab === 'split' ? 'flex-row' : 'flex-col')}>
                                    {/* Editor textarea */}
                                    {activeTab !== 'preview' && (
                                        <textarea
                                            ref={textareaRef}
                                            id="doc-content"
                                            value={selectedDoc.content || ''}
                                            onChange={e => setSelectedDoc(p => ({ ...p, content: e.target.value }))}
                                            onKeyDown={e => {
                                                // Tab key → indent
                                                if (e.key === 'Tab') {
                                                    e.preventDefault();
                                                    const ta = e.currentTarget;
                                                    const start = ta.selectionStart;
                                                    const end = ta.selectionEnd;
                                                    const newVal = ta.value.slice(0, start) + '    ' + ta.value.slice(end);
                                                    setSelectedDoc(p => ({ ...p, content: newVal }));
                                                    requestAnimationFrame(() => {
                                                        ta.selectionStart = ta.selectionEnd = start + 4;
                                                    });
                                                }
                                            }}
                                            className={cn(
                                                'flex-1 resize-none bg-transparent outline-none p-4 font-mono text-sm text-zinc-200 leading-relaxed',
                                                activeTab === 'split' && 'border-r border-white/5 w-1/2'
                                            )}
                                            placeholder="# Start writing your document in Markdown..."
                                            spellCheck={false}
                                        />
                                    )}
                                    {/* Preview panel */}
                                    {(activeTab === 'preview' || activeTab === 'split') && (
                                        <div className={cn(
                                            'flex-1 overflow-y-auto p-6',
                                            activeTab === 'split' && 'w-1/2'
                                        )}>
                                            <MarkdownPreview content={selectedDoc.content || ''} />
                                        </div>
                                    )}
                                </div>

                                {/* Status bar */}
                                <div className="border-t border-white/5 px-4 py-1.5 flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-zinc-600">
                                        {(selectedDoc.content || '').split('\n').length} lines · {(selectedDoc.content || '').length} chars
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-700">Markdown + HTML supported</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center rounded-2xl bg-zinc-900/30 border border-white/5 border-dashed min-h-[500px]">
                            <div className="text-center px-6">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
                                <h3 className="text-lg font-bold text-zinc-600 mb-2 font-mono">No Document Selected</h3>
                                <p className="text-sm text-zinc-700 font-mono mb-4">Select a doc from the sidebar or create a new one</p>
                                <button onClick={handleNewDoc}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold font-mono transition-all flex items-center gap-2 mx-auto">
                                    <Plus size={14} /> New Document
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <style jsx global>{`
                .editor-label {
                    display: block;
                    font-size: 10px;
                    font-family: var(--font-mono, monospace);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #52525b;
                    margin-bottom: 6px;
                }
                .editor-input {
                    width: 100%;
                    padding: 8px 12px;
                    background: rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 10px;
                    font-size: 13px;
                    color: white;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .editor-input:focus { border-color: rgba(59,130,246,0.5); }
                /* Scrollbar */
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style:none;scrollbar-width:none; }
                /* Prose styling for preview */
                .prose { color: #d4d4d8; }
                .prose h1,.prose h2,.prose h3,.prose h4 { color: #f4f4f5; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
                .prose h1 { font-size: 2em; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.3em; }
                .prose h2 { font-size: 1.5em; }
                .prose h3 { font-size: 1.25em; }
                .prose p { margin: 0.75em 0; line-height: 1.75; }
                .prose a { color: #60a5fa; text-decoration: underline; }
                .prose code { background: rgba(255,255,255,0.08); border-radius: 4px; padding: 2px 6px; font-size: 0.85em; font-family: var(--font-mono, monospace); color: #e2e8f0; }
                .prose pre { background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem; overflow-x: auto; margin: 1.25em 0; }
                .prose pre code { background: none; padding: 0; font-size: 0.875em; }
                .prose blockquote { border-left: 3px solid #3b82f6; padding-left: 1rem; color: #a1a1aa; margin: 1em 0; }
                .prose ul, .prose ol { padding-left: 1.5rem; margin: 0.75em 0; }
                .prose li { margin: 0.3em 0; }
                .prose hr { border-color: rgba(255,255,255,0.1); margin: 2em 0; }
                .prose table { border-collapse: collapse; width: 100%; margin: 1em 0; }
                .prose th { background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; text-align: left; border: 1px solid rgba(255,255,255,0.1); }
                .prose td { padding: 0.5rem 1rem; border: 1px solid rgba(255,255,255,0.08); }
                .prose img { border-radius: 12px; max-width: 100%; height: auto; margin: 1em 0; }
                .prose iframe { border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
                .prose strong { color: #f4f4f5; }
            `}</style>
        </main>
    );
}
