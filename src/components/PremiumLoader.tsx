'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumLoader() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000); // 2 seconds high-end intro

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ 
                        opacity: 0,
                        transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
                    }}
                    className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden"
                >
                    <div className="relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "200px" }}
                            className="h-[1px] bg-white/20 relative"
                        >
                            <motion.div
                                initial={{ left: "-100%" }}
                                animate={{ left: "100%" }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                            />
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em] text-center"
                        >
                            aviorxt_core_initializing
                        </motion.div>
                    </div>

                    {/* Background Noise/Glow */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_50%)] pointer-events-none"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
