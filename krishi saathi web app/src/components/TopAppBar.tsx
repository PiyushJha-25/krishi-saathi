import { useState, useRef, useEffect } from 'react';
import { Globe, Leaf, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TopAppBar() {
    const [isLangOpen, setIsLangOpen] = useState(false);
    const { language: selectedLang, setLanguage: setSelectedLang } = useLanguage();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'te', name: 'తెలుగు' },
        { code: 'kn', name: 'ಕನ್ನಡ' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'mr', name: 'मराठी' },
        { code: 'bn', name: 'বাংলা' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ' }
    ] as const;

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="glass" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            zIndex: 50
        }}>
            <div className="top-bar-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Leaf size={20} />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>Krishi-Saathi</h1>
                </div>

                {/* Language Switcher */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        data-tour="language"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            transition: 'all 0.2s',
                            boxShadow: 'var(--shadow)'
                        }}
                    >
                        <Globe size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedLang === 'English' ? 'EN' : selectedLang.substring(0, 2)}</span>
                        <ChevronDown size={16} color="var(--text-muted)" />
                    </button>

                    {isLangOpen && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            background: 'var(--surface)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            padding: '8px',
                            width: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            zIndex: 100,
                            border: '1px solid var(--border)',
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            {languages.map((lang: any) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setSelectedLang(lang.name);
                                        setIsLangOpen(false);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 12px',
                                        background: selectedLang === lang.name ? 'rgba(46, 204, 113, 0.1)' : 'transparent',
                                        color: selectedLang === lang.name ? 'var(--primary-dark)' : 'var(--text)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontSize: '1rem',
                                        fontWeight: selectedLang === lang.name ? 600 : 400,
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {lang.name}
                                    {selectedLang === lang.name && <Check size={16} color="var(--primary)" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
