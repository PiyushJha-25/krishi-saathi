import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Step {
    id: string;
    target: string | null;
    title: string;
    subtitle: string;
    body: string;
    position: 'top' | 'bottom' | 'center';
    voiceText: string;
}

const steps: Step[] = [
    {
        id: 'welcome',
        target: null,
        title: 'Namaste! 🙏',
        subtitle: 'Main Sahayak hoon — aapka AI farming assistant',
        body: 'Main aapko Krishi Saathi ke saare features 2 minute mein sikhaunga. Chalein shuru karte hain!',
        position: 'center',
        voiceText: 'Namaste! Main Sahayak hoon. Main aapko Krishi Saathi use karna sikhaunga.'
    },
    {
        id: 'scan',
        target: '[data-tour="scan"]',
        title: 'Fasal Scan Karo',
        subtitle: 'Crop Disease Detection',
        body: 'Apni fasal ke patte ki photo lo. AI 3 second mein bimari pata kar dega aur ilaj bhi batayega.',
        position: 'top',
        voiceText: 'Fasal scan karo. Patte ki photo lo aur AI turant bimari pata kar dega.'
    },
    {
        id: 'mandi',
        target: '[data-tour="mandi"]',
        title: 'Mandi Voice',
        subtitle: 'Market Price Calculator',
        body: 'Apni fasal ka naam bolo ya type karo. AI batayega — kahan bechne se zyada faida hoga.',
        position: 'top',
        voiceText: 'Mandi Voice. Fasal ka naam bolo aur AI sahi bhav batayega.'
    },
    {
        id: 'diary',
        target: '[data-tour="diary"]',
        title: 'Crop Diary',
        subtitle: 'Farm Journal',
        body: 'Roz ka kaam voice mein record karo. AI aapki diary padh ke personalized salah dega.',
        position: 'top',
        voiceText: 'Crop diary mein roz ka kaam record karo. AI aapko salah dega.'
    },
    {
        id: 'offline',
        target: '[data-tour="offline-toggle"]',
        title: 'Offline Mode',
        subtitle: 'Internet ke bina bhi kaam karta hai',
        body: 'Internet nahi hai? Koi baat nahi. Ye toggle dabao — sab features offline chalenge.',
        position: 'bottom',
        voiceText: 'Offline mode mein bhi sab kaam karta hai. Internet ki zaroorat nahi.'
    },
    {
        id: 'language',
        target: '[data-tour="language"]',
        title: 'Apni Bhasha Chunein',
        subtitle: '8 Indian Languages',
        body: 'Hindi, Telugu, Tamil, Kannada aur 4 aur languages mein use karo.',
        position: 'bottom',
        voiceText: 'Apni bhasha mein use karo. Aath Indian languages available hain.'
    },
    {
        id: 'complete',
        target: null,
        title: 'Aap Taiyaar Hain!',
        subtitle: 'Kheti karo smarter 🌾',
        body: 'Krishi Saathi ab aapka saathi hai. Chalo shuru karte hain!',
        position: 'center',
        voiceText: 'Badhai ho! Aap Krishi Saathi use karne ke liye taiyaar hain.'
    }
];

