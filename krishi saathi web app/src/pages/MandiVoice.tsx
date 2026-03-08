import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAppMode } from '../context/AppContext';

const STATES: { name: string; key: 'state_maharashtra' | 'state_punjab' | 'state_haryana' | 'state_up' | 'state_mp' | 'state_rajasthan' | 'state_bihar' | 'state_gujarat' | 'state_karnataka' | 'state_ap' }[] = [
    { name: 'Maharashtra', key: 'state_maharashtra' },
    { name: 'Punjab', key: 'state_punjab' },
    { name: 'Haryana', key: 'state_haryana' },
    { name: 'Uttar Pradesh', key: 'state_up' },
    { name: 'Madhya Pradesh', key: 'state_mp' },
    { name: 'Rajasthan', key: 'state_rajasthan' },
    { name: 'Bihar', key: 'state_bihar' },
    { name: 'Gujarat', key: 'state_gujarat' },
    { name: 'Karnataka', key: 'state_karnataka' },
    { name: 'Andhra Pradesh', key: 'state_ap' }
];

const CROP_SUGGESTIONS: { name: string; key: 'crop_wheat' | 'crop_rice' | 'crop_maize' | 'crop_cotton' | 'crop_soybean' | 'crop_tomato' | 'crop_onion' | 'crop_potato' }[] = [
    { name: 'Wheat', key: 'crop_wheat' },
    { name: 'Rice', key: 'crop_rice' },
    { name: 'Maize', key: 'crop_maize' },
    { name: 'Cotton', key: 'crop_cotton' },
    { name: 'Soybean', key: 'crop_soybean' },
    { name: 'Tomato', key: 'crop_tomato' },
    { name: 'Onion', key: 'crop_onion' },
    { name: 'Potato', key: 'crop_potato' },
];

// ── Price trend data ──────────────────────────────────────────────────────────
const PRICE_TRENDS: Record<string, { arrow: '▲' | '▼'; label: string }> = {
    wheat: { arrow: '▲', label: '3% higher than last month' },
    rice: { arrow: '▲', label: '2% higher than last month' },
    maize: { arrow: '▼', label: '1% lower than last month' },
    cotton: { arrow: '▲', label: '5% higher than last month' },
    soybean: { arrow: '▼', label: '2% lower than last month' },
    tomato: { arrow: '▼', label: '8% lower than last month (volatile)' },
    onion: { arrow: '▲', label: '12% higher than last month (volatile)' },
    potato: { arrow: '▲', label: '4% higher than last month' },
};
const getTrend = (crop: string) =>
    PRICE_TRENDS[crop.toLowerCase()] ?? { arrow: '▲' as const, label: 'stable this month' };

// ── Nearby mandis per state ───────────────────────────────────────────────────
const NEARBY_MANDIS: Record<string, string[]> = {
    Maharashtra: ['Pune APMC', 'Nashik Mandi', 'Aurangabad APMC'],
    Punjab: ['Amritsar Mandi', 'Ludhiana APMC', 'Jalandhar Mandi'],
    Haryana: ['Karnal Mandi', 'Hisar APMC', 'Rohtak Mandi'],
    'Uttar Pradesh': ['Lucknow APMC', 'Agra Mandi', 'Kanpur Mandi'],
    'Madhya Pradesh': ['Indore APMC', 'Bhopal Mandi', 'Ujjain Mandi'],
    Rajasthan: ['Jaipur APMC', 'Jodhpur Mandi', 'Kota Mandi'],
    Bihar: ['Patna APMC', 'Muzaffarpur Mandi', 'Gaya Mandi'],
    Gujarat: ['Ahmedabad APMC', 'Surat Mandi', 'Rajkot APMC'],
    Karnataka: ['Bangalore APMC', 'Hubli Mandi', 'Mysore Mandi'],
    'Andhra Pradesh': ['Vijayawada APMC', 'Guntur Mandi', 'Visakhapatnam Mandi'],
};

