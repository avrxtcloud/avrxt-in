import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

const ValentinesPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden selection:bg-white selection:text-black">
      <Head>
        <title>AVRXT | Private Letter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Outfit:wght@200;400;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Subtle Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative z-10 w-full max-w-lg px-6 text-center">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* ENVELOPE UI */
            <motion.div
              key="envelope"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              className="cursor-pointer group"
              onClick={() => setIsOpen(true)}
            >
              <div className="relative inline-block">
                <motion.div 
                   whileHover={{ y: -5 }}
                   className="w-24 h-24 mb-8 mx-auto flex items-center justify-center border border-white/20 rounded-full bg-white/5 backdrop-blur-sm transition-colors group-hover:border-white/50"
                >
                  <span className="text-2xl">✦</span>
                </motion.div>
              </div>
              
              <h1 className="font-['Playfair_Display'] text-4xl italic mb-4">A letter for you.</h1>
              <p className="font-['Outfit'] font-light text-white/40 tracking-[0.2em] text-xs uppercase">Click to Unseal</p>
            </motion.div>
          ) : (
            /* OPENED LETTER UI */
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0A0A0A] border border-white/10 p-10 md:p-16 rounded-[40px] shadow-2xl relative overflow-hidden"
            >
              {/* Grain Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-['Outfit'] font-light text-[10px] tracking-[0.5em] text-white/30 uppercase mb-12"
              >
                February 14, 2026
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-['Playfair_Display'] text-3xl md:text-5xl mb-8"
              >
                The Art of <br />
                <span className="italic font-normal">Connection</span>
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="font-['Outfit'] font-light text-white/60 leading-relaxed space-y-6 text-sm md:text-base text-left border-l border-white/10 pl-6"
              >
                <p>
                  Today isn't just about a date on a calendar or a person by your side. It’s about the frequency you vibrate at when you love what you do, who you are, and the life you are building.
                </p>
                <p>
                  Whether you are sharing this day with a partner or finding peace in your own solitude, remember that <strong>connection</strong> starts with the self. You are the muse of your own story.
                </p>
                <p>
                  Stay elegant, stay inspired, and never settle for a love that doesn't feel like art.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center"
              >
                <div className="text-left">
                  <p className="font-['Playfair_Display'] italic text-lg">Ebin Sebastian</p>
                  <p className="font-['Outfit'] text-[9px] tracking-[3px] text-white/20 uppercase">AVRXT Architect</p>
                </div>
                <a href="https://avrxt.in" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                   <span className="text-xs">✕</span>
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global CSS for Playfair Italic and Custom Transitions */}
      <style jsx global>{`
        body { background-color: black; }
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default ValentinesPage;