export const AppTour: React.FC = () => {
    const { language } = useLanguage();
    const [showTour, setShowTour] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [cardPos, setCardPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const tourCompleted = localStorage.getItem('krishi_tour_completed');
        if (tourCompleted !== 'true') {
            const timer = setTimeout(() => setShowTour(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const speak = (text: string) => {
        if (language !== 'हिन्दी') return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'hi-IN';
        u.rate = 0.85;
        u.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const hindi = voices.find(v => v.name === 'Google हिन्दी' || v.lang === 'hi-IN');
        if (hindi) u.voice = hindi;
        window.speechSynthesis.speak(u);
    };

    const updatePosition = () => {
        const step = steps[currentStep];
        if (step.target) {
            const el = document.querySelector(step.target);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);
                    calculateCardPosition(rect, step.position);
                }, 400);
            }
        } else {
            setTargetRect(null);
            calculateCardPosition(null, 'center');
        }
    };

    const calculateCardPosition = (rect: DOMRect | null, position: string) => {
        const cardWidth = window.innerWidth >= 768 ? 380 : Math.min(320, window.innerWidth - 32);
        const cardHeight = cardRef.current?.offsetHeight || 200;
        let top = 0;
        let left = 0;

        if (position === 'center' || !rect) {
            top = window.innerHeight / 2 - cardHeight / 2;
            left = window.innerWidth / 2 - cardWidth / 2;
        } else if (position === 'top') {
            top = rect.top - cardHeight - 20;
            left = rect.left + rect.width / 2 - cardWidth / 2;
        } else if (position === 'bottom') {
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2 - cardWidth / 2;
        }

        // Viewport clamping
        left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - cardHeight - 16));

        setCardPos({ top, left });
    };

    useEffect(() => {
        if (showTour) {
            updatePosition();
            speak(steps[currentStep].voiceText);
        } else {
            window.speechSynthesis.cancel();
        }
    }, [showTour, currentStep]);

    useEffect(() => {
        const handleResize = () => {
            const timeoutId = setTimeout(updatePosition, 100);
            return () => clearTimeout(timeoutId);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentStep]);

    const nextStep = () => {
        if (currentStep === steps.length - 1) {
            completeTour();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const completeTour = () => {
        window.speechSynthesis.cancel();
        localStorage.setItem('krishi_tour_completed', 'true');
        setShowTour(false);
    };

    const skipTour = () => {
        window.speechSynthesis.cancel();
        localStorage.setItem('krishi_tour_completed', 'true');
        setShowTour(false);
    };

    if (!showTour) return null;

    const step = steps[currentStep];

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'auto' }}>
            <style>
                {`
          @keyframes tourPulse {
            0%, 100% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.78), 0 0 0 4px rgba(22,163,74,0.4); }
            50% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.78), 0 0 0 8px rgba(22,163,74,0.2); }
          }
          @keyframes cardSlideIn {
            from { opacity: 0; transform: translateY(10px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
          @keyframes confetti { 
            0%{transform:translate(0,0) rotate(0deg); opacity:1} 
            100%{transform:translate(var(--tx), var(--ty)) rotate(360deg); opacity:0} 
          }
          .confetti-dot {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            animation: confetti 0.8s ease-out forwards;
          }
        `}
            </style>

            {/* Overlay Background */}
            <div style={{ position: 'absolute', inset: 0, background: targetRect ? 'transparent' : 'rgba(0,0,0,0.78)', backdropFilter: 'blur(2px)' }} />

            {/* Spotlight */}
            {targetRect && (
                <div style={{
                    position: 'fixed',
                    top: targetRect.top - 12,
                    left: targetRect.left - 12,
                    width: targetRect.width + 24,
                    height: targetRect.height + 24,
                    borderRadius: '14px',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.78)',
                    border: '2.5px solid rgba(22,163,74,0.9)',
                    zIndex: 10000,
                    pointerEvents: 'none',
                    animation: 'tourPulse 2s ease-in-out infinite'
                }} />
            )}

            {/* Tour Card */}
            <div ref={cardRef} style={{
                position: 'fixed',
                top: cardPos.top,
                left: cardPos.left,
                background: 'white',
                borderRadius: '20px',
                padding: window.innerWidth >= 768 ? '24px' : '18px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(22,163,74,0.2)',
                zIndex: 10001,
                width: window.innerWidth >= 768 ? '380px' : 'min(320px, calc(100vw - 32px))',
                animation: 'cardSlideIn 0.3s ease'
            }}>
                {step.id === 'welcome' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: window.innerWidth >= 768 ? '72px' : '60px',
                            height: window.innerWidth >= 768 ? '72px' : '60px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #16a34a, #14532d)',
                            margin: '0 auto 16px',
                            border: '3px solid #16a34a',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
                        }}>
                            <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h2 style={{ fontSize: window.innerWidth >= 768 ? '24px' : '20px', fontWeight: 800, margin: '0 0 4px', color: '#1e293b' }}>{step.title}</h2>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', marginBottom: '12px' }}>{step.subtitle}</p>
                        <p style={{ fontSize: window.innerWidth >= 768 ? '14px' : '13px', color: '#64748b', lineHeight: 1.6 }}>{step.body}</p>
                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={nextStep} style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>Tour Shuru Karo</button>
                            <button onClick={skipTour} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', fontWeight: 600, cursor: 'pointer' }}>Skip</button>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sirf 2 minute lagenge</span>
                        </div>
                    </div>
                ) : step.id === 'complete' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 20px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#16a34a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                                fontSize: '32px', animation: 'checkPop 0.5s ease forwards'
                            }}>
                                ✓
                            </div>
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="confetti-dot" style={{
                                    left: '50%', top: '50%',
                                    backgroundColor: ['#16a34a', '#f59e0b', '#3b82f6', '#ec4899'][i % 4],
                                    '--tx': `${(Math.random() - 0.5) * 160}px`,
                                    '--ty': `${(Math.random() - 0.5) * 160}px`
                                } as any} />
                            ))}
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>{step.title}</h2>
                        <p style={{ color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>{step.subtitle}</p>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>{step.body}</p>
                        <button onClick={completeTour} style={{ width: '100%', height: '50px', marginTop: '24px', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 16px rgba(22,163,74,0.3)' }}>App Use Karna Shuru Karo →</button>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', border: '1px solid #dcfce7' }}>
                                Step {currentStep} of {steps.length - 2}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>S</div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>Sahayak</span>
                            </div>
                        </div>

                        <h2 style={{ fontSize: window.innerWidth >= 768 ? '18px' : '16px', fontWeight: 700, color: '#1e293b' }}>{step.title}</h2>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{step.subtitle}</p>
                        <p style={{ fontSize: window.innerWidth >= 768 ? '14px' : '13px', color: '#64748b', lineHeight: 1.6, marginTop: '8px' }}>{step.body}</p>

                        <div style={{ height: '1px', background: '#f1f5f9', margin: '16px 0' }} />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {steps.slice(1, -1).map((_, i) => (
                                    <div key={i} style={{
                                        width: i + 1 === currentStep ? '16px' : (window.innerWidth >= 768 ? '8px' : '7px'),
                                        height: window.innerWidth >= 768 ? '8px' : '7px',
                                        borderRadius: '4px',
                                        background: i + 1 === currentStep ? '#16a34a' : (i + 1 < currentStep ? '#16a34a' : 'transparent'),
                                        border: i + 1 >= currentStep ? '1.5px solid #16a34a' : 'none',
                                        transition: 'all 0.3s'
                                    }} />
                                ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button onClick={skipTour} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Skip</button>
                                <button onClick={nextStep} style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)', color: 'white', border: 'none', borderRadius: '10px', padding: window.innerWidth >= 768 ? '10px 20px' : '9px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Agla →</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppTour;
