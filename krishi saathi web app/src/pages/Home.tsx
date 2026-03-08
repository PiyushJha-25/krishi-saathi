import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, CloudSun, Bell, IndianRupee, X, Scan, BookText, Bug, Moon, Recycle, Cloud, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppMode } from '../context/AppContext';

export default function Home() {
    const navigate = useNavigate();
    const [isFeaturesOpen, setFeaturesOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const { t } = useLanguage();
    const { isOnline, toggleOnlineMode } = useAppMode();

    const features = [
        {
            title: t('card_scan'),
            subtitle: t('card_scan_sub'),
            bgImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
            route: '/scan',
            badge: t('live'),
            badgeColor: '#16a34a',
            icon: null
        },
        {
            title: t('card_advisory'),
            subtitle: t('card_advisory_sub'),
            bgImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
            route: '/mandi-voice',
            badge: t('live'),
            badgeColor: '#16a34a',
            icon: (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', color: '#facc15' }}>
                    <Mic size={20} />
                    <IndianRupee size={20} />
                </div>
            )
        },
        {
            title: t('card_diary'),
            subtitle: t('card_diary_sub'),
            bgImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
            route: '/diary',
            badge: t('live'),
            badgeColor: '#16a34a',
            icon: null
        }
    ];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 144px)',
            animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            width: '100%'
        }}>
            <style>
                {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(46, 204, 113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
        }
        .feature-card {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (hover: hover) and (pointer: fine) {
          .feature-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 16px 32px rgba(0,0,0,0.15);
          }
        }
        .feature-card:active {
          transform: scale(0.97);
        }
        .fab {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s;
          animation: pulseGlow 2.5s infinite;
        }
        .fab:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(46, 204, 113, 0.5);
        }
        .fab:active {
          transform: translateY(2px) scale(0.95);
          background-color: var(--primary-dark);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .coming-soon-card-clickable:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        `}
            </style>

            {/* HEADER SECTION */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
            }}>
                {/* Left: Avatar & Greeting */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                        onClick={() => setFeaturesOpen(true)}
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(46,204,113,0.3), 0 2px 8px rgba(0,0,0,0.1)',
                            border: '2px solid rgba(255, 255, 255, 0.9)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            flexShrink: 0,
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                        {!imgError ? (
                            <img
                                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100&q=80"
                                alt="Farmer Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <span>{t('greeting').split(/[,\s]+/)[1]?.[0] || 'A'}</span>
                        )}
                    </div>
                    <div>
                        <h2 style={{ color: 'var(--text)', fontWeight: '800', fontSize: '1.75rem', marginBottom: '2px', letterSpacing: '-0.5px' }}>
                            {t('greeting')}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '400' }}>
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                {/* Right: Toggle, Weather & Notifications */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    {/* AI Mode Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {t('ai_mode_toggle')}
                        </span>
                        <div
                            onClick={toggleOnlineMode}
                            data-tour="offline-toggle"
                            style={{
                                width: '48px',
                                height: '26px',
                                borderRadius: '13px',
                                background: isOnline ? 'var(--primary)' : 'var(--text-muted)',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.3s',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                top: '2px',
                                left: isOnline ? '24px' : '2px',
                                transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>

                    {/* Weather & Bell */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'var(--surface)',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            boxShadow: 'var(--shadow)',
                            color: 'var(--text)',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            <CloudSun size={18} color="var(--secondary)" />
                            <span>28°C</span>
                        </div>
                        <button style={{
                            background: 'var(--surface)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow)',
                            cursor: 'pointer',
                            color: 'var(--text)'
                        }}>
                            <Bell size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* STATUS SECTION */}
            <div style={{ marginBottom: '32px', paddingLeft: '72px' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isOnline ? 'rgba(46, 204, 113, 0.15)' : 'rgba(150, 150, 150, 0.15)',
                    color: isOnline ? 'var(--primary-dark)' : 'var(--text-muted)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    boxShadow: isOnline ? '0 2px 8px rgba(46, 204, 113, 0.2)' : 'none',
                    transition: 'all 0.3s ease'
                }}>
                    {isOnline ? (
                        <>
                            <Cloud size={16} />
                            {t('ai_mode_live')}
                        </>
                    ) : (
                        <>
                            <Cpu size={16} />
                            {t('ai_mode_offline')}
                        </>
                    )}
                </div>
            </div>

            {/* Feature Grid */}
            <div className="feature-grid">
                {features.map((item, index) => (
                    <div
                        key={index}
                        className="feature-card"
                        onClick={() => item.route !== '#' && navigate(item.route)}
                        style={{
                            position: 'relative',
                            borderRadius: '28px', /* Increased border radius for premium feel */
                            overflow: 'hidden',
                            height: '200px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.08)', /* Softer, larger shadow */
                            cursor: item.route !== '#' ? 'pointer' : 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            backgroundImage: `url('${item.bgImage}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid rgba(255,255,255,0.4)',
                        }}
                    >
                        {/* Background Gradient Overlay for Readability */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
                            zIndex: 1
                        }}></div>

                        {/* Badges */}
                        {item.badge && (
                            <div
                                className={item.badge === 'LIVE' ? 'glass-panel' : ''}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    backgroundColor: item.badge === 'LIVE' ? 'rgba(46, 204, 113, 0.8)' : item.badgeColor,
                                    color: item.badge === 'LIVE' ? 'white' : '#000',
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    zIndex: 2,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    letterSpacing: '0.5px'
                                }}>
                                {item.badge}
                            </div>
                        )}

                        {/* Content with Glassmorphism backing */}
                        <div className="glass-panel" style={{
                            position: 'relative',
                            zIndex: 2,
                            padding: '24px',
                            color: 'white',
                            margin: '12px',
                            borderRadius: '24px',
                            background: 'rgba(0, 0, 0, 0.45)', /* Fallback for blur */
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            {item.icon}
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px', lineHeight: '1.2', letterSpacing: '-0.2px' }}>
                                {item.title}
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', fontWeight: '400' }}>
                                {item.subtitle}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* COMING SOON SECTION (Main Dashboard) */}
            <div style={{ marginTop: '32px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('coming_soon_section')}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {[
                        {
                            title: 'Pest Early Warning',
                            subtitle: 'Regional outbreak alerts',
                            icon: <Bug size={24} />,
                            badge: 'BETA',
                            badgeStyle: { background: '#dbeafe', color: '#2563eb' },
                            route: '/pest-warning',
                            clickable: true
                        },
                        {
                            title: 'Lunar Planting',
                            subtitle: 'Smart calendar guide',
                            icon: <Moon size={24} />,
                            badge: 'BETA',
                            badgeStyle: { background: '#dbeafe', color: '#2563eb' },
                            route: '/lunar-calendar',
                            clickable: true
                        },
                        {
                            title: 'Manure Exchange',
                            subtitle: 'Local organic trading',
                            icon: <Recycle size={24} />,
                            badge: 'COMING SOON',
                            badgeStyle: { background: 'var(--secondary)', color: '#000' },
                            clickable: false
                        }
                    ].map(feature => (
                        <div
                            key={feature.title}
                            onClick={() => feature.clickable && navigate(feature.route || '')}
                            className={feature.clickable ? "coming-soon-card-clickable" : ""}
                            style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                padding: '16px',
                                borderRadius: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                position: 'relative',
                                cursor: feature.clickable ? 'pointer' : 'default',
                                transition: '0.2s ease'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: feature.badgeStyle.background,
                                color: feature.badgeStyle.color,
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                padding: feature.badge === 'BETA' ? '4px 12px' : '4px 8px',
                                borderRadius: '20px',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}>
                                {feature.badge}
                            </div>
                            <div style={{ color: 'var(--text-muted)', background: 'var(--border)', width: 'max-content', padding: '10px', borderRadius: '12px' }}>
                                {feature.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.2, marginBottom: '4px' }}>{feature.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{feature.subtitle}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Ask Sahayak Button (Primary CTA) */}
            <button
                className="fab"
                onClick={() => navigate('/sahayak-chat')}
                style={{
                    position: 'fixed',
                    bottom: '100px', // slightly above the 80px bottom nav bar
                    right: '50%',
                    transform: 'translateX(50%)', // Centered vertically on larger screens, or keep right? User said "floating pill button... primary CTA". 
                    marginLeft: 'auto',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '16px 28px',
                    borderRadius: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 24px rgba(46, 204, 113, 0.6)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    zIndex: 40,
                    '@media (minWidth: 600px)': {
                        right: '32px',
                        transform: 'none'
                    }
                } as any}>
                <Mic size={24} />
                {t('fab_ask')}
            </button>

            {/* ALL FEATURES BOTTOM SHEET */}
            {isFeaturesOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: 'var(--surface)',
                        borderTopLeftRadius: '28px',
                        borderTopRightRadius: '28px',
                        padding: '24px',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>{t('all_features')}</h3>
                            <button onClick={() => setFeaturesOpen(false)} style={{ background: 'var(--bg)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div style={{ overflowY: 'auto', paddingBottom: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* SECTION 1: Available Now */}
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('available_now')}
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { title: t('card_scan'), icon: <Scan size={22} />, route: '/scan' },
                                        { title: t('card_advisory'), icon: <Mic size={22} />, route: '/mandi-voice' },
                                        { title: t('card_diary'), icon: <BookText size={22} />, route: '/diary' }
                                    ].map(feature => (
                                        <button
                                            key={feature.title}
                                            onClick={() => { setFeaturesOpen(false); navigate(feature.route); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '16px 20px',
                                                background: 'var(--bg)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'transform 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text)', fontWeight: 700, fontSize: '1.05rem' }}>
                                                <div style={{ background: 'rgba(46, 204, 113, 0.1)', color: 'var(--primary-dark)', padding: '12px', borderRadius: '14px' }}>
                                                    {feature.icon}
                                                </div>
                                                {feature.title}
                                            </div>
                                            <div style={{ background: 'var(--primary)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '6px 10px', borderRadius: '16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                                {t('live')}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION 2: Beta Features */}
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    BETA
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { title: 'Pest Early Warning', icon: <Bug size={22} />, route: '/pest-warning' },
                                        { title: 'Lunar Planting', icon: <Moon size={22} />, route: '/lunar-calendar' }
                                    ].map(feature => (
                                        <button
                                            key={feature.title}
                                            onClick={() => { setFeaturesOpen(false); navigate(feature.route); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '16px 20px',
                                                background: 'var(--bg)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'transform 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text)', fontWeight: 700, fontSize: '1.05rem' }}>
                                                <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '12px', borderRadius: '14px' }}>
                                                    {feature.icon}
                                                </div>
                                                {feature.title}
                                            </div>
                                            <div style={{ background: '#dbeafe', color: '#2563eb', fontSize: '0.65rem', fontWeight: 800, padding: '6px 12px', borderRadius: '16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                                BETA
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION 3: Coming Soon */}
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('coming_soon_section')}
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    {[
                                        { title: 'Manure Exchange', subtitle: 'Local organic trading', icon: <Recycle size={24} /> }
                                    ].map(feature => (
                                        <div key={feature.title} style={{
                                            background: 'var(--bg)',
                                            border: '1px solid var(--border)',
                                            padding: '16px',
                                            borderRadius: '20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            position: 'relative'
                                        }}>
                                            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--secondary)', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '4px 8px', borderRadius: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                                {t('coming_soon')}
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', background: 'var(--border)', width: 'max-content', padding: '10px', borderRadius: '12px' }}>
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.2, marginBottom: '4px' }}>{feature.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{feature.subtitle}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Replay Tour Button */}
            <button
                onClick={() => {
                    localStorage.removeItem('krishi_tour_completed');
                    window.location.reload();
                }}
                title="App Tour देखें"
                style={{
                    position: 'fixed',
                    top: '80px',
                    right: '16px',
                    bottom: 'auto',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'white',
                    border: '2px solid #16a34a',
                    color: '#16a34a',
                    fontWeight: '700',
                    fontSize: '18px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    zIndex: 45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                ?
            </button>

            <style>
                {`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .fab {
          right: 24px !important;
          transform: none !important;
        }
        @media (min-width: 800px) {
          .fab {
             right: calc(50vw - 400px + 24px) !important;
          }
          /* Replay button positioning on desktop */
          button[title="App Tour देखें"] {
            right: calc(50vw - 400px + 16px) !important;
            top: 80px !important;
          }
        }
        `}
            </style>
        </div>
    );
}
