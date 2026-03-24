'use client';

import { useEffect, useState } from 'react';

export default function DocContent({ content }: { content: string }) {
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
        <>
            <div
                className="doc-prose"
                dangerouslySetInnerHTML={{ __html: html || '<p style="color:#52525b;font-family:monospace">Rendering...</p>' }}
            />
            <style jsx global>{`
                .doc-prose { color: #d4d4d8; font-size: 1rem; line-height: 1.8; }
                .doc-prose h1, .doc-prose h2, .doc-prose h3, .doc-prose h4, .doc-prose h5, .doc-prose h6 {
                    color: #f4f4f5; font-weight: 700; line-height: 1.3; margin-top: 2em; margin-bottom: 0.6em;
                }
                .doc-prose h1 { font-size: 2.2em; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 0.4em; }
                .doc-prose h2 { font-size: 1.6em; }
                .doc-prose h3 { font-size: 1.3em; }
                .doc-prose h4 { font-size: 1.1em; }
                .doc-prose p { margin: 1em 0; }
                .doc-prose a { color: #60a5fa; text-decoration: underline; text-underline-offset: 3px; transition: color 0.2s; }
                .doc-prose a:hover { color: #93c5fd; }
                .doc-prose strong { color: #f4f4f5; font-weight: 600; }
                .doc-prose em { color: #a1a1aa; }
                .doc-prose code {
                    background: rgba(255,255,255,0.07); border-radius: 5px; padding: 2px 7px;
                    font-size: 0.85em; font-family: var(--font-mono, monospace); color: #f0abfc;
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .doc-prose pre {
                    background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 14px; padding: 1.4rem 1.6rem; overflow-x: auto; margin: 1.6em 0;
                    position: relative;
                }
                .doc-prose pre code {
                    background: none; padding: 0; border: none; font-size: 0.875em;
                    color: #e2e8f0; line-height: 1.7;
                }
                .doc-prose blockquote {
                    border-left: 3px solid #3b82f6; padding: 0.6rem 1.2rem;
                    color: #a1a1aa; margin: 1.4em 0; background: rgba(59,130,246,0.04);
                    border-radius: 0 8px 8px 0;
                }
                .doc-prose ul { list-style: none; padding-left: 1.2rem; margin: 0.75em 0; }
                .doc-prose ul li::before { content: '→'; color: #3b82f6; margin-right: 0.5rem; }
                .doc-prose ol { padding-left: 1.5rem; margin: 0.75em 0; }
                .doc-prose li { margin: 0.4em 0; }
                .doc-prose hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 2.5em 0; }
                .doc-prose table { border-collapse: collapse; width: 100%; margin: 1.4em 0; font-size: 0.9em; }
                .doc-prose th {
                    background: rgba(255,255,255,0.04); padding: 0.6rem 1rem;
                    text-align: left; border: 1px solid rgba(255,255,255,0.1);
                    color: #f4f4f5; font-weight: 600; font-size: 0.8em; text-transform: uppercase; letter-spacing: 0.05em;
                }
                .doc-prose td { padding: 0.6rem 1rem; border: 1px solid rgba(255,255,255,0.07); }
                .doc-prose tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
                .doc-prose img {
                    border-radius: 14px; max-width: 100%; height: auto;
                    margin: 1.5em auto; display: block;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 4px 30px rgba(0,0,0,0.4);
                }
                .doc-prose iframe {
                    border-radius: 10px; max-width: 100%; border: 1px solid rgba(255,255,255,0.1);
                    margin: 1.5em 0; display: block;
                }
                /* Highlight.js base */
                .hljs-keyword, .hljs-selector-tag { color: #c792ea; }
                .hljs-string, .hljs-attr { color: #c3e88d; }
                .hljs-number, .hljs-literal { color: #f78c6c; }
                .hljs-comment { color: #546e7a; font-style: italic; }
                .hljs-function { color: #82aaff; }
                .hljs-title { color: #ffcb6b; }
                .hljs-variable { color: #f07178; }
                .hljs-built_in { color: #80cbc4; }
                /* Callout style */
                .doc-prose blockquote strong { color: #fbbf24; }
                @media (max-width: 640px) {
                    .doc-prose h1 { font-size: 1.7em; }
                    .doc-prose h2 { font-size: 1.3em; }
                    .doc-prose pre { padding: 1rem; border-radius: 10px; }
                    .doc-prose table { font-size: 0.8em; }
                }
            `}</style>
        </>
    );
}
