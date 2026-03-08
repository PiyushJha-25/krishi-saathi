import React, { useState, useEffect, useRef } from 'react';
import { Wifi, X, CheckCircle2, ShieldCheck, Upload } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BottomNavBar from '../components/BottomNavBar';

// Fix default marker icon issue in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function PestWarning() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportStatus, setReportStatus] = useState<'idle' | 'success'>('idle');
    const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Initialize Map centered on Indore, India
        const map = L.map(mapRef.current).setView([22.7196, 75.8577], 12);
        mapInstance.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Zone A - High Risk (North)
        const zoneA = L.circle([22.7500, 75.8800], {
            radius: 1200,
            color: '#dc2626',
            fillColor: '#dc2626',
            fillOpacity: 0.2,
            weight: 2
        }).addTo(map);
        zoneA.bindPopup("<b>Zone A (North) — CRITICAL</b><br/>Active Locust Swarm — 2km away");
        L.marker([22.7500, 75.8800]).addTo(map).bindPopup("<b>Zone A (North) — CRITICAL</b><br/>Active Locust Swarm — 2km away");

        // Zone D - Moderate (West)
        const zoneD = L.circle([22.7196, 75.8200], {
            radius: 900,
            color: '#d97706',
            fillColor: '#d97706',
            fillOpacity: 0.2,
            weight: 2
        }).addTo(map);
        zoneD.bindPopup("<b>Zone D (West) — MODERATE</b><br/>Possible Stem Borer — 4.5km away");

        // Zone B - Safe (Your Location center)
        const zoneB = L.circle([22.7196, 75.8577], {
            radius: 600,
            color: '#16a34a',
            fillColor: '#16a34a',
            fillOpacity: 0.2,
            weight: 2
        }).addTo(map);
        zoneB.bindPopup("<b>Zone B — YOUR LOCATION</b><br/>No active threats detected");

        // Custom pulsing marker for "Your Location"
        const pulsingIcon = L.divIcon({
            className: 'pulsing-location-marker',
            html: '<div class="pulse"></div>',
            iconSize: [20, 20]
        });
        L.marker([22.7196, 75.8577], { icon: pulsingIcon }).addTo(map);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setReportStatus('success');
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <style>
                {`
                .pulsing-location-marker .pulse {
                    width: 14px;
                    height: 14px;
                    background: #16a34a;
                    border-radius: 50%;
                    box-shadow: 0 0 0 rgba(22, 163, 74, 0.4);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(22, 163, 74, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
                }
                .pest-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 65% 35%;
                    gap: 24px;
                    padding: 24px 20px;
                }
                @media (max-width: 768px) {
                    .pest-container {
                        grid-template-columns: 1fr;
                    }
                }
                `}
            </style>

            {/* HEADER SECTION */}
            <header style={{ background: 'white', padding: '20px 20px 0 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>BETA FEATURE</span>
                        <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Wifi size={14} /> Offline Capable
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: '#1e293b', margin: 0 }}>Community Pest Early Warning</h1>
                            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '500px', margin: '8px 0 20px 0' }}>Real-time, peer-to-peer pest alerts from farmers within a 5km radius. Stay ahead of threats with community intelligence.</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                background: '#16a34a',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '12px 24px',
                                fontWeight: 600,
                                fontSize: '14px',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                            Report Pest Sighting
                        </button>
                    </div>
                </div>
            </header>

            <div className="pest-container">
                {/* LEFT COLUMN - MAP */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                        ref={mapRef}
                        style={{
                            height: '520px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0',
                            zIndex: 1
                        }}
                    />

                    {/* FILTER PILLS */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#dc2626', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} /> High Risk
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef3c7', color: '#d97706', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706' }} /> Moderate
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#16a34a', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} /> Safe Zone
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - LIVE UPDATES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Live Updates</h2>
                        <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '12px', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>5km Radius</span>
                    </div>

                    {/* ALERT CARDS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* CARD 1 - CRITICAL */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #dc2626', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>Zone A (North)</span>
                                <span style={{ background: '#dc2626', color: 'white', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>CRITICAL</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>1h ago • 2km away</div>
                            <div style={{ background: '#fff5f5', borderRadius: '8px', padding: '10px 12px' }}>
                                <div style={{ color: '#dc2626', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Active Locust Swarm Reported</div>
                                <div style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>High density swarm moving South-East. Immediate crop protection recommended.</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>+3 farmers confirmed this</span>
                                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, cursor: 'pointer' }}>View Details →</span>
                            </div>
                        </div>

                        {/* CARD 2 - MODERATE */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #d97706', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>Zone D (West)</span>
                                <span style={{ background: '#d97706', color: 'white', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>MODERATE</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>3h ago • 4.5km away</div>
                            <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '10px 12px' }}>
                                <div style={{ color: '#d97706', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Possible Stem Borer</div>
                                <div style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>Waiting for verification from local agricultural officer.</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, cursor: 'pointer' }}>Verify Report →</span>
                            </div>
                        </div>

                        {/* CARD 3 - SAFE */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>Zone B (Your Location)</span>
                                <span style={{ background: '#16a34a', color: 'white', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>SAFE</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>Updated just now</div>
                            <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '10px 12px' }}>
                                <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>No active threats detected</div>
                                <div style={{ color: '#64748b', fontSize: '12px' }}>Based on 12 local reports</div>
                            </div>
                        </div>
                    </div>

                    {/* COMMUNITY TRUST CARD */}
                    <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', borderRadius: '12px', padding: '16px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                                <ShieldCheck size={20} />
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: 700 }}>Community Trust</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: '0 0 16px 0', lineHeight: 1.4 }}>You have helped verify 3 alerts this week. Keep the community safe!</p>
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '4px', height: '6px', width: '100%', marginBottom: '8px' }}>
                            <div style={{ background: 'white', height: '100%', width: '65%', borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>65% to Top Contributor badge</span>
                    </div>
                </div>
            </div>

            {/* REPORT MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ background: 'white', borderRadius: '20px', width: 'min(480px, 100%)', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative' }}>
                        <button onClick={() => { setIsModalOpen(false); setReportStatus('idle'); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={24} />
                        </button>

                        {reportStatus === 'idle' ? (
                            <>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Report Pest Sighting</h2>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Crop affected</label>
                                        <input type="text" placeholder="e.g. Wheat, Rice, Cotton" style={{ width: '100%', height: '44px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Your location</label>
                                        <input type="text" placeholder="Village or area name" style={{ width: '100%', height: '44px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Pest description</label>
                                        <textarea rows={3} placeholder="Describe what you saw — color, size, damage type..." style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '14px', resize: 'none' }} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Severity</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {(['LOW', 'MEDIUM', 'HIGH'] as const).map(lev => (
                                                <button
                                                    key={lev}
                                                    type="button"
                                                    onClick={() => setSeverity(lev)}
                                                    style={{
                                                        flex: 1,
                                                        height: '40px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        background: severity === lev ? (lev === 'HIGH' ? '#dc2626' : lev === 'MEDIUM' ? '#d97706' : '#16a34a') : 'white',
                                                        color: severity === lev ? 'white' : '#64748b',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                    {lev}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Photo upload</label>
                                        <div style={{ width: '100%', height: '80px', border: '2px dashed #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '4px', cursor: 'pointer' }}>
                                            <Upload size={20} />
                                            <span style={{ fontSize: '12px' }}>Upload Photo (optional)</span>
                                        </div>
                                    </div>
                                    <button type="submit" style={{ width: '100%', height: '52px', background: 'linear-gradient(to right, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', marginTop: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
                                        Report Karo
                                    </button>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>Aapki report se 50+ farmers ko madad milegi</p>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ background: '#f0fdf4', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: '#16a34a' }}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Report Submit Ho Gaya!</h2>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Community ko alert bhej diya. Thank you!</p>
                                <button onClick={() => { setIsModalOpen(false); setReportStatus('idle'); }} style={{ width: '100%', height: '48px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <BottomNavBar />
        </div>
    );
}
