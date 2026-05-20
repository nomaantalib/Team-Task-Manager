import React from 'react';
import { ArrowRight, Bot, Zap, Clock, Users, CheckCircle, BarChart2 } from 'lucide-react';

const Landing = ({ onStart }) => {
  return (
    <div style={{
      background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.12) 0%, transparent 60%), #07090e',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating abstract decorative glow elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(59, 130, 246, 0.04)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'rgba(139, 92, 246, 0.04)',
        filter: 'blur(120px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Navigation Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 8%',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem', fontWeight: 800 }}>
          <span style={{
            background: 'linear-gradient(to right, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-header)'
          }}>⚡ Antigravity AI</span>
        </div>
        <button onClick={onStart} className="btn btn-secondary">
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignSelf: 'center', width: '100%', maxWidth: '1200px', padding: '80px 24px', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--secondary)',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <Bot size={16} /> powered by Gemini 1.5 Flash
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            lineHeight: 1.1,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #FFF 30%, #9CA3AF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '900px',
            margin: '0 auto 24px auto'
          }}>
            AI-Powered Team Productivity & Smart Task Scheduling
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            maxWidth: '650px',
            margin: '0 auto 40px auto',
            fontWeight: 400
          }}>
            Stop managing tasks blindly. Elevate your team collaboration with intelligent workload balancing, smart reminders, and automated feasibility score analyzer.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={onStart} className="btn btn-ai" style={{ padding: '16px 32px', fontSize: '1.05rem', borderRadius: 'var(--radius-sm)' }}>
              Launch Workspace <ArrowRight size={20} />
            </button>
            <a href="#features" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
              Explore Modes
            </a>
          </div>
        </div>

        {/* Visual Simulated Toggle Demo */}
        <div className="glass-panel" style={{
          padding: '6px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(10, 15, 30, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          marginBottom: '100px'
        }}>
          <div style={{
            background: '#0B0F19',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
              </div>
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                color: 'var(--secondary)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Bot size={14} /> AI SMART MODE ACTIVE
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>User Input</h4>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  "Need to complete backend authentication and deployment by Friday"
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Feasibility Score</span>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>92%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '92%', height: '100%', background: 'var(--success)' }} />
                  </div>
                </div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                <h4 style={{ marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--secondary)' }}>AI Generated Plan</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="var(--secondary)" /> Day 1: Auth Schemas & JWT routes</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="var(--secondary)" /> Day 2: Route Guards & Middleware</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="var(--secondary)" /> Day 3: Deployment configuration</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="var(--secondary)" /> Day 4: Unit Testing & Checks</li>
                </ul>
                <div style={{ marginTop: '14px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  💡 <strong>Risk Low:</strong> Complete authentication routing before setting up pipeline configs.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Mode Comparison */}
        <section id="features" style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '40px', color: 'white' }}>Two Architectural Operations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '10px', borderRadius: '10px' }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'white' }}>Normal Mode</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Traditional Task Control</p>
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <li>✓ Create, update, and categorize tasks manually</li>
                <li>✓ Allocate members & assign due deadlines</li>
                <li>✓ Shift tasks in custom board structures</li>
                <li>✓ Keep traditional project progress overview grids</li>
              </ul>
            </div>

            <div className="glass-panel ai-glow" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--secondary)', padding: '10px', borderRadius: '10px' }}>
                  <Bot size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>AI Smart Mode</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Gemini Core Automation</p>
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <li>✓ Natural Language parsing converts commands directly to tasks</li>
                <li>✓ Auto-estimates time constraints & scheduling feasibility</li>
                <li>✓ Generates subtask breakdowns and tech criteria lists</li>
                <li>✓ Balancing analysis graphs to avoid developer overload</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ borderTop: '1px solid var(--border)', paddingTop: '80px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '48px', color: 'white' }}>Premium features built to win</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
              <Clock size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <h4 style={{ color: 'white', marginBottom: '8px' }}>Smart Schedule Analyzer</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Evaluates your task scope and calculates hours required and risk indicators based on existing sprints.</p>
            </div>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
              <Zap size={24} color="var(--secondary)" style={{ marginBottom: '12px' }} />
              <h4 style={{ color: 'white', marginBottom: '8px' }}>Natural Language Magic</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Type plain commands and watch them instantly parse to target dates, priority tags, and specific check items.</p>
            </div>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
              <Users size={24} color="var(--success)" style={{ marginBottom: '12px' }} />
              <h4 style={{ color: 'white', marginBottom: '8px' }}>Workload Optimizer</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Visual metrics highlight high-pressure slots, alerting managers before developers bottleneck.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', zIndex: 10 }}>
        © {new Date().getFullYear()} Antigravity AI Project Manager. Powered by Google Gemini. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
