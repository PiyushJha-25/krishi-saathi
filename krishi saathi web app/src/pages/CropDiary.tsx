import { useState, useEffect, useRef } from 'react';
import { useAppMode } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { getDiaryEntries, saveDiaryEntry, updateDiaryEntry, deleteDiaryEntry, getAIAdvice } from '../services/diaryApiService';
import type { DiaryEntry } from '../services/diaryApiService';
import { Brain, Loader2, Mic, MicOff, Send, Trash2, Edit2, X, Check, History } from 'lucide-react';

export default function CropDiary() {
    const { isOnline, toggleOnlineMode } = useAppMode();
    const { t } = useLanguage();
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [advice, setAdvice] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Journal Input State
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    // Expanded/Edit State
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [editDate, setEditDate] = useState('');

    const recognitionRef = useRef<any>(null);

    const generateSmartOfflineAdvice = (diaryEntries: DiaryEntry[]) => {
        if (!diaryEntries || diaryEntries.length === 0) {
            return "Tap the mic or type below to record today's farm activity to unlock insights 🌾";
        }

        const allText = diaryEntries.map(e => e.entry_text.toLowerCase()).join(' ');

        let offlineAdvice = "🌾 Seasonal Farm Tips:\n- Track your expenses carefully to understand your profit margins.\n- Ensure soil remains healthy by rotating crops regularly.\n- Keep an eye on local weather forecasts to time your irrigation perfectly! 💧";

        if (allText.includes('wheat') || allText.includes('गेहूं')) {
            offlineAdvice = "🌾 Wheat Insights:\n- It's crucial to time your watering right during the tillering stage.\n- Check for yellow rust and apply preventative fungicides if needed.\n- A top dressing of Urea (₹300/bag) could boost your yield right now! 🚜";
        } else if (allText.includes('rice') || allText.includes('धान')) {
            offlineAdvice = "🌾 Rice Insights:\n- Maintain correct water levels (about 5cm) for optimal growth. 💧\n- Watch out for the Brown Planthopper; early detection saves crops!\n- Ensure timely Nitrogen application for better grain filling. 🍚";
        } else if (allText.includes('tomato') || allText.includes('टमाटर')) {
            offlineAdvice = "🍅 Tomato Insights:\n- Consistent watering is key to prevent blossom end rot.\n- Use proper staking to keep the fruits off the ground and avoid soil-borne diseases.\n- Keep an eye out for early blight and use copper-based sprays (₹250/bottle). 🌿";
        } else if (allText.includes('cotton') || allText.includes('कपास')) {
            offlineAdvice = "☁️ Cotton Insights:\n- Drip irrigation works wonders for cotton, saving water and improving yields. 💧\n- Monitor carefully for pink bollworm; use pheromone traps (₹40/trap) for early detection.\n- Avoid excessive vegetative growth by managing water carefully! 🚜";
        }

        return offlineAdvice;
    };

    const fetchData = async () => {
        setIsLoading(true);
        const fetchedEntries = await getDiaryEntries();
        setEntries(fetchedEntries);

        if (isOnline) {
            const fetchedAdvice = await getAIAdvice(true);
            setAdvice(fetchedAdvice);
        } else {
            setAdvice(generateSmartOfflineAdvice(fetchedEntries));
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [isOnline]);

    // Setup Web Speech API
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        setInputText(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + finalTranscript);
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setIsRecording(false);
                };

                recognition.onend = () => {
                    setIsRecording(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleSend = async () => {
        if (!inputText || inputText.trim() === '') return;
        setIsSaving(true);

        try {
            await saveDiaryEntry({
                entry_text: inputText.trim(),
                date: new Date().toISOString().split('T')[0]
            });

            // After saving, call getDiaryEntries() to refresh the list
            const updatedEntries = await getDiaryEntries();
            setEntries(updatedEntries);

            // Also refresh overall data including advice
            await fetchData();

            // Clear the input box after sending
            setInputText('');
        } catch (error) {
            console.error("Failed to save entry", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm(t('confirm_delete'))) {
            const success = await deleteDiaryEntry(id);
            if (success) {
                await fetchData();
                setExpandedId(null);
            }
        }
    };

    const startEdit = (entry: DiaryEntry) => {
        setEditingId(entry.id!);
        setEditText(entry.entry_text);
        setEditDate(entry.date);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
        setEditDate('');
    };

    const saveEdit = async (id: number) => {
        if (!editText.trim()) return;
        const success = await updateDiaryEntry(id, editText.trim(), editDate);
        if (success) {
            await fetchData();
            setEditingId(null);
        }
    };

    const formatDateStr = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const todaysEntries = (entries || []).filter(entry => entry.date === new Date().toISOString().split('T')[0]);

    // Group all entries for the history sidebar
    const groupedAllEntries = (entries || []).reduce((acc, entry) => {
        if (!entry.date) return acc;
        if (!acc[entry.date]) acc[entry.date] = [];
        acc[entry.date].push(entry);
        return acc;
    }, {} as Record<string, DiaryEntry[]>);

    const sortedAllDates = Object.keys(groupedAllEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const renderEditBlock = (entry: DiaryEntry) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--primary)', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={(e) => { e.stopPropagation(); cancelEdit(); }} style={{ padding: '8px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <X size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); saveEdit(entry.id!); }} style={{ padding: '8px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Check size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 144px)', /* 144px accounts for typical header + bottom nav */
            position: 'relative',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            overflow: 'hidden', /* Helps contain absolute elements if needed */
        }}>
            {/* --- SIDEBAR OVERLAY --- */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, backdropFilter: 'blur(2px)' }}
                />
            )}

            {/* --- SIDEBAR PANEL --- */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: isSidebarOpen ? 0 : '-100%',
                bottom: 0,
                width: '320px',
                maxWidth: '85vw',
                background: 'var(--background)',
                zIndex: 1001,
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSidebarOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--border)'
            }}>
                <div style={{ padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History size={22} /> {t('history_sidebar_title')}
                    </h3>
                    <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {sortedAllDates.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                            <History size={48} style={{ opacity: 0.2, margin: '0 auto 12px auto' }} />
                            <div>{t('history_sidebar_empty')}</div>
                        </div>
                    ) : (
                        sortedAllDates.map(date => (
                            <div key={date}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {formatDateStr(date)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {groupedAllEntries[date].map(entry => (
                                        <div key={entry.id} style={{
                                            background: 'var(--surface)',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            border: '1px solid var(--border)',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                        }}>
                                            {editingId === entry.id ? (
                                                renderEditBlock(entry)
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <div style={{
                                                            color: 'var(--text)',
                                                            fontSize: '0.95rem',
                                                            lineHeight: 1.5,
                                                            wordBreak: 'break-word',
                                                        }}>
                                                            {expandedId === entry.id ? entry.entry_text :
                                                                (entry.entry_text.length > 30 ? entry.entry_text.substring(0, 30) + '...' : entry.entry_text)
                                                            }
                                                        </div>
                                                        {entry.entry_text.length > 30 && expandedId !== entry.id && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setExpandedId(entry.id!); }}
                                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', padding: '4px 0', cursor: 'pointer', marginTop: '4px', fontWeight: 500 }}
                                                            >
                                                                {t('read_more')}
                                                            </button>
                                                        )}
                                                        {expandedId === entry.id && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', padding: '4px 0', cursor: 'pointer', marginTop: '4px', fontWeight: 500 }}
                                                            >
                                                                {t('show_less')}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                        <button onClick={(e) => { e.stopPropagation(); startEdit(entry); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id!); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                gap: '24px',
                animation: 'fadeIn 0.3s ease-out',
                width: '100%',
                flex: 1
            }}>
                {/* Header with History Icon and Toggle */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                    background: "linear-gradient(135deg, rgba(20,83,45,0.92), rgba(21,128,61,0.88)), url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80') center/cover no-repeat",
                    padding: '32px 24px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(22,163,74,0.15)'
                }}>
                    <div>
                        <h2 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '1.8rem', fontWeight: 700 }}>{t('journal_title')}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.95rem' }}>{t('journal_sub')}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* TOGGLE SWITCH */}
                        <div
                            onClick={toggleOnlineMode}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: isOnline ? '#dcfce7' : '#f3f4f6',
                                borderRadius: '24px',
                                padding: '4px 6px',
                                cursor: 'pointer',
                                border: `1px solid ${isOnline ? '#bbf7d0' : '#e5e7eb'}`,
                                transition: 'all 0.3s ease',
                                width: '150px',
                                height: '36px',
                                justifyContent: isOnline ? 'flex-start' : 'flex-end',
                                position: 'relative'
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                left: isOnline ? '12px' : 'auto',
                                right: isOnline ? 'auto' : '12px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: isOnline ? '#16a34a' : '#6b7280',
                                zIndex: 1,
                                transition: 'all 0.3s ease'
                            }}>
                                {isOnline ? t('ai_mode_live') : t('ai_mode_offline')}
                            </span>

                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2,
                                transform: isOnline ? 'translateX(110px)' : 'translateX(-110px)'
                            }}>
                                {isOnline ? '🟢' : '⚫'}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            style={{
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                padding: '12px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                color: 'var(--primary)',
                                fontWeight: 600,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                            className="history-btn"
                        >
                            <History size={20} />
                            <span style={{ display: 'inline-block', fontSize: '1.05rem' }}>{t('history_btn')}</span>
                        </button>
                    </div>
                </div>

                {/* AI Advice Card */}
                <div style={{
                    background: '#fafffe',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #16a34a',
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    {isOnline ? (
                        <div style={{ position: 'absolute', top: 0, right: 0, background: '#16a34a', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Powered by AI 🟢
                        </div>
                    ) : (
                        <div style={{ position: 'absolute', top: 0, right: 0, background: '#6B7280', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Offline Intelligence ⚫
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: isOnline ? '8px' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ background: 'white', padding: '8px', borderRadius: '12px', color: 'var(--primary-dark)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <Brain size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{isOnline ? t('live_ai_advice') : t('offline_ai_advice')}</h3>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '12px',
                        color: '#374151',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        fontWeight: 400,
                        whiteSpace: 'pre-wrap'
                    }}>
                        {isLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                                <Loader2 size={16} className="animate-spin" />
                                {t('loading_insights')}
                            </div>
                        ) : (
                            advice || t('no_insights')
                        )}
                    </div>
                </div>

                {/* Chat Container */}
                <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    border: '1px solid #e2e8f0',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1
                }}>
                    {/* Today's Entry List (Chat Bubbles) */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        marginBottom: '24px',
                        overflowY: 'auto'
                    }}>
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>{t('loading_chat')}</div>
                        ) : (
                            <>
                                <div style={{ textAlign: 'center', margin: '8px 0 16px 0' }}>
                                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                {todaysEntries.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&q=80" alt="Farmer" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dcfce7' }} />
                                        <span style={{ fontSize: '15px', color: '#64748b', textAlign: 'center' }}>Start recording today's farm activities</span>
                                    </div>
                                ) : (
                                    todaysEntries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            style={{
                                                padding: '16px',
                                                background: '#f8fafc',
                                                borderRadius: '16px',
                                                borderBottomRightRadius: '4px',
                                                alignSelf: 'flex-end',
                                                maxWidth: '90%',
                                                minWidth: '60%',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            }}
                                        >
                                            {editingId === entry.id ? (
                                                renderEditBlock(entry)
                                            ) : (
                                                <>
                                                    <div style={{ color: '#374151', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                                        {expandedId === entry.id ? entry.entry_text : (
                                                            entry.entry_text.length > 100 ? `${entry.entry_text.substring(0, 100)}...` : entry.entry_text
                                                        )}
                                                        {entry.entry_text.length > 100 && expandedId !== entry.id && (
                                                            <span
                                                                onClick={() => setExpandedId(entry.id!)}
                                                                style={{ color: 'var(--primary)', cursor: 'pointer', marginLeft: '4px', fontWeight: 500 }}
                                                            >
                                                                {t('read_more')}
                                                            </span>
                                                        )}
                                                        {expandedId === entry.id && (
                                                            <span
                                                                onClick={() => setExpandedId(null)}
                                                                style={{ color: 'var(--primary)', cursor: 'pointer', marginLeft: '4px', fontWeight: 500 }}
                                                            >
                                                                {t('show_less')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                            {formatDateStr(entry.date)}
                                                        </span>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => startEdit(entry)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button onClick={() => handleDelete(entry.id!)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>

                    {/* Chat Input Area */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        background: 'transparent',
                        padding: '0',
                        transition: 'all 0.2s',
                        alignItems: 'flex-end',
                    }}>
                        <button
                            onClick={toggleRecording}
                            style={{
                                background: isRecording ? '#ef4444' : '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '52px',
                                height: '52px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                                boxShadow: isRecording ? '0 4px 14px rgba(239, 68, 68, 0.4)' : '0 4px 14px rgba(22, 163, 74, 0.4)'
                            }}
                        >
                            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isRecording ? t('input_placeholder_listening') : t('input_placeholder_default')}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#16a34a';
                                e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                            }}
                            style={{
                                flex: 1,
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '14px',
                                background: 'white',
                                resize: 'none',
                                minHeight: '52px',
                                maxHeight: '120px',
                                padding: '14px 16px',
                                fontFamily: 'inherit',
                                fontSize: '14px',
                                outline: 'none',
                                color: '#374151',
                                lineHeight: '1.6',
                                transition: 'all 0.2s',
                                width: '100%'
                            }}
                            rows={inputText.split('\n').length > 1 ? Math.min(inputText.split('\n').length, 5) : 1}
                        />

                        <button
                            disabled={isSaving || inputText.trim() === ''}
                            onClick={handleSend}
                            style={{
                                background: (inputText.trim() !== '' && !isSaving) ? '#16a34a' : '#cbd5e1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '14px',
                                width: '52px',
                                height: '52px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: (inputText.trim() !== '' && !isSaving) ? 'pointer' : 'default',
                                opacity: isSaving ? 0.7 : 1,
                                flexShrink: 0,
                                transition: 'all 0.2s',
                                boxShadow: (inputText.trim() !== '' && !isSaving) ? '0 4px 14px rgba(22, 163, 74, 0.4)' : 'none'
                            }}
                        >
                            {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
