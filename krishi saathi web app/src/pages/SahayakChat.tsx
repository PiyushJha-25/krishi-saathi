import { useState, useRef, useEffect } from 'react';
import { Send, Mic, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppMode } from '../context/AppContext';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
}

export default function SahayakChat() {
    const navigate = useNavigate();
    const { isOnline } = useAppMode();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const suggestions = isOnline ? [
        "🌾 Wheat price today",
        "🐛 Pest control tips",
        "💊 PM Kisan scheme",
        "🌧️ Best crop for monsoon"
    ] : [
        "🌾 गेहूँ की फसल में यूरिया कब डालें?",
        "🐛 टमाटर में कीड़ा लगने पर क्या करें?",
        "🌧️ आने वाले दिनों में मौसम कैसा रहेगा?"
    ];

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const formatTimestamp = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text, sender: 'user', timestamp: formatTimestamp() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        if (!isOnline) {
            setTimeout(() => {
                let offlineReply = "📱 नेटवर्क उपलब्ध नहीं है। कृपया ऑनलाइन आने पर दोबारा प्रयास करें। (Offline mode: Network unavailable)";

                if (text === "🌾 गेहूँ की फसल में यूरिया कब डालें?") {
                    offlineReply = "गेहूँ में पहली यूरिया बुवाई के 20-25 दिन बाद (पहली सिंचाई पर) और दूसरी यूरिया 40-45 दिन बाद डालनी चाहिए।";
                } else if (text === "🐛 टमाटर में कीड़ा लगने पर क्या करें?") {
                    offlineReply = "टमाटर में फल छेदक इल्ली के लिए नीम तेल (5ml/लीटर पानी) का छिड़काव करें। अधिक प्रकोप होने पर इमामेक्टिन बेंजोएट (Emamectin benzoate) का उपयोग कर सकते हैं।";
                } else if (text === "🌧️ आने वाले दिनों में मौसम कैसा रहेगा?") {
                    offlineReply = "ऑफलाइन मोड में लाइव मौसम की जानकारी उपलब्ध नहीं है। कृपया इंटरनेट चालू करें।";
                }

                const aiMsg: Message = { id: (Date.now() + 1).toString(), text: offlineReply, sender: 'ai', timestamp: formatTimestamp() };
                setMessages(prev => [...prev, aiMsg]);
                setIsTyping(false);
            }, 800);
            return;
        }

        try {
            // Get last 10 messages for context
            const history = messages.slice(-10).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: [{ text: m.text }]
            }));

            const response = await fetch('http://localhost:5000/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, conversationHistory: history })
            });
            const data = await response.json();

            if (data.success) {
                const aiMsg: Message = { id: (Date.now() + 1).toString(), text: data.reply, sender: 'ai', timestamp: formatTimestamp() };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                const errorMsg: Message = { id: (Date.now() + 1).toString(), text: data.reply || "Network issue. Please try again.", sender: 'ai', timestamp: formatTimestamp() };
                setMessages(prev => [...prev, errorMsg]);
            }
        } catch (e) {
            const errorMsg: Message = { id: (Date.now() + 1).toString(), text: "Network issue. Please try again.", sender: 'ai', timestamp: formatTimestamp() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', width: '100%',
            position: 'relative'
        }}>
            <style>
                {`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .dot {
                    width: 6px; height: 6px; background-color: #16a34a; border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .dot:nth-child(1) { animation-delay: -0.32s; }
                .dot:nth-child(2) { animation-delay: -0.16s; }
                `}
            </style>

            {/* HERO Header */}
            <header style={{
                background: "linear-gradient(135deg, rgba(20,83,45,0.92), rgba(21,128,61,0.88)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80') center/cover no-repeat",
                display: 'flex', alignItems: 'center', padding: '40px 24px 48px',
                zIndex: 10, position: 'relative',
                color: 'white',
                boxShadow: '0 4px 12px rgba(22,163,74,0.15)',
                textAlign: 'center',
                flexDirection: 'column'
            }}>
                <button onClick={() => navigate(-1)} style={{
                    position: 'absolute', top: '20px', left: '16px',
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px', width: '40px', height: '40px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)'
                }}>
                    <ChevronLeft size={24} />
                </button>

                <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', marginBottom: '16px', border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                    🤖
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>AI Sahayak</h2>
                        <span style={{
                            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                            color: 'white', fontSize: '11px', fontWeight: 700,
                            padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px',
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}>
                            {isOnline ? 'Online' : 'Offline Mode'}
                        </span>
                    </div>
                    <p style={{ fontSize: '1rem', color: '#bbf7d0', margin: 0, fontWeight: 500 }}>
                        Apni kheti ke baare mein kuch bhi poochein
                    </p>
                </div>
            </header>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg)' }}>
                {messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center', paddingBottom: '40px', animation: 'fadeIn 0.6s' }}>
                        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
                            <div style={{
                                width: '120px', height: '120px', borderRadius: '50%',
                                background: '#f0fdf4', margin: '0 auto 20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '4rem', boxShadow: '0 8px 24px rgba(22,163,74,0.1)'
                            }}>
                                👋
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#14532d', marginBottom: '8px' }}>
                                Namaste, farmer brother!
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
                                I am Sahayak, your AI agriculture assistant. Ask me anything about crops, market prices, or diseases.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
                            {suggestions.map(s => (
                                <button key={s} onClick={() => handleSend(s)} style={{
                                    background: 'white',
                                    border: '1px solid #e2e8f0', borderRadius: '16px',
                                    padding: '12px 20px', fontSize: '14px', color: '#16a34a', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#16a34a';
                                        (e.currentTarget as HTMLButtonElement).style.background = '#f0fdf4';
                                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                                        (e.currentTarget as HTMLButtonElement).style.background = 'white';
                                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            display: 'flex', flexDirection: 'column',
                            gap: '4px'
                        }}>
                            {msg.sender === 'ai' && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', marginLeft: '4px' }}>
                                    🤝 Sahayak
                                </span>
                            )}
                            <div style={{
                                padding: '14px 18px',
                                borderRadius: msg.sender === 'user' ? '20px 20px 0 20px' : '0 20px 20px 20px',
                                background: msg.sender === 'user' ? '#16a34a' : 'white',
                                color: msg.sender === 'user' ? 'white' : '#1e293b',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                lineHeight: 1.6,
                                fontSize: '15px',
                                animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {msg.text}
                            </div>
                            <span style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-muted)',
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                margin: msg.sender === 'user' ? '0 4px 0 0' : '0 0 0 4px',
                                opacity: 0.8
                            }}>
                                {msg.timestamp}
                            </span>
                        </div>
                    ))
                )}

                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', marginLeft: '4px' }}>
                            🤝 Sahayak
                        </span>
                        <div style={{
                            background: 'var(--surface)', padding: '14px 18px',
                            borderRadius: '0 20px 20px 20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid var(--border)',
                            display: 'flex', flexDirection: 'column', gap: '8px',
                            alignItems: 'flex-start'
                        }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <div className="dot" />
                                <div className="dot" />
                                <div className="dot" />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 500 }}>
                                Sahayak सोच रहा है...
                            </span>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} style={{ height: '1px' }} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: '16px 20px',
                display: 'flex', gap: '12px', alignItems: 'center', position: 'sticky', bottom: 0,
                borderTop: '1px solid #e2e8f0',
                background: 'white',
                boxShadow: '0 -4px 12px rgba(0,0,0,0.03)'
            }}>
                <button
                    style={{
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px',
                        width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#16a34a', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}>
                    <Mic size={22} />
                </button>
                <input
                    type="text"
                    placeholder="Ask Sahayak anything..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend(inputValue)}
                    style={{
                        flex: 1, height: '50px', padding: '0 20px', borderRadius: '14px', border: '1px solid #e2e8f0',
                        background: '#f8fafc', color: '#1e293b', fontSize: '15px', outline: 'none',
                        transition: 'all 0.2s'
                    }}
                    onFocus={e => (e.target.style.borderColor = '#16a34a')}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button
                    onClick={() => handleSend(inputValue)}
                    disabled={!inputValue.trim()}
                    style={{
                        background: inputValue.trim() ? '#16a34a' : '#cbd5e1', border: 'none', borderRadius: '14px',
                        width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', cursor: inputValue.trim() ? 'pointer' : 'default', flexShrink: 0,
                        transition: 'all 0.2s',
                        boxShadow: inputValue.trim() ? '0 4px 12px rgba(22,163,74,0.3)' : 'none'
                    }}>
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
