document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);

    // --- Custom Cursor ---
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Immediate update for the dot
        gsap.set(cursor, { x: mouseX - 4, y: mouseY - 4 });
    });

    // Smooth following for the outer circle
    gsap.ticker.add(() => {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        gsap.set(follower, { x: followerX - 20, y: followerY - 20 });
    });

    // Hover effects on interactive elements
    const interactives = document.querySelectorAll('a, button, .glass-card');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => follower.classList.add('hover-active'));
        el.addEventListener('mouseleave', () => follower.classList.remove('hover-active'));
    });

    // --- GSAP Animations ---

    // Initial Hero Text Reveal
    const splitTexts = document.querySelectorAll('.split-text span');
    gsap.to(splitTexts, {
        y: "0%",
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.2
    });

    gsap.from('.fade-up', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 1
    });

    // ScrollTrigger Animations for Cards
    const staggerCards = document.querySelectorAll('.stagger-card');
    staggerCards.forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // --- Jarvis Logic ---
    const btnJarvis = document.getElementById('btn-jarvis');
    const visualizer = document.getElementById('jarvis-visualizer');
    const inputArea = document.getElementById('jarvis-input-area');
    const visitorNameInput = document.getElementById('visitor-name');
    const submitBtn = document.getElementById('submit-name');
    const bars = document.querySelectorAll('.bar');

    let jarvisVoice = null;
    let speakingInterval;

    function initJarvisVoice() {
        const voices = window.speechSynthesis.getVoices();
        jarvisVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.lang === 'en-GB') || voices[0];
    }
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = initJarvisVoice;
    }

    function speak(text, callback) {
        if (!window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        if (jarvisVoice) utterance.voice = jarvisVoice;
        utterance.rate = 0.9;
        utterance.pitch = 0.8;

        utterance.onstart = () => {
            btnJarvis.classList.add('hidden');
            visualizer.classList.remove('hidden');
            // Animate visualizer
            speakingInterval = setInterval(() => {
                bars.forEach(bar => {
                    bar.style.height = (5 + Math.random() * 20) + 'px';
                });
            }, 100);
        };

        utterance.onend = () => {
            clearInterval(speakingInterval);
            // Revert visualizer bars
            bars.forEach(bar => bar.style.height = '5px');
            
            if(callback) {
                // If there's a callback, we are in the middle of the flow (e.g., asking for name)
                callback();
            } else {
                // This is the end of the final speech, so reset everything to allow replay
                setTimeout(() => {
                    visualizer.classList.add('hidden');
                    const standby = document.getElementById('jarvis-standby');
                    if(standby) standby.remove();
                    btnJarvis.classList.remove('hidden');
                    visitorNameInput.value = ''; // Clear input for next time
                }, 2000); // Wait 2 seconds before resetting
            }
        };

        window.speechSynthesis.speak(utterance);
    }

    btnJarvis.addEventListener('click', () => {
        // Ensure any previous standby text is removed
        const standby = document.getElementById('jarvis-standby');
        if(standby) standby.remove();
        
        speak("System activated. I am Jarvis. Please state your name for authorization.", () => {
            // Callback: show input area
            visualizer.classList.remove('hidden'); // Keep visualizer visible but flat
            
            if (!document.getElementById('jarvis-standby')) {
                const standbyText = document.createElement('span');
                standbyText.id = 'jarvis-standby';
                standbyText.style.color = 'var(--iron-gold)';
                standbyText.style.fontFamily = 'var(--font-head)';
                standbyText.style.fontSize = '0.8rem';
                standbyText.style.marginLeft = '10px';
                standbyText.innerText = 'AWAITING INPUT...';
                visualizer.appendChild(standbyText);
            }
            
            inputArea.classList.remove('hidden');
            visitorNameInput.focus();
        });
    });

    function handleNameSubmit() {
        const name = visitorNameInput.value.trim();
        if(name) {
            inputArea.classList.add('hidden');
            const standby = document.getElementById('jarvis-standby');
            if(standby) standby.remove(); // Remove standby text while speaking
            
            // Tony Stark style intro!
            let speechText = "";
            if (name.toLowerCase() === "giri" || name.toLowerCase() === "giri p") {
                speechText = `Welcome back, Sir. Systems are online and operating at optimal capacity. All database logs are ready for your review.`;
            } else {
                speechText = `Authorization accepted. Welcome, ${name}. Allow me to introduce the master architect of this system, Mr. Giri. He is a visionary Full-stack and A.I. engineer. All data logs are now unencrypted for your viewing pleasure. Enjoy the tour.`;
            }
            
            speak(speechText);
        }
    }

    submitBtn.addEventListener('click', handleNameSubmit);
    visitorNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleNameSubmit();
    });

});
