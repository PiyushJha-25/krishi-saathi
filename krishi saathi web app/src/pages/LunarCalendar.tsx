import React from 'react';
import { PlayCircle, Calendar, Droplets, Leaf, ShieldCheck, Settings, Lock, Star, Info } from 'lucide-react';
import BottomNavBar from '../components/BottomNavBar';

export default function LunarCalendar() {
    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '80px' }}>
            <style>
                {`
        .lunar-hero {
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 24px 40px 24px;
          display: grid;
          grid-template-columns: 55% 45%;
          gap: 32px;
          align-items: center;
        }
        .moon-outer {
          width: 260px;
          height: 260px;
          border: 2px dashed #e2e8f0;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .moon-inner {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle at 35% 35%, #f8fafc, #cbd5e1);
          border-radius: 50%;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          position: relative;
          overflow: hidden;
        }
        /* Waxing Gibbous Effect: Right side lit golden */
        .moon-phase-lit {
          position: absolute;
          top: 0;
          right: 0;
          width: 75%;
          height: 100%;
          background: #fbbf24;
          border-radius: 50% 100% 100% 50% / 50% 50% 50% 50%;
        }
        .moon-deco-gold {
          width: 12px;
          height: 12px;
          background: #f59e0b;
          border-radius: 50%;
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
        }
        .moon-deco-grey-1 {
          width: 20px;
          height: 20px;
          background: #e2e8f0;
          border-radius: 50%;
          position: absolute;
          bottom: 20px;
          left: 10px;
        }
        .moon-deco-grey-2 {
          width: 16px;
          height: 16px;
          background: #e2e8f0;
          border-radius: 50%;
          position: absolute;
          right: 15px;
          top: 70px;
        }
        .today-card {
          background: white;
          border-radius: 14px;
          padding: 16px 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          width: 180px;
          z-index: 10;
        }
        .section-container {
          max-width: 900px;
          margin: 0 auto 40px auto;
          padding: 0 24px;
        }
        .planting-card {
          display: flex;
          background: white;
          border-radius: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .planting-image-side {
          width: 40%;
          position: relative;
        }
        .planting-content-side {
          width: 60%;
          padding: 24px;
        }
        .top-rec-badge {
          position: absolute;
          bottom: 0;
          left: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 0 8px 0 0;
        }
        .scroll-container {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 20px;
          scrollbar-width: none;
        }
        .scroll-container::-webkit-scrollbar { display: none; }
        .favor-card {
          background: white;
          border-radius: 14px;
          padding: 16px;
          min-width: 180px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .card-bottom-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          border-radius: 0 0 12px 12px;
        }
        .science-section {
          background: linear-gradient(135deg, #14532d, #166534);
          border-radius: 16px;
          padding: 40px 32px;
          text-align: center;
          margin: 32px auto;
          max-width: 900px;
          color: white;
        }
        @media (max-width: 767px) {
          .lunar-hero {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .lunar-hero-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .moon-outer {
            width: 200px;
            height: 200px;
            margin: 20px auto;
          }
          .moon-inner {
            width: 140px;
            height: 140px;
          }
          .today-card {
            position: relative;
            transform: none;
            right: auto;
            top: auto;
            margin: 20px auto 0 auto;
            width: 100%;
            max-width: 240px;
          }
          .planting-card {
            flex-direction: column;
          }
          .planting-image-side, .planting-content-side {
            width: 100%;
          }
          .favor-card {
            min-width: 170px;
          }
        }
        `}
            </style>

            {/* HERO SECTION */}
            <section className="lunar-hero">
                <div className="lunar-hero-content">
                    <div style={{
                        background: '#f0fdf4',
                        color: '#16a34a',
                        border: '1px solid #bbf7d0',
                        borderRadius: '20px',
                        padding: '5px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        width: 'fit-content',
                        marginBottom: '16px'
                    }}>
                        AI + TRADITIONAL WISDOM
                    </div>
                    <h1 style={{ margin: 0, lineHeight: 1.1 }}>
                        <span style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#1e293b', display: 'block' }}>Lunar Phase</span>
                        <span style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#16a34a', display: 'block' }}>Planting Calendar</span>
                    </h1>
                    <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, marginTop: '16px', maxWidth: '460px' }}>
                        Merge traditional Vedic wisdom with modern AI. Plan your sowing, fertilizing, and harvesting based on optimal lunar cycles for maximum yield and soil health.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button style={{ background: '#1e293b', color: 'white', borderRadius: '10px', padding: '13px 24px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                            View My Calendar
                        </button>
                        <button style={{ background: 'transparent', color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '13px 20px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <PlayCircle size={18} /> How it Works
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <div className="moon-outer">
                        <div className="moon-deco-gold" />
                        <div className="moon-deco-grey-1" />
                        <div className="moon-deco-grey-2" />
                        <div className="moon-inner">
                            <div className="moon-phase-lit" />
                        </div>

                        <div className="today-card">
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', marginBottom: '4px' }}>TODAY</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Waxing Gibbous</div>
                            <div style={{ display: 'flex', gap: '2px', margin: '4px 0' }}>
                                {[1, 2, 3, 4].map(n => <Star key={n} size={14} fill="#fbbf24" color="#fbbf24" />)}
                                <Star size={14} color="#fbbf24" />
                            </div>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: '6px 0 0 0', lineHeight: 1.4 }}>High moisture retention. Ideal for sowing leafy vegetables.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CURRENT PLANTING WINDOW */}
            <section className="section-container">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '4px', height: '24px', background: '#16a34a', borderRadius: '2px', marginRight: '12px' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Current Planting Window</h2>
                </div>

                <div className="planting-card">
                    <div className="planting-image-side">
                        <img
                            src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80"
                            alt="Wheat Field"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div className="top-rec-badge">TOP RECOMMENDATION</div>
                    </div>
                    <div className="planting-content-side">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1e293b' }}>Optimal for Wheat Sowing</h3>
                                <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>Waxing Gibbous Phase</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>85%</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Success Prob.</div>
                            </div>
                        </div>

                        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: '16px 0' }}>
                            The moon's gravitational pull is currently affecting soil moisture levels, pulling water upwards. This creates the perfect condition for seeds to absorb moisture and swell, leading to higher germination rates for wheat and other cereals.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Droplets size={18} color="#3b82f6" />
                                <div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Soil Moisture</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>High Retention</div>
                                </div>
                            </div>
                            <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Leaf size={18} color="#16a34a" />
                                <div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Root Growth</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Rapid Development</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <button style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                                Start Planning
                            </button>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, cursor: 'pointer' }}>Learn More →</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* UPCOMING FAVORABLE DAYS */}
            <section className="section-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Upcoming Favorable Days</h2>
                    <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>View Full Calendar</span>
                </div>

                <div className="scroll-container">
                    <div className="favor-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                            <Calendar size={14} /> Oct 28 - Oct 30
                        </div>
                        <div style={{ background: '#f0fdf4', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#16a34a' }}>
                            <Leaf size={24} />
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b' }}>Leafy Greens</h4>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Sowing</span>
                            <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600 }}>New Moon</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>Best time for Spinach and Lettuce. Leaf growth is encouraged by...</p>
                        <div className="card-bottom-bar" style={{ background: '#16a34a' }} />
                    </div>

                    <div className="favor-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                            <Calendar size={14} /> Nov 02 - Nov 05
                        </div>
                        <div style={{ background: '#fffbeb', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#d97706' }}>
                            <Info size={24} />
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b' }}>Fertilizing</h4>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Care</span>
                            <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600 }}>Full Moon</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>Organic manure application is most effective now due to strong root...</p>
                        <div className="card-bottom-bar" style={{ background: '#d97706' }} />
                    </div>

                    <div className="favor-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                            <Calendar size={14} /> Nov 10 - Nov 12
                        </div>
                        <div style={{ background: '#eff6ff', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#3b82f6' }}>
                            <Droplets size={24} />
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b' }}>Irrigation</h4>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ background: '#dbeafe', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Maintenance</span>
                            <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600 }}>Waning Moon</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>Watering now prevents excessive evaporation. Focus on deep root...</p>
                        <div className="card-bottom-bar" style={{ background: '#3b82f6' }} />
                    </div>

                    <div className="favor-card" style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ background: '#fff', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '12px' }}>
                            <Lock size={20} color="#94a3b8" />
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Unlock 30-Day Plan</h4>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Get personalized AI insights for your specific crop mix.</p>
                        <button style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            Upgrade to Premium
                        </button>
                    </div>
                </div>
            </section>

            {/* THE SCIENCE BEHIND IT */}
            <section className="science-section">
                <div style={{ background: 'rgba(255,255,255,0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Settings size={24} color="white" />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>The Science Behind It</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 28px auto' }}>
                    Just as the moon affects the tides of the ocean, it affects the moisture in the soil. Krishi Saathi's AI analyzes local weather patterns alongside lunar cycles to give you the most accurate agricultural forecast.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px 24px', minWidth: '160px' }}>
                        <ShieldCheck size={24} color="white" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '24px', fontWeight: 800 }}>20%</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>Yield Increase</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px 24px', minWidth: '160px' }}>
                        <Settings size={24} color="white" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '24px', fontWeight: 800 }}>15%</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>Pest Reduction</div>
                    </div>
                </div>
            </section>

            <BottomNavBar />
        </div>
    );
}
