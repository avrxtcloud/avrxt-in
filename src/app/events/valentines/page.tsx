<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AVIORXT | The Valentine Letter</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Outfit:wght@100;300;400;600&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    
    <style>
        :root { --accent: #ffffff; }
        body { background-color: #000; overflow: hidden; font-family: 'Outfit', sans-serif; color: white; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        .noise {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            opacity: 0.04; pointer-events: none; z-index: 50;
            background: url('https://grainy-gradients.vercel.app/noise.svg');
        }

        .mote {
            position: absolute; background: white; border-radius: 50%;
            opacity: 0.3; pointer-events: none;
        }

        .letter-card {
            background: linear-gradient(135deg, rgba(12,12,12,0.98) 0%, rgba(3,3,3,1) 100%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            display: none;
            backdrop-filter: blur(30px);
            box-shadow: 0 50px 120px rgba(0,0,0,1);
        }

        .unseal-ring {
            position: relative; width: 110px; height: 110px;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 50%; cursor: pointer; transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .unseal-ring:hover {
            border-color: rgba(255,255,255,0.7);
            transform: scale(1.08);
            box-shadow: 0 0 50px rgba(255,255,255,0.15);
        }

        .text-gradient {
            background: linear-gradient(to bottom, #fff 20%, #999 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .custom-scroll::-webkit-scrollbar { width: 2px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
    </style>
</head>
<body>

    <div class="noise"></div>
    
    <audio id="bgMusic" loop>
        <source src="https://cdn.storage.avrxt.in/assets/SpotiDownloader.com%20-%20Raavano_%20-%20GABRI.mp3" type="audio/mpeg">
    </audio>

    <div id="glow-1" class="fixed top-[-15%] left-[-15%] w-[60%] h-[60%] bg-white/5 blur-[130px] rounded-full pointer-events-none"></div>
    <div id="glow-2" class="fixed bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-white/5 blur-[130px] rounded-full pointer-events-none"></div>

    <div class="relative z-10 min-h-screen flex items-center justify-center p-6">
        
        <div id="envelope" class="text-center">
            <div onclick="openLetter()" class="unseal-ring mx-auto mb-8 group">
                <span class="text-white text-2xl group-hover:scale-125 transition-transform duration-700">✦</span>
                <div class="absolute inset-0 border border-white/20 rounded-full animate-ping opacity-20"></div>
            </div>
            
            <p class="font-outfit font-light text-[10px] tracking-[0.6em] text-white/40 uppercase mb-10 opacity-0" id="clickText">Unseal to Hear & Read</p>
            
            <h1 class="font-serif italic text-4xl md:text-6xl mb-6 opacity-0 tracking-tight" id="envTitle">Reserved for You.</h1>
            <p class="font-outfit font-light text-white/20 tracking-[0.5em] text-[11px] uppercase opacity-0" id="envSub">A Valentine Message</p>
        </div>

        <div id="letter" class="letter-card w-full max-w-xl p-10 md:p-16 rounded-[50px] relative overflow-hidden">
            <div class="max-h-[75vh] overflow-y-auto custom-scroll pr-4">
                
                <header class="flex justify-between items-center mb-16">
                    <div class="font-outfit text-[10px] tracking-[0.6em] text-white/30 uppercase font-light">
                        XIV . II . MMXXVI
                    </div>
                    <div class="w-10 h-[1px] bg-white/20"></div>
                </header>

                <h2 class="font-serif text-4xl md:text-6xl mb-12 leading-[1.1] text-gradient">
                    The Art of <br><i class="font-normal">Existing Together</i>
                </h2>

                <div class="font-outfit font-light text-white/70 leading-relaxed space-y-10 text-base md:text-lg text-left border-l border-white/10 pl-10">
                    <p>
                        Love is not merely a destination we reach with another; it is the silent, pervasive architecture of the soul. Today, we celebrate that architecture in all its forms.
                    </p>
                    
                    <p>
                        <strong>To those sharing this path:</strong> May your connection be a sanctuary. Not a bond of necessity, but a dance of two whole worlds choosing to rotate in the same orbit. In a world of chaos, let your love be the one thing that feels like high-definition clarity.
                    </p>
                    
                    <p>
                        <strong>To those walking in solitude:</strong> Do not mistake silence for absence. Today is your day to recognize the masterpiece that you are, independent of a witness. Your capacity to find joy within yourself is the highest form of romance. You are not "waiting" for life to begin—you are the life worth waiting for.
                    </p>

                    <p>
                        Whether you find yourself in a quiet room or a crowded heart, know that <strong>AVIORXT</strong> stands with you in the pursuit of beauty, elegance, and truth.
                    </p>
                    
                    <p class="italic font-serif text-white/90 text-xl">
                        Stay inspired. Stay rare.
                    </p>
                </div>

                <footer class="mt-20 pt-12 border-t border-white/5 flex justify-between items-end">
                    <div class="text-left">
                        <p class="font-outfit text-[11px] tracking-[5px] text-white/20 uppercase mb-3">Authenticated by</p>
                        <p class="font-serif italic text-4xl text-white/95">AVIORXT</p>
                    </div>
                    <button onclick="closeLetter()" class="group flex items-center gap-4 font-outfit text-[10px] tracking-widest text-white/40 hover:text-white transition-colors">
                        CLOSE <span class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/5 transition-all">✕</span>
                    </button>
                </footer>
            </div>
        </div>

    </div>

    <script>
        function createMotes() {
            for (let i = 0; i < 40; i++) {
                let mote = document.createElement('div');
                mote.className = 'mote';
                let size = Math.random() * 2.5;
                mote.style.width = `${size}px`;
                mote.style.height = `${size}px`;
                mote.style.left = `${Math.random() * 100}%`;
                mote.style.top = `${Math.random() * 100}%`;
                document.body.appendChild(mote);
                
                gsap.to(mote, {
                    y: `+=${Math.random() * 150 - 75}`,
                    x: `+=${Math.random() * 150 - 75}`,
                    opacity: Math.random() * 0.4,
                    duration: 7 + Math.random() * 7,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        }

        window.onload = () => {
            createMotes();
            gsap.to("#clickText", { opacity: 1, duration: 2, delay: 0.5 });
            gsap.to("#envTitle", { opacity: 1, y: -10, duration: 2.5, ease: "power4.out", delay: 0.9 });
            gsap.to("#envSub", { opacity: 1, duration: 2.5, delay: 1.6 });
            
            gsap.to("#glow-1", { x: '10%', y: '15%', duration: 20, repeat: -1, yoyo: true, ease: "sine.inOut" });
            gsap.to("#glow-2", { x: '-10%', y: '-15%', duration: 25, repeat: -1, yoyo: true, ease: "sine.inOut" });
        };

        function openLetter() {
            const music = document.getElementById('bgMusic');
            const tl = gsap.timeline();
            
            // Audio Playback with Fade In
            music.volume = 0;
            music.play();
            gsap.to(music, { volume: 0.6, duration: 4 });

            // Visual Sequence
            tl.to("#envelope", { 
                opacity: 0, 
                scale: 1.15, 
                filter: "blur(40px)", 
                duration: 1.5, 
                ease: "expo.inOut", 
                onComplete: () => {
                    document.getElementById('envelope').style.display = 'none';
                    document.getElementById('letter').style.display = 'block';
                }
            });

            tl.fromTo("#letter", 
                { opacity: 0, y: 120, scale: 0.85, rotateX: 15 }, 
                { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 2.5, ease: "expo.out" }
            );
        }

        function closeLetter() {
            const music = document.getElementById('bgMusic');
            gsap.to(music, { volume: 0, duration: 1, onComplete: () => music.pause() });
            gsap.to("#letter", { opacity: 0, y: 50, scale: 0.9, duration: 1, ease: "power2.in", onComplete: () => location.reload() });
        }
    </script>
</body>
</html>