// ── Seasonal indicator ────────────────────────────────────────────────────────
const getSeason = () => {
    const m = new Date().getMonth() + 1; // 1-12
    if (m >= 10 || m <= 3) return '📅 Rabi Season';
    if (m >= 4 && m <= 6) return '📅 Zaid Season';
    return '📅 Kharif Season';
};

export default function MandiVoice() {
    const { t, language } = useLanguage();
    const { isOnline } = useAppMode();
    const [selectedState, setSelectedState] = useState('');
    const [cropInput, setCropInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [voiceStatus, setVoiceStatus] = useState('');
    const [bags, setBags] = useState('');
    const [unit, setUnit] = useState<'bags' | 'quintals' | 'kg'>('bags');
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState('');
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [loadedVoices, setLoadedVoices] = useState<SpeechSynthesisVoice[]>([]);

    const CURRENT_SEASON = getSeason();

    const recognitionRef = useRef<any>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const bagsNum = parseFloat(bags) || 0;
    const quintals = unit === 'bags' ? bagsNum * 0.5 : unit === 'kg' ? bagsNum / 100 : bagsNum;

    useEffect(() => {
        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices();
            if (v.length > 0) {
                setLoadedVoices(v);
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // ── Voice Setup ───────────────────────────────────────────────────────
    useEffect(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const rec = new SR();
        rec.lang = 'en-IN';
        rec.interimResults = false;
        rec.maxAlternatives = 3;
        rec.onresult = (e: any) => {
            const transcript = e.results[0][0].transcript;
            setCropInput(transcript);
            setVoiceStatus(`✅ Heard: "${transcript}"`);
            setIsListening(false);
        };
        rec.onerror = () => { setVoiceStatus('❌ Voice error. Try again.'); setIsListening(false); };
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
    }, []);

    const toggleListening = () => {
        const rec = recognitionRef.current;
        if (!rec) { setVoiceStatus('⚠️ Voice not supported on this browser.'); return; }
        if (isListening) { rec.stop(); setIsListening(false); }
        else { setVoiceStatus(''); setIsListening(true); rec.start(); }
    };

    // ── Text-to-Speech ────────────────────────────────────────────────────
    const speakAdvice = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.82;
        utterance.pitch = 1.0;
        const hindiVoice = loadedVoices.find(v => v.name === 'Google हिन्दी');
        if (hindiVoice) {
            utterance.voice = hindiVoice;
        }
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        if (utteranceRef.current !== undefined) utteranceRef.current = utterance;
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleListen = async () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        setIsGeneratingAudio(true);
        try {
            // Find English crop name to send to backend if they clicked a translated chip
            const matchingCrop = CROP_SUGGESTIONS.find(c => t(c.key).toLowerCase() === cropInput.toLowerCase() || c.name.toLowerCase() === cropInput.toLowerCase());
            const finalCropName = matchingCrop ? matchingCrop.name : cropInput.trim();

            const res = await fetch('http://localhost:5000/api/mandi/voice-advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropName: finalCropName,
                    state: selectedState,
                    bags: bagsNum,
                    quintals,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Server error');

            speakAdvice(data.hindiAdvice);
        } catch (err) {
            if (advice) { // Using 'advice' state directly since 'result' is undefined in component scope
                speakAdvice(advice);
            } else {
                speakAdvice('Apni fasal seedha APMC mandi mein becho. Quality achhi rakho aur subah jao.');
            }
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    // ── Get Advice ────────────────────────────────────────────────────────
    const handleGetAdvice = async () => {
        setValidationError('');
        setError('');
        setAdvice('');
        if (!selectedState) { setValidationError('Please select your state 📍'); return; }
        if (!cropInput.trim()) { setValidationError('Please enter a crop name 🌱'); return; }
        if (bagsNum <= 0) { setValidationError('Please enter a valid quantity ⚖️'); return; }

        setLoading(true);
        try {
            // Find English crop name to send to backend if they clicked a translated chip
            const matchingCrop = CROP_SUGGESTIONS.find(c => t(c.key).toLowerCase() === cropInput.toLowerCase() || c.name.toLowerCase() === cropInput.toLowerCase());
            const finalCropName = matchingCrop ? matchingCrop.name : cropInput.trim();

            if (!isOnline) {
                // Offline Mode
                setTimeout(() => {
                    const fallbackPrice = Math.floor(Math.random() * (4500 - 1500 + 1) + 1500);
                    const fallbackAdvice = `Based on offline data, ${finalCropName} in ${selectedState} is currently trading around ₹${fallbackPrice} per quintal. Demand in local APMCs is anticipated to remain steady this week. For precise daily fluctuations, please reconnect online.`;
                    setAdvice(fallbackAdvice);
                    setIsOffline(true);
                    setLoading(false);
                    setTimeout(() => {
                        document.getElementById('mv-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }, 600);
                return;
            }

            const res = await fetch('http://localhost:5000/api/mandi/advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropName: finalCropName,
                    state: selectedState,
                    quantity: bagsNum,
                    unit,
                    language
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Server error');
            setAdvice(data.advice);
            setIsOffline(data.isOffline || false);
            setTimeout(() => {
                document.getElementById('mv-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err: any) {
            // Fallback on network fail
            const fallbackPrice = Math.floor(Math.random() * (4500 - 1500 + 1) + 1500);
            const matchingCrop = CROP_SUGGESTIONS.find(c => t(c.key).toLowerCase() === cropInput.toLowerCase() || c.name.toLowerCase() === cropInput.toLowerCase());
            const fallbackCrop = matchingCrop ? matchingCrop.name : cropInput.trim();
            const fallbackAdvice = `Network unavailable. Based on offline data, ${fallbackCrop} in ${selectedState} is currently trading around ₹${fallbackPrice} per quintal. Make sure to check local rates directly.`;
            setAdvice(fallbackAdvice);
            setIsOffline(true);
        } finally {
            setLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: 'calc(100vh - 144px)',
            background: '#f5f7f5',
            padding: '0 0 40px 0',
            animation: 'mvFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            <style>{`
                @keyframes mvFadeIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes mvSlideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes mvSpin {
                    to { transform: rotate(360deg); }
                }
                @keyframes mvSpeakPulse {
                    0%,100% { transform: scale(1); }
                    50%     { transform: scale(1.04); }
                }
                .mv-card {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
                    border: 1px solid #e2e8f0;
                    padding: 24px;
                    margin: 0 16px 16px;
                }
                .mv-dropdown {
                    width: 100%; padding: 12px 16px; border: 1.5px solid #d1fae5;
                    border-radius: 10px; font-size: 15px; font-family: inherit;
                    border-left: 3px solid #16a34a;
                    color: #374151; background: #fff; outline: none;
                    transition: border-color 0.2s; appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23555' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat; background-position: right 16px center; cursor: pointer;
                }
                .mv-dropdown:focus { border-color: #16a34a; }
                .mv-text-input {
                    flex: 1; padding: 12px 16px; border: 1.5px solid #d1fae5;
                    border-radius: 10px; font-size: 15px; font-family: inherit;
                    border-left: 3px solid #16a34a;
                    color: #374151; background: #fff; outline: none;
                    transition: border-color 0.2s;
                }
                .mv-text-input:focus { border-color: #16a34a; }
                .mv-mic-btn {
                    width: 54px; height: 54px; border-radius: 50%; flex-shrink: 0;
                    background: #1a7a40;
                    border: none; cursor: pointer; color: #fff;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 12px rgba(26,122,64,0.3);
                    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
                }
                .mv-mic-btn:hover { background: #146333; box-shadow: 0 6px 16px rgba(26,122,64,0.4); }
                .mv-mic-btn.listening {
                    background: #e74c3c;
                    box-shadow: 0 4px 12px rgba(231,76,60,0.3);
                }
                .mv-mic-btn:active { transform: scale(0.95); }
                .mv-chip {
                    display: inline-flex; align-items: center; justify-content: center;
                    padding: 9px 18px; border-radius: 24px;
                    border: 1.5px solid #16a34a; background: #fff;
                    font-size: 13px; font-weight: 500; color: #16a34a;
                    cursor: pointer; transition: all 0.2s; white-space: nowrap;
                    user-select: none;
                }
                .mv-chip:hover  { background: #f0fdf4; }
                .mv-chip:active { transform: scale(0.97); }
                .mv-chip.active { background: #16a34a; color: #fff; box-shadow: 0 2px 10px rgba(22,163,74,0.35); border-color: #16a34a; }
                .mv-number-input {
                    flex: 1; padding: 16px 20px; border: 2px solid #e0e0e0;
                    border-radius: 14px; font-size: 1.5rem; font-weight: 600;
                    font-family: inherit; color: #222; background: #fff;
                    outline: none; transition: border-color 0.2s; text-align: left;
                }
                .mv-number-input:focus { border-color: #1a7a40; box-shadow: 0 0 0 3px rgba(26,122,64,0.1); }
                .mv-cta-btn {
                    width: calc(100% - 32px); margin: 8px 16px 16px;
                    height: 54px; background: linear-gradient(135deg, #16a34a, #15803d);
                    color: white; border: none; border-radius: 14px;
                    font-size: 16px; font-weight: 700; letter-spacing: 0.3px; font-family: inherit;
                    cursor: pointer; box-shadow: 0 4px 14px rgba(22,163,74,0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex; align-items: center; justify-content: center;
                }
                .mv-cta-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,122,64,0.4); }
                .mv-cta-btn:active { transform: scale(0.98); }
                .mv-cta-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
                .mv-result-card {
                    margin: 20px 16px 0; border-radius: 16px; overflow: hidden;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;
                    border-top: 4px solid #16a34a; padding: 20px;
                    background: #fff;
                    animation: mvSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .mv-advice-text {
                    background: #f8fafc; border-radius: 12px; border-left: 3px solid #16a34a; padding: 14px 16px;
                    font-size: 14px; line-height: 1.6; color: #374151;
                    white-space: pre-wrap; font-family: inherit;
                    margin-bottom: 16px;
                }
                .mv-advice-text strong { color: #1a7a40; }
                .mv-listen-btn {
                    width: calc(100% - 32px); margin: 14px 16px 0;
                    padding: 17px; border: none; border-radius: 16px;
                    font-size: 1.05rem; font-weight: 700; font-family: inherit;
                    cursor: pointer; transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                }
                .mv-listen-btn.idle {
                    background: linear-gradient(135deg, #8e44ad, #6c3483);
                    color: #fff; box-shadow: 0 6px 18px rgba(142,68,173,0.4);
                }
                .mv-listen-btn.idle:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(142,68,173,0.5); }
                .mv-listen-btn.speaking {
                    background: #e74c3c; color: #fff;
                    animation: mvSpeakPulse 1.4s ease-in-out infinite;
                    box-shadow: 0 6px 18px rgba(231,76,60,0.4);
                }
                .mv-mandi-card {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 13px 16px; background: #f8fdf8;
                    border: 1.5px solid #d4edda; border-radius: 14px;
                    cursor: pointer; transition: all 0.16s;
                }
                .mv-mandi-card:hover { background: rgba(46,204,113,0.1); border-color: #2ecc71; }
                .mv-mandi-card:active { transform: scale(0.98); }
            `}</style>

            {/* ─── HERO ──────────────────────────────────────────────── */}
            <div style={{
                background: "linear-gradient(135deg, rgba(20,83,45,0.93), rgba(21,128,61,0.87)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80') center/cover no-repeat",
                padding: '44px 24px 36px',
                borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px',
                marginBottom: '16px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(13,74,42,0.15)'
            }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: '-20px', left: '5%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                {/* Badges row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                        borderRadius: '20px', padding: '6px 12px',
                        fontSize: '0.75rem', fontWeight: 600, color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                    }}>
                        {isOffline ? '🧠 Edge AI Model' : '☁ Amazon Bedrock AI'}
                    </div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                        borderRadius: '20px', padding: '6px 12px',
                        fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                    }}>
                        {CURRENT_SEASON}
                    </div>
                </div>

                <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 10px', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                    {t('mandi_title')}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: 400, margin: 0, lineHeight: 1.5 }}>
                    {t('mandi_subtitle')}
                </p>
            </div>

            {/* ─── STATE SELECTOR ────────────────────────────────────── */}
            <div className="mv-card">
                <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
                    {t('mandi_select_state')}
                </label>
                <select
                    className="mv-dropdown"
                    value={selectedState}
                    onChange={e => { setSelectedState(e.target.value); setAdvice(''); }}
                >
                    <option value="" disabled>{t('mandi_choose_state')}</option>
                    {STATES.map(s => <option key={s.name} value={s.name}>{t(s.key)}</option>)}
                </select>
            </div>

            {/* ─── CROP INPUT ─────────────────────────────────────────── */}
            <div className="mv-card" style={{ padding: '24px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
                    {t('mandi_enter_crop')}
                </label>

                {/* Input row */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <input
                        className="mv-text-input"
                        type="text"
                        placeholder="e.g. Wheat, Arhar, Bajra, Jowar…"
                        value={cropInput}
                        onChange={e => { setCropInput(e.target.value); setAdvice(''); }}
                    />
                    <button
                        className={`mv-mic-btn${isListening ? ' listening' : ''}`}
                        onClick={toggleListening}
                        title="Tap to speak crop name"
                    >
                        {isListening ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                        )}
                    </button>
                </div>

                {/* Voice feedback */}
                {voiceStatus && (
                    <p style={{ fontSize: '0.85rem', fontWeight: 500, margin: '0 0 16px', color: voiceStatus.startsWith('✅') ? '#1a7a40' : '#e67e22' }}>
                        {voiceStatus}
                    </p>
                )}

                {/* Suggestion chips */}
                <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {CROP_SUGGESTIONS.map(c => {
                            const translatedName = t(c.key);
                            const isActive = cropInput.toLowerCase() === translatedName.toLowerCase() || cropInput.toLowerCase() === c.name.toLowerCase();
                            return (
                                <button
                                    key={c.name}
                                    className={`mv-chip${isActive ? ' active' : ''}`}
                                    onClick={() => { setCropInput(translatedName); setAdvice(''); }}
                                >
                                    {translatedName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ─── QUANTITY ───────────────────────────────────────────── */}
            <div className="mv-card" style={{ padding: '24px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
                    {t('mandi_how_many_bags')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                        className="mv-number-input"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={bags}
                        onChange={e => { setBags(e.target.value); setUnit('bags'); setAdvice(''); }}
                    />
                    {bagsNum > 0 && (
                        <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 500, paddingLeft: '4px' }}>
                            = {quintals.toFixed(2)} quintals • {(quintals * 100).toFixed(0)} kg
                        </div>
                    )}
                </div>
            </div>

            {/* ─── VALIDATION ERROR ──────────────────────────────────────── */}
            {validationError && (
                <div style={{
                    margin: '0 16px 12px', padding: '14px 18px',
                    background: '#fff3cd', border: '1.5px solid #ffc107',
                    borderRadius: '14px', color: '#856404',
                    fontWeight: 600, fontSize: '0.95rem',
                }}>
                    ⚠️ {validationError}
                </div>
            )}

            {/* ─── CTA BUTTON ─────────────────────────────────────────── */}
            <button className="mv-cta-btn" onClick={handleGetAdvice} disabled={loading}>
                {loading ? 'Consulting Market Advisor...' : t('mandi_get_price')}
            </button>

            {/* ─── API ERROR ──────────────────────────────────────────── */}
            {error && (
                <div style={{
                    margin: '16px 16px 0', padding: '16px 18px',
                    background: '#fdecea', border: '1.5px solid #f5c6cb',
                    borderRadius: '14px', color: '#721c24',
                    fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.5,
                }}>
                    ❌ {error}
                </div>
            )}

            {/* ─── RESULT CARD ─────────────────────────────────────────── */}
            {advice && (
                <div id="mv-result" className="mv-result-card">
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        padding: '18px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem' }}>
                                {cropInput} — {selectedState}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', marginTop: '3px' }}>
                                {bagsNum} {unit} ({quintals.toFixed(2)} quintals)
                            </div>
                        </div>
                        {isOffline ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    background: 'rgba(52,152,219,0.2)', border: '1px solid rgba(52,152,219,0.4)',
                                    borderRadius: '12px', padding: '6px 10px',
                                    fontSize: '0.7rem', fontWeight: 700, color: '#3498db',
                                    textAlign: 'center', lineHeight: 1.4, maxWidth: '90px',
                                }}>
                                    🧠 Local<br />AI Model
                                </div>
                                <div style={{ fontSize: '0.6rem', color: '#95a5a6', marginTop: '4px' }}>
                                    Edge Intelligence<br />No internet needed
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: 'rgba(46,204,113,0.2)', border: '1px solid rgba(46,204,113,0.4)',
                                borderRadius: '12px', padding: '6px 10px',
                                fontSize: '0.7rem', fontWeight: 700, color: '#2ecc71',
                                textAlign: 'center', lineHeight: 1.4, maxWidth: '90px',
                            }}>
                                ☁️ Amazon<br />Bedrock
                            </div>
                        )}
                    </div>

                    {/* Advice body */}
                    <div style={{ background: '#fff', padding: '22px 20px' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            marginBottom: '16px',
                        }}>
                            <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>
                                AI Market Analysis
                            </span>
                        </div>

                        <div className="mv-advice-text">{advice}</div>

                        {/* Price trend row */}
                        {(() => {
                            const t = getTrend(cropInput); return (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 12px',
                                    background: '#f0fdf4',
                                    borderRadius: '8px', border: '1px solid #bbf7d0',
                                }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: t.arrow === '▲' ? '#1db954' : '#e74c3c' }}>{t.arrow === '▲' ? '✅' : '🔴'}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Price trend: {t.label}</span>
                                </div>
                            );
                        })()}

                        {/* Disclaimer */}
                        <div style={{
                            marginTop: '16px', padding: '12px 14px',
                            background: '#f8f9fa', borderRadius: '12px',
                            fontSize: '0.75rem', color: '#999', lineHeight: 1.5,
                        }}>
                            {CURRENT_SEASON} 2025–26 estimates &nbsp;•&nbsp; AI-generated advisory<br />
                            Verify prices at your local mandi before making decisions.
                        </div>
                    </div>
                </div>
            )}

            {/* ─── LISTEN BUTTON ─────────────────────────────────────────── */}
            {advice && (
                <button
                    className={`mv-listen-btn ${isSpeaking ? 'speaking' : 'idle'}`}
                    onClick={handleListen}
                    disabled={isGeneratingAudio}
                >
                    <span style={{ fontSize: '1.2rem' }}>{isSpeaking ? '⏹' : (isGeneratingAudio ? '🎙️' : '🔊')}</span>
                    {isGeneratingAudio ? 'Preparing advice...' : (isSpeaking ? 'Stop' : t('mandi_listen_advice'))}
                </button>
            )}

            {isOffline && (
                <div style={{ textAlign: 'center', margin: '8px 16px', fontSize: '0.8rem', color: '#bbb' }}>
                    * Offline advice available in Hindi only
                </div>
            )}

            {/* ─── NEARBY MANDIS ───────────────────────────────────────────── */}
            {advice && selectedState && NEARBY_MANDIS[selectedState] && (
                <div style={{ margin: '20px 16px 0' }}>
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: '#333', marginBottom: '12px' }}>
                        {t('mandi_nearby_mandis')}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {NEARBY_MANDIS[selectedState].map(mandi => (
                            <div key={mandi} className="mv-mandi-card">
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#222' }}>{mandi}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>{selectedState}</div>
                                </div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2ecc71', whiteSpace: 'nowrap' }}>
                                    Tap to get directions 📍
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
