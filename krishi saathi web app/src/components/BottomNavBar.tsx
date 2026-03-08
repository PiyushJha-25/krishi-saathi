import { NavLink } from 'react-router-dom';
import { Home, Scan, BookText, Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNavBar() {
    const { t } = useLanguage();

    const navItems = [
        { path: '/home', label: t('nav_home'), icon: Home },
        { path: '/scan', label: t('nav_scan'), icon: Scan, tourId: 'scan' },
        { path: '/diary', label: t('nav_diary'), icon: BookText, tourId: 'diary' },
        { path: '/mandi-voice', label: t('nav_voice'), icon: Mic, tourId: 'mandi' },
    ];

    return (
        <nav className="glass" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 50,
            maxWidth: '600px',
            margin: '0 auto',
            borderTop: '1px solid var(--border)',
            borderBottom: 'none'
        }}>
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    data-tour={item.tourId}
                    style={({ isActive }) => ({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                        flex: 1,
                        padding: '8px 0',
                        transition: 'all 0.2s',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    })}
                >
                    <item.icon size={24} style={{ marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
