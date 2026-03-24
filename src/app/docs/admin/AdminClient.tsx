'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    BookOpen, Plus, Trash2, Save, LogOut, Edit2, Eye, Search,
    FileText, Check, Globe, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocArticle } from '@/lib/docs-config';
import { createDocAction, updateDocAction, deleteDocAction } from '@/app/actions/docs';
import { logout } from '@/app/actions/auth';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';

interface AdminClientProps {
    initialDocs: DocArticle[];
    userEmail: string;
}

export default function AdminClient({ initialDocs, userEmail }: AdminClientProps) {
    const [docs, setDocs] = useState<DocArticle[]>(initialDocs);
    const [selectedDoc, setSelectedDoc] = useState<Partial<DocArticle> | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');
    const [isPending, setIsPending] = useState(false);

    const router = useRouter();

    const handleSave = async () => {
        if (!selectedDoc) return;
        setIsPending(true);
        setSaveStatus('SYNCING...');

        try {
            let result;
            if (selectedDoc.id) {
                // Update existing
                result = await updateDocAction(selectedDoc.id, selectedDoc);
            } else {
                // Create new
                result = await createDocAction(selectedDoc);
            }

            if (result.error) {
                setSaveStatus(`ERROR: ${result.error}`);
            } else {
                setSaveStatus('SUCCESS: DOC_SYNCED');
                // Optimistic update or refetch
                // ideally we get the new doc back
                if (result.data) {
                    if (!selectedDoc.id) {
                        // If it was new, set ID and add to list
                        setDocs([result.data as DocArticle, ...docs]);
                        setSelectedDoc(result.data as DocArticle);
                    } else {
                        // Update list
                        setDocs(docs.map(d => d.id === result.data.id ? result.data as DocArticle : d));
                        setSelectedDoc(result.data as DocArticle);
                    }
                }

                setTimeout(() => setSaveStatus(''), 3000);
            }
        } catch (e) {
            setSaveStatus('SYSTEM_FAILURE');
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this document? THIS CANNOT BE UNDONE.')) {
            setIsPending(true);
            await deleteDocAction(id);
            setDocs(docs.filter(d => d.id !== id));
            setSelectedDoc(null);
            setIsEditing(false);
            setIsPending(false);
        }
    };

    const handleNewDoc = () => {
        const newDoc: Partial<DocArticle> = {
            category: 'General',
            title: 'New Document',
            description: '',
            content: '# New Document\n\nStart writing your content here...',
            color: 'blue',
            published: false,
            tags: []
        };
        setSelectedDoc(newDoc);
        setIsEditing(true);
    };

    const filteredDocs = docs.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterPublished === 'all' ||
            (filterPublished === 'published' && doc.published) ||
            (filterPublished === 'draft' && !doc.published);

        return matchesSearch && matchesFilter;
    });

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/10">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
                <nav className="max-w-[1800px] mx-auto px-6 h-auto min-h-16 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <BookOpen className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <h1 className="text-lg font-bold tracking-tighter uppercase font-mono whitespace-nowrap">Docs_Publisher</h1>
                        <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap">v3.0 (Supabase)</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                        <span className="text-[10px] text-zinc-500 font-mono hidden lg:inline">
                            USER: {userEmail}
                        </span>
                        <Link
                            href="/docs"
                            target="_blank"
                            prefetch={false}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full text-[10px] font-bold font-mono transition-all border border-white/5"
                        >
                            <Eye size={12} /> PREVIEW
                        </Link>
                        <Link
                            href="/me/admin"
                            prefetch={false}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 hover:text-purple-300 rounded-full text-[10px] font-bold font-mono transition-all border border-purple-500/20"
                        >
                            PROFILE
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={isPending || !selectedDoc}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-xs font-bold font-mono transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        >
                            <Save size={14} /> {isPending ? 'SYNCING...' : 'SAVE'}
                        </button>
                        <button onClick={() => logout('/docs')} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-xs font-bold font-mono transition-all">
                            <LogOut size={14} /> EXIT
                        </button>
                    </div>
                </nav>
            </header>

            {saveStatus && (
                <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Check className="text-emerald-500" size={16} />
                    <span className="text-[10px] font-mono text-emerald-500 uppercase">{saveStatus}</span>
                </div>
            )}

            <div className="max-w-[1800px] mx-auto p-6 flex flex-col lg:flex-row gap-6">
                {/* Sidebar - Document List */}
                <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
                    {/* Search & Filter */}
                    <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search docs..."
                                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm outline-none focus:border-blue-500/50 transition-all font-mono text-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'published', 'draft'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setFilterPublished(filter as any)}
                                    className={cn(
                                        "flex-1 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase transition-all",
                                        filterPublished === filter ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    )}
                                >
                                    {filter === 'published' && <Globe className="w-3 h-3 inline mr-1" />}
                                    {filter === 'draft' && <Lock className="w-3 h-3 inline mr-1" />}
                                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* New Document Button */}
                    <button
                        onClick={handleNewDoc}
                        className="w-full p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    >
                        <Plus size={18} /> New Document
                    </button>

                    {/* Document List */}
                    <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar pr-2">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3">
                            {filteredDocs.length} Document{filteredDocs.length !== 1 ? 's' : ''}
                        </div>
                        {filteredDocs.map((doc, idx) => (
                            <Reveal key={doc.id} delay={idx * 0.05} direction="right">
                                <button
                                    onClick={() => {
                                        setSelectedDoc(doc);
                                        setIsEditing(false);
                                    }}
                                    className={cn(
                                        "w-full p-4 rounded-xl text-left transition-all border group",
                                        selectedDoc?.id === doc.id
                                            ? "bg-blue-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                            : "bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-sm font-bold text-white line-clamp-1 flex-1 font-mono tracking-tight">{doc.title}</h3>
                                        {doc.published ? (
                                            <Globe className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-2" />
                                        ) : (
                                            <Lock className="w-3 h-3 text-orange-500 flex-shrink-0 ml-2" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 line-clamp-2 mb-2 font-mono uppercase tracking-tighter">{doc.description}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[8px] px-2 py-0.5 rounded-full font-mono uppercase",
                                            doc.color === 'blue' && "bg-blue-900/30 text-blue-400 border border-blue-500/30",
                                            doc.color === 'cyan' && "bg-cyan-900/30 text-cyan-400 border border-cyan-500/30",
                                            doc.color === 'purple' && "bg-purple-900/30 text-purple-400 border border-purple-500/30",
                                            doc.color === 'green' && "bg-green-900/30 text-green-400 border border-green-500/30",
                                            doc.color === 'orange' && "bg-orange-900/30 text-orange-400 border border-orange-500/30",
                                            doc.color === 'pink' && "bg-pink-900/30 text-pink-400 border border-pink-500/30"
                                        )}>
                                            {doc.category}
                                        </span>
                                    </div>
                                </button>
                            </Reveal>
                        ))}
                    </div>
                </aside>

                {/* Main Content - Editor */}
                <section className="flex-1 min-w-0">
                    {selectedDoc ? (
                        <div className="space-y-6">
                            {/* Document Header */}
                            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold font-mono uppercase tracking-tight">
                                        {isEditing ? 'Edit Document' : 'Document Preview'}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        {!isEditing && selectedDoc.id && (
                                            <>
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono uppercase transition-all flex items-center gap-2"
                                                >
                                                    <Edit2 size={12} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(selectedDoc.id!)}
                                                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg text-xs font-mono uppercase transition-all flex items-center gap-2 border border-red-500/30"
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </>
                                        )}
                                        {isEditing && (
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono uppercase transition-all"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block">Title</label>
                                            <input
                                                type="text"
                                                value={selectedDoc.title}
                                                onChange={(e) => setSelectedDoc({ ...selectedDoc, title: e.target.value })}
                                                className="admin-input"
                                                placeholder="Document Title"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block">Slug (URL)</label>
                                            <input
                                                type="text"
                                                value={selectedDoc.slug}
                                                onChange={(e) => setSelectedDoc({ ...selectedDoc, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                className="admin-input"
                                                placeholder="document-slug"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block">Category</label>
                                            <input
                                                type="text"
                                                value={selectedDoc.category}
                                                onChange={(e) => setSelectedDoc({ ...selectedDoc, category: e.target.value })}
                                                className="admin-input"
                                                placeholder="Category"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block">Color Theme</label>
                                            <select
                                                value={selectedDoc.color}
                                                onChange={(e) => setSelectedDoc({ ...selectedDoc, color: e.target.value as any })}
                                                className="admin-input bg-black"
                                            >
                                                <option value="blue">Blue</option>
                                                <option value="cyan">Cyan</option>
                                                <option value="purple">Purple</option>
                                                <option value="green">Green</option>
                                                <option value="orange">Orange</option>
                                                <option value="pink">Pink</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block">Description</label>
                                            <textarea
                                                value={selectedDoc.description}
                                                onChange={(e) => setSelectedDoc({ ...selectedDoc, description: e.target.value })}
                                                className="admin-input min-h-[80px]"
                                                placeholder="Brief description..."
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer bg-zinc-800/50 p-4 rounded-xl border border-white/5 w-full">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDoc.published}
                                                    onChange={(e) => setSelectedDoc({ ...selectedDoc, published: e.target.checked })}
                                                    className="w-4 h-4 rounded bg-zinc-800 border-white/10 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-mono text-white">Publish Document</span>
                                            </label>
                                        </div>
                                    </div>
                                ) : ( // Preview Mode
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "text-[10px] px-3 py-1 rounded-full font-mono uppercase border",
                                                selectedDoc.color === 'blue' && "bg-blue-900/30 text-blue-400 border-blue-500/30",
                                                selectedDoc.color === 'cyan' && "bg-cyan-900/30 text-cyan-400 border-cyan-500/30",
                                                selectedDoc.color === 'purple' && "bg-purple-900/30 text-purple-400 border-purple-500/30",
                                                selectedDoc.color === 'green' && "bg-green-900/30 text-green-400 border-green-500/30",
                                                selectedDoc.color === 'orange' && "bg-orange-900/30 text-orange-400 border-orange-500/30",
                                                selectedDoc.color === 'pink' && "bg-pink-900/30 text-pink-400 border-pink-500/30"
                                            )}>
                                                {selectedDoc.category}
                                            </span>
                                            {selectedDoc.published ? (
                                                <span className="text-[10px] px-3 py-1 rounded-full font-mono uppercase bg-emerald-900/30 text-emerald-400 border border-emerald-500/30">
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-3 py-1 rounded-full font-mono uppercase bg-orange-900/30 text-orange-400 border border-orange-500/30">
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-3xl font-bold text-white">{selectedDoc.title}</h1>
                                        <p className="text-zinc-400">{selectedDoc.description}</p>
                                        <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono">
                                            <span>Slug: /{selectedDoc.slug}</span>
                                            <span>•</span>
                                            <span>{selectedDoc.date}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content Editor */}
                            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-400">
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Content (Markdown)
                                    </h3>
                                    {isEditing && (
                                        <span className="text-[10px] text-zinc-600 font-mono">Supports Markdown formatting</span>
                                    )}
                                </div>
                                {isEditing ? (
                                    <textarea
                                        value={selectedDoc.content}
                                        onChange={(e) => setSelectedDoc({ ...selectedDoc, content: e.target.value })}
                                        className="admin-input min-h-[500px] font-mono text-sm"
                                        placeholder="# Your Document Title..."
                                    />
                                ) : (
                                    <div className="prose prose-invert max-w-none">
                                        <pre className="bg-black/40 p-6 rounded-xl border border-white/5 overflow-x-auto">
                                            <code className="text-sm text-zinc-300 font-mono">{selectedDoc.content}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[600px] flex items-center justify-center rounded-2xl bg-zinc-900/40 border border-white/5 border-dashed">
                            <div className="text-center">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
                                <h3 className="text-xl font-bold text-zinc-600 mb-2 font-mono">No Document Selected</h3>
                                <p className="text-sm text-zinc-700 font-mono">Select a document from the sidebar or create a new one</p>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <style jsx global>{`
                .admin-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: rgba(0,0,0,0.6);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    font-family: var(--font-mono);
                    outline: none;
                    transition: all 0.2s;
                    color: white;
                }
                .admin-input:focus {
                    border-color: rgba(59,130,246,0.5);
                    background: rgba(0,0,0,0.8);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 99px;
                }
            `}</style>
        </main>
    );
}
