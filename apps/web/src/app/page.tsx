'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type View = 'chat' | 'products' | 'agents' | 'skills' | 'library';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'complete';
  lastActivity: Date;
}

interface CardItem {
  name: string;
  tagline?: string;
  price: number;
  status?: 'live' | 'building' | 'soon';
  about?: string;
  by?: string;
  cat?: string;
  desc?: string;
}

// ─────────────────────────────────────────────────────────────
// Data — Products, Agents, Skills
// ─────────────────────────────────────────────────────────────

const PRODUCTS: (CardItem & { domain: string })[] = [
  { name: 'Artispreneur', tagline: 'The home base where artists build a real business — bookings, brand, and income in one place.', domain: 'artispreneur.com', status: 'live', price: 0 },
  { name: 'Artispreneur Academy', tagline: 'Courses that turn creative talent into a living you can count on.', domain: 'academy.artispreneur.com', status: 'live', price: 0 },
  { name: 'Artispreneur Contracts', tagline: 'Fair, plain-English contracts for creators — drafted in minutes, not lawyer hours.', domain: 'contracts.artispreneur.com', status: 'live', price: 0 },
  { name: 'Rostr', tagline: 'The agent platform that powers everything Monarch builds. Home of Hermes.', domain: 'rostragent.com', status: 'live', price: 0 },
  { name: 'Replai', tagline: 'Answers every message in your own voice, so nothing ever slips through.', domain: 'replaiall.com', status: 'live', price: 0 },
  { name: 'Credit Fixer', tagline: 'Finds the errors on your credit report and disputes them for you.', domain: 'fcragent.com', status: 'live', price: 0 },
  { name: 'Lola', tagline: 'Your personal coach — a plan for your body that adjusts as you go.', domain: 'trainlola.com', status: 'live', price: 0 },
  { name: 'Huddle CoWork', tagline: 'A calm place for remote teams to gather and get real work done.', domain: 'huddleco.work', status: 'live', price: 0 },
  { name: 'GencyAI', tagline: 'Runs your agency\'s day-to-day — clients, tasks, and invoices — so you can do the work.', domain: 'gencyai.com', status: 'building', price: 0 },
  { name: 'Lets Vibe AI', tagline: 'Describe the vibe; watch it become something real.', domain: 'letsvibeai.com', status: 'building', price: 0 },
];

const AGENTS: (CardItem & { by: string })[] = [
  { name: 'Artispreneur', by: 'Monarch', tagline: 'Turns artists into entrepreneurs — bookings, brand, and business, handled.', price: 0, status: 'live', about: 'Built for working creatives. It keeps your calendar, your brand, and your money moving — drafting outreach, tracking gigs, and lining up the next opportunity, all waiting on your approval.' },
  { name: 'ArtistEPKs', by: 'ArtistEPKs', tagline: 'A professional press kit for your music, in minutes.', price: 19, status: 'live', about: 'Give it your links and a few facts; it writes and lays out a press kit that promoters and labels actually open — bio, photos, tracks, and stats, ready to send.' },
  { name: 'Credit Fixer', by: 'Monarch', tagline: 'Disputes credit-report errors and tracks every response.', price: 29, status: 'live', about: 'It reads your reports, flags what looks wrong, and drafts the disputes — then follows each one until it\'s resolved. You approve every letter before it goes out.' },
  { name: 'Replai', by: 'Monarch', tagline: 'Clears your inbox in your voice — drafts ready to approve.', price: 15, status: 'live', about: 'It reads what came in, understands what matters, and writes replies that sound like you. Nothing sends until you say so.' },
  { name: 'PRD Builder', by: 'Rostr', tagline: 'Turns a rough idea into a build-ready product spec.', price: 12, status: 'live', about: 'Describe what you want to make. It asks the right questions and returns a clear, organized spec your team can actually build from.' },
  { name: 'GencyAI', by: 'Monarch', tagline: 'Runs your agency: clients, tasks, and invoices.', price: 39, status: 'building', about: 'The operating system for a small agency — it keeps projects on track, drafts client updates, and gets invoices out the door. Arriving soon.' },
  { name: 'Diagram Builder', by: 'Rostr', tagline: 'Describe a system; get a clean diagram back.', price: 0, status: 'live', about: 'Explain how something connects and it draws it for you — flows, architectures, org charts — clean enough to drop into a deck.' },
];

const SKILLS: (CardItem & { by: string; cat: string; desc: string })[] = [
  { name: 'PAL Compiler', by: 'Rostr', desc: 'Compiles a vague request into a precise, do-able plan.', cat: 'Build', price: 9, about: 'The Prompt Abstraction Layer: it takes a fuzzy ask and turns it into an exact plan of what to do, in what order — so your agent never guesses.' },
  { name: 'NPAO Router', by: 'Rostr', desc: 'Picks the right approach for each task, automatically.', cat: 'Build', price: 9, about: 'Scores every task on what it needs and routes it to the best approach — fast when speed matters, careful when quality does.' },
  { name: 'JTBD Builder', by: 'Rostr', desc: 'Find the real job your customers hire you for.', cat: 'Work', price: 0, about: 'Walks you through the Jobs-to-be-Done method and hands back a crisp statement of what people actually want from you.' },
  { name: 'Instruction Architect', by: 'Rostr', desc: 'Writes crisp instructions your agent follows exactly.', cat: 'Build', price: 7, about: 'Turns your intentions into clear, unambiguous instructions — the difference between an agent that almost gets it and one that nails it.' },
  { name: 'PRD Builder', by: 'Rostr', desc: 'A rough idea becomes a build-ready spec.', cat: 'Work', price: 9, about: 'Interviews you about your idea and returns an organized product spec, ready to hand to whoever\'s building it.' },
  { name: 'Diagram Builder', by: 'Rostr', desc: 'Describe a system; get a clean diagram.', cat: 'Build', price: 0, about: 'Say how the pieces connect and it draws the picture — flows, maps, and architectures you can drop straight into a doc.' },
  { name: 'Trip Planner', by: 'Monarch', desc: 'Flights, stays, and a day-by-day plan — you just approve.', cat: 'Home & Family', price: 0, about: 'Tell it where and when. It finds options, builds a day-by-day itinerary, and lines up the bookings for your okay.' },
  { name: 'Bill Negotiator', by: 'Monarch', desc: 'Finds overcharges and drafts the calls and emails to fix them.', cat: 'Money', price: 5, about: 'Reads your bills, spots what you\'re overpaying, and writes the exact scripts and emails to get it lowered.' },
  { name: 'Resume Builder', by: 'Monarch', desc: 'Turns your work history into a resume that gets callbacks.', cat: 'Work', price: 0, about: 'Give it your history in plain words; it shapes a clean, confident resume tuned to the jobs you actually want.' },
  { name: 'Meal Prep', by: 'Monarch', desc: 'A week of meals, a grocery list, and the order ready to place.', cat: 'Home & Family', price: 0, about: 'Pick a vibe and any limits. It plans the week, builds the grocery list, and gets the order ready for your approval.' },
  { name: 'Press Kit Maker', by: 'ArtistEPKs', desc: 'A professional press kit for your music, in minutes.', cat: 'Create', price: 9, about: 'The ArtistEPKs skill, unbundled — a polished press kit from your links and a few facts, ready to send.' },
  { name: 'Small Biz Starter', by: 'Artispreneur', desc: 'From idea to open-for-business, one approval at a time.', cat: 'Work', price: 9, about: 'Walks a new business from idea to open — name, basics, first customers — each step waiting on your say-so.' },
  { name: 'Garage Sale Lister', by: 'Community', desc: 'Snap photos; it writes listings and posts them everywhere.', cat: 'Money', price: 0, about: 'Photograph your stuff. It writes the listings, prices them, and posts to the right places — you approve before anything goes live.' },
  { name: 'Photo Organizer', by: 'Community', desc: 'Sorts decades of family photos into albums you can share.', cat: 'Home & Family', price: 0, about: 'Point it at the pile. It sorts by people, places, and moments into albums the whole family can enjoy.' },
];

const SKILL_CATEGORIES = ['All', 'Home & Family', 'Money', 'Work', 'Build', 'Create'];

const QUICK_PROMPTS = [
  "Plan my daughter's wedding budget",
  'Organize my job search',
  'Sell my old furniture online',
  'Plan a trip to see the grandkids',
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function statusMap(status: string | undefined) {
  const M: Record<string, { label: string; dot: string; color: string; border: string }> = {
    live: { label: 'Live', dot: 'var(--status-live)', color: 'var(--gold-400)', border: 'var(--border-gold)' },
    building: { label: 'Building', dot: 'var(--status-building)', color: 'var(--blue-300)', border: 'var(--border-strong)' },
    soon: { label: 'Coming soon', dot: 'var(--status-soon)', color: 'var(--ink-500)', border: 'var(--border-subtle)' },
  };
  return M[status || ''] || M.live;
}

function loadLib(): { name: string; kind: string; price: number; tagline: string }[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('monarch_library') || '[]'); } catch { return []; }
}

function saveLib(lib: unknown) {
  try { localStorage.setItem('monarch_library', JSON.stringify(lib)); } catch {}
}

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ─────────────────────────────────────────────────────────────
// Hermes system prompt (from Claude Design)
// ─────────────────────────────────────────────────────────────

const HERMES_PROMPT = `You are Hermes, the Monarch base agent — a warm, capable helper for everyday people. Monarch's promise: the person is always in control and nothing happens until they approve it. Speak plainly and kindly, like a trusted friend who happens to be brilliant. Never be technical and never use jargon (avoid the words AI, LLM, model, workflow, automation, agentic). Be regal but warm: calm, decisive, encouraging — you smile through your words. Keep replies short and easy to read. When someone asks you to get something done, reply with one friendly sentence, then a short numbered plan (2 to 5 steps) of how you'd handle it, and end by asking them to approve it or change something. For questions or chit-chat, just answer warmly and helpfully in a few sentences. Never claim you've already done something in the real world — you propose, they approve. Write in plain text only: no markdown, no asterisks, no bold, no bullet characters. For a plan, use simple numbered lines like "1. Step one". Keep a blank line between the numbered steps.`;

// ─────────────────────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────────────────────

function Logo({ size = 34 }: { size?: number }) {
  return <img src="/logo-mark-light.png" alt="Monarch" style={{ height: size }} />;
}

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────

function Sidebar({
  activeView,
  onViewChange,
  libraryCount,
}: {
  activeView: View;
  onViewChange: (v: View) => void;
  libraryCount: number;
}) {
  const navItems: { id: View; label: string }[] = [
    { id: 'chat', label: 'Chat' },
    { id: 'products', label: 'Products' },
    { id: 'agents', label: 'Agents' },
    { id: 'skills', label: 'Skills' },
    { id: 'library', label: 'Library' },
  ];

  const navStyle = (id: View) => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 10,
    padding: '10px 13px',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    cursor: 'pointer',
    color: activeView === id ? 'var(--ink-050)' : 'var(--ink-300)',
    background: activeView === id ? 'var(--navy-800)' : 'transparent',
    fontWeight: activeView === id ? 600 : 500,
    transition: 'background 150ms, color 150ms',
  });

  return (
    <aside
      style={{
        width: 250,
        flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
        background: 'var(--navy-900)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 8px 20px', cursor: 'pointer' }}
        onClick={() => onViewChange('chat')}
      >
        <Logo />
        <span style={{ fontSize: 15, letterSpacing: '.30em', color: 'var(--ink-050)', fontWeight: 500 }}>
          MONARCH
        </span>
      </div>

      {/* Menu */}
      <div style={{ padding: '0 10px 10px', fontSize: 11, letterSpacing: '.22em', color: 'var(--ink-500)', textTransform: 'uppercase' }}>
        Menu
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 22 }}>
        {navItems.map((item) => (
          <div key={item.id} onClick={() => onViewChange(item.id)} style={navStyle(item.id)}>
            <span>{item.label}</span>
            {item.id === 'library' && libraryCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--navy-700)', color: 'var(--gold-400)', fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '1px 9px' }}>
                {libraryCount}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Recent */}
      <div style={{ paddingTop: 18, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ padding: '0 10px 8px', fontSize: 11, letterSpacing: '.22em', color: 'var(--ink-500)', textTransform: 'uppercase' }}>
          Recent
        </div>
        {['Wedding budget plan', 'Trip to see the grandkids'].map((label) => (
          <div
            key={label}
            onClick={() => onViewChange('chat')}
            style={{ padding: '8px 10px', fontSize: 14, color: 'var(--ink-300)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--navy-800)'; e.currentTarget.style.color = 'var(--ink-100)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-300)'; }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Bottom: Upgrade + Profile */}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <div style={{ background: 'var(--navy-700)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink-050)' }}>Monarch Pro</div>
          <p style={{ margin: '5px 0 12px', fontSize: 13, lineHeight: 1.5, color: 'var(--blue-200)' }}>Every agent, unlimited help, all your skills.</p>
          <button
            onClick={() => onViewChange('agents')}
            style={{ width: '100%', background: 'var(--gold-500)', color: 'var(--navy-900)', border: 'none', borderRadius: 'var(--radius-md)', padding: '9px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Upgrade
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '2px 6px' }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--navy-700)', color: 'var(--gold-400)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
            P
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 14, color: 'var(--ink-100)' }}>Pat</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Founder</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// Chat View
// ─────────────────────────────────────────────────────────────

function ChatView({
  messages,
  onSend,
  isLoading,
}: {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading: boolean;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMsgs = useRef(0);

  useEffect(() => {
    if (messages.length !== prevMsgs.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevMsgs.current = messages.length;
  }, [messages]);

  const send = () => {
    const text = inputRef.current?.value?.trim();
    if (!text || isLoading) return;
    if (inputRef.current) inputRef.current.value = '';
    onSend(text);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isEmpty = messages.length === 0;

  if (isEmpty) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 32px' }}>
        <img src="/logo-mark-light.png" alt="" style={{ height: 78, opacity: .96 }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '.06em', color: 'var(--gold-400)', marginTop: 22 }}>
          Good to see you, Pat.
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.1, color: 'var(--text-heading)', margin: '8px 0 10px', textAlign: 'center', maxWidth: 620 }}>
          What can Hermes do for you today?
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-500)', margin: '0 0 30px', textAlign: 'center', maxWidth: 520 }}>
          Say it in your own words. Hermes makes a plan — and nothing happens until you approve it.
        </p>

        {/* Input */}
        <div style={{
          width: '100%', maxWidth: 680, display: 'flex', gap: 10, alignItems: 'flex-end',
          background: 'var(--surface-card)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)', padding: 12, boxShadow: 'var(--shadow-card)',
        }}>
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="What do you need done?"
            onKeyDown={onKey}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none',
              color: 'var(--ink-050)', fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.5,
              padding: '9px 10px', maxHeight: 150,
            }}
          />
          <button
            onClick={send}
            style={{
              background: 'var(--gold-500)', color: 'var(--navy-900)', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '12px 24px', fontSize: 15,
              fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            }}
          >
            Send
          </button>
        </div>

        {/* Quick prompts */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, maxWidth: 680 }}>
          {QUICK_PROMPTS.map((label) => (
            <button
              key={label}
              onClick={() => onSend(label)}
              style={{
                background: 'transparent', border: '1px solid var(--border-subtle)',
                color: 'var(--ink-300)', borderRadius: 'var(--radius-pill)',
                padding: '9px 17px', fontSize: 14, cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--ink-100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--ink-300)'; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Active chat
  return (
    <div ref={scrollRef} style={{ height: '100vh', overflowY: 'auto' }}>
      {/* Messages */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '36px 32px 8px', display: 'flex', flexDirection: 'column', gap: 22, minHeight: 'calc(100vh - 104px)' }}>
        {messages.map((m) =>
          m.role === 'user' ? (
            <div
              key={m.id}
              style={{
                alignSelf: 'flex-end', background: 'var(--navy-700)', color: 'var(--ink-050)',
                borderRadius: '16px 16px 4px 16px', padding: '13px 18px', fontSize: 15,
                lineHeight: 1.55, maxWidth: '80%', animation: 'mnfade .3s var(--ease-out)',
              }}
            >
              {m.content}
            </div>
          ) : (
            <div key={m.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', animation: 'mnfade .3s var(--ease-out)' }}>
              <img src="/logo-mark-light.png" alt="" style={{ height: 30, flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 15, lineHeight: 1.68, color: 'var(--ink-100)', whiteSpace: 'pre-wrap', paddingTop: 1 }}>
                {m.content}
              </div>
            </div>
          )
        )}

        {/* Thinking indicator */}
        {isLoading && (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <img src="/logo-mark-light.png" alt="" style={{ height: 30, flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 6, padding: '8px 0' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-300)', animation: 'mnblink 1.2s infinite' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-300)', animation: 'mnblink 1.2s infinite .2s' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-300)', animation: 'mnblink 1.2s infinite .4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Sticky input */}
      <div style={{ position: 'sticky', bottom: 0, background: 'linear-gradient(transparent, var(--surface-page) 32%)', padding: '14px 32px 22px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: 10, boxShadow: 'var(--shadow-card)' }}>
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Reply, or ask for something else…"
            onKeyDown={onKey}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: 'var(--ink-050)', fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.5, padding: '8px 10px', maxHeight: 150 }}
          />
          <button
            onClick={send}
            disabled={isLoading}
            style={{ background: isLoading ? 'var(--navy-600)' : 'var(--gold-500)', color: 'var(--navy-900)', border: 'none', borderRadius: 'var(--radius-md)', padding: '11px 22px', fontSize: 15, fontWeight: 600, cursor: isLoading ? 'default' : 'pointer', flexShrink: 0 }}
          >
            Send
          </button>
        </div>
        <div style={{ maxWidth: 820, margin: '8px auto 0', textAlign: 'center', fontSize: 12, color: 'var(--ink-500)' }}>
          Hermes proposes; you approve. Nothing happens without your say-so.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Products View
// ─────────────────────────────────────────────────────────────

function ProductsView() {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 40px 80px' }}>
      <div style={{ marginBottom: 8, fontSize: 13, letterSpacing: '.22em', color: 'var(--gold-400)', fontWeight: 500, textTransform: 'uppercase' }}>
        The House of Monarch
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, color: 'var(--text-heading)', margin: 0 }}>
        One founder. A portfolio of products.
      </h2>
      <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--text-body)', margin: '14px 0 0', maxWidth: 660 }}>
        Every product below is built and run inside Monarch. Some you can open right now; a few are on the way.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16, marginTop: 36 }}>
        {PRODUCTS.map((p) => {
          const s = statusMap(p.status);
          return (
            <div
              key={p.name}
              style={{
                background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
                padding: 24, display: 'flex', flexDirection: 'column', gap: 13, minHeight: 172,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-heading)' }}>{p.name}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${s.border}`, color: s.color, borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
                  {s.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--text-body)', lineHeight: 1.55, flex: 1 }}>{p.tagline}</p>
              <a
                href={`https://${p.domain}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 14, fontWeight: 500, color: 'var(--gold-400)' }}
              >
                {p.status === 'live' ? `Visit ${p.domain}` : p.domain} →
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Agents View
// ─────────────────────────────────────────────────────────────

function AgentsView({
  library,
  onAcquire,
  onOpenDetail,
  onViewChange,
}: {
  library: { name: string; kind: string; price: number; tagline: string }[];
  onAcquire: (kind: string, item: CardItem) => void;
  onOpenDetail: (item: CardItem & { kind: string }) => void;
  onViewChange: (v: View) => void;
}) {
  const inLib = (name: string) => library.some((x) => x.name === name);

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 40px 80px' }}>
      <div style={{ marginBottom: 8, fontSize: 13, letterSpacing: '.22em', color: 'var(--gold-400)', fontWeight: 500, textTransform: 'uppercase' }}>
        Agents
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, color: 'var(--text-heading)', margin: 0 }}>
        An agent for every domain
      </h2>
      <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--text-body)', margin: '14px 0 0', maxWidth: 660 }}>
        Purpose-built helpers from the Monarch house. Or skip the browsing — Hermes, the base agent, does a bit of everything.
      </p>

      {/* Hermes hero card */}
      <div style={{
        background: 'var(--navy-700)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-raised)',
        padding: 30, margin: '36px 0 16px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        <img src="/logo-mark-light.png" alt="" style={{ height: 62 }} />
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 25, color: 'var(--text-heading)' }}>Hermes</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--border-gold)', color: 'var(--gold-400)', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 500 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold-500)' }} />
              Base agent · Free
            </span>
          </div>
          <p style={{ margin: '9px 0 0', fontSize: 15, color: 'var(--blue-200)', lineHeight: 1.55 }}>
            Tell it what you want done. It plans, you approve, it does the work. Everything else here is Hermes with a specialty.
          </p>
        </div>
        <button
          onClick={() => onViewChange('chat')}
          style={{ background: 'var(--gold-500)', color: 'var(--navy-900)', border: 'none', borderRadius: 'var(--radius-md)', padding: '14px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
        >
          Start chatting
        </button>
      </div>

      {/* Agent cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {AGENTS.map((a) => {
          const s = statusMap(a.status);
          const owned = inLib(a.name);
          const priceLabel = a.price > 0 ? `$${a.price}` : 'Free';
          const actionLabel = owned ? undefined : (a.price > 0 ? `Buy $${a.price}` : 'Add');
          return (
            <div
              key={a.name}
              style={{
                background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
                padding: 22, display: 'flex', flexDirection: 'column', gap: 11, minHeight: 176,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div
                  onClick={() => onOpenDetail({ ...a, kind: 'agent' })}
                  style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-heading)', cursor: 'pointer' }}
                >
                  {a.name}
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${s.border}`, color: s.color, borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
                  {s.label}
                </span>
              </div>
              <p
                onClick={() => onOpenDetail({ ...a, kind: 'agent' })}
                style={{ margin: 0, fontSize: 14, color: 'var(--text-body)', lineHeight: 1.55, flex: 1, cursor: 'pointer' }}
              >
                {a.tagline}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 14, color: 'var(--ink-500)' }}>{priceLabel}</span>
                {owned ? (
                  <span style={{ fontSize: 14, color: 'var(--success)', fontWeight: 500 }}>✓ In library</span>
                ) : (
                  <button
                    onClick={() => onAcquire('agent', a)}
                    style={{
                      background: 'transparent', color: 'var(--ink-100)', border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)', padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-300)'; e.currentTarget.style.color = 'var(--blue-200)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--ink-100)'; }}
                  >
                    {actionLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skills View
// ─────────────────────────────────────────────────────────────

function SkillsView({
  library,
  onAcquire,
  onOpenDetail,
}: {
  library: { name: string; kind: string; price: number; tagline: string }[];
  onAcquire: (kind: string, item: CardItem) => void;
  onOpenDetail: (item: CardItem & { kind: string }) => void;
}) {
  const [catFilter, setCatFilter] = useState('All');
  const inLib = (name: string) => library.some((x) => x.name === name);

  const filtered = catFilter === 'All' ? SKILLS : SKILLS.filter((s) => s.cat === catFilter);

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 40px 80px' }}>
      <div style={{ marginBottom: 8, fontSize: 13, letterSpacing: '.22em', color: 'var(--gold-400)', fontWeight: 500, textTransform: 'uppercase' }}>
        Skills
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, color: 'var(--text-heading)', margin: 0 }}>
        Teach your agent new tricks
      </h2>
      <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--text-body)', margin: '14px 0 0', maxWidth: 660 }}>
        Skills are ready-made abilities. Download a free one or buy a premium one — your agent knows how to do it instantly. No setup, no jargon.
      </p>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, margin: '32px 0 24px', flexWrap: 'wrap' }}>
        {SKILL_CATEGORIES.map((c) => {
          const active = c === catFilter;
          return (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              style={{
                cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                padding: '7px 16px', borderRadius: 'var(--radius-pill)',
                border: active ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                background: active ? 'rgba(212,175,55,.08)' : 'transparent',
                color: active ? 'var(--gold-400)' : 'var(--ink-300)',
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Skill cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {filtered.map((s) => {
          const owned = inLib(s.name);
          return (
            <div
              key={s.name}
              style={{
                background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
                padding: 22, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 170,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div
                  onClick={() => onOpenDetail({ ...s, kind: 'skill' })}
                  style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-heading)', cursor: 'pointer' }}
                >
                  {s.name}
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>by {s.by}</span>
              </div>
              <p
                onClick={() => onOpenDetail({ ...s, kind: 'skill' })}
                style={{ margin: 0, fontSize: 14, color: 'var(--text-body)', lineHeight: 1.55, flex: 1, cursor: 'pointer' }}
              >
                {s.desc}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 2 }}>
                <span style={{ fontSize: 12, letterSpacing: '.05em', color: 'var(--ink-500)' }}>
                  {s.cat} · {s.price > 0 ? `$${s.price}` : 'Free'}
                </span>
                {owned ? (
                  <span style={{ fontSize: 14, color: 'var(--success)', fontWeight: 500 }}>✓ In library</span>
                ) : (
                  <button
                    onClick={() => onAcquire('skill', s)}
                    style={{
                      background: 'transparent', color: 'var(--ink-100)', border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)', padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-300)'; e.currentTarget.style.color = 'var(--blue-200)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--ink-100)'; }}
                  >
                    {s.price > 0 ? `Buy $${s.price}` : 'Download'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Library View
// ─────────────────────────────────────────────────────────────

function LibraryView({
  library,
  onViewChange,
  onToast,
}: {
  library: { name: string; kind: string; price: number; tagline: string }[];
  onViewChange: (v: View) => void;
  onToast: (msg: string) => void;
}) {
  if (library.length === 0) {
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 40px 80px' }}>
        <div style={{ marginBottom: 8, fontSize: 13, letterSpacing: '.22em', color: 'var(--gold-400)', fontWeight: 500, textTransform: 'uppercase' }}>
          Your library
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, color: 'var(--text-heading)', margin: 0 }}>
          Everything you own
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--text-body)', margin: '14px 0 0', maxWidth: 660 }}>
          Agents and skills you've added. Open an agent to start, or download a skill to use it anywhere.
        </p>
        <div style={{ marginTop: 44, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '56px 32px', textAlign: 'center' }}>
          <img src="/logo-mark-light.png" alt="" style={{ height: 56, opacity: .6 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-100)', margin: '18px 0 6px' }}>
            Nothing here yet
          </div>
          <p style={{ fontSize: 15, color: 'var(--ink-500)', margin: '0 0 22px' }}>
            Add a skill or an agent and it'll show up here, ready to use.
          </p>
          <button
            onClick={() => onViewChange('skills')}
            style={{ background: 'var(--gold-500)', color: 'var(--navy-900)', border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 26px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Browse skills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 40px 80px' }}>
      <div style={{ marginBottom: 8, fontSize: 13, letterSpacing: '.22em', color: 'var(--gold-400)', fontWeight: 500, textTransform: 'uppercase' }}>
        Your library
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, color: 'var(--text-heading)', margin: 0 }}>
        Everything you own
      </h2>
      <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--text-body)', margin: '14px 0 0', maxWidth: 660 }}>
        Agents and skills you've added. Open an agent to start, or download a skill to use it anywhere.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14, marginTop: 36 }}>
        {library.map((item) => (
          <div
            key={item.name}
            style={{
              background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
              padding: 22, display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-heading)' }}>{item.name}</div>
              <span style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold-400)' }}>
                {item.kind === 'agent' ? 'Agent' : 'Skill'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-body)', lineHeight: 1.5, flex: 1 }}>{item.tagline}</p>
            <button
              onClick={() => {
                if (item.kind === 'agent') onViewChange('chat');
                else onToast(`Downloading "${item.name}"…`);
              }}
              style={{
                background: 'transparent', color: 'var(--ink-100)', border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)', padding: '9px 0', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', width: '100%',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-300)'; e.currentTarget.style.color = 'var(--blue-200)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--ink-100)'; }}
            >
              {item.kind === 'agent' ? 'Open agent' : 'Download'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────────────────────

function DetailModal({
  detail,
  library,
  onClose,
  onAcquire,
}: {
  detail: (CardItem & { kind: string; by?: string }) | null;
  library: { name: string; kind: string; price: number; tagline: string }[];
  onClose: () => void;
  onAcquire: (kind: string, item: CardItem) => void;
}) {
  if (!detail) return null;

  const kindLabel = detail.kind === 'agent' ? 'Agent' : 'Skill';
  const priceLabel = detail.price > 0 ? `$${detail.price}` : 'Free';
  const priceNote = detail.price > 0 ? 'One-time — yours to keep' : (detail.kind === 'skill' ? 'Free download' : 'Free to add');
  const owned = library.some((x) => x.name === detail.name);
  const actionLabel = detail.price > 0 ? `Buy $${detail.price}` : (detail.kind === 'skill' ? 'Download' : 'Add');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(6,13,31,.74)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24, zIndex: 50, animation: 'mnfade .2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-card)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-raised)',
          maxWidth: 520, width: '100%', padding: 34, animation: 'mnpop .25s var(--ease-out)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-400)' }}>
            {kindLabel}{detail.by ? ` · by ${detail.by}` : ''}
          </span>
          <span onClick={onClose} style={{ cursor: 'pointer', color: 'var(--ink-500)', fontSize: 22, lineHeight: 1 }}>
            ×
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 27, color: 'var(--text-heading)', margin: '12px 0 0' }}>
          {detail.name}
        </h3>
        <p style={{ fontSize: 15, color: 'var(--blue-200)', margin: '8px 0 0', lineHeight: 1.5 }}>
          {detail.tagline}
        </p>
        {detail.about && (
          <p style={{ fontSize: 15, color: 'var(--text-body)', margin: '16px 0 0', lineHeight: 1.65 }}>
            {detail.about}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 26, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-heading)' }}>{priceLabel}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{priceNote}</div>
          </div>
          {owned ? (
            <span style={{ fontSize: 15, color: 'var(--success)', fontWeight: 500 }}>✓ In your library</span>
          ) : (
            <button
              onClick={() => onAcquire(detail.kind, detail)}
              style={{ background: 'var(--gold-500)', color: 'var(--navy-900)', border: 'none', borderRadius: 'var(--radius-md)', padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)',
        background: 'var(--navy-700)', color: 'var(--ink-050)',
        border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-pill)',
        padding: '12px 24px', fontSize: 14, boxShadow: 'var(--shadow-raised)',
        zIndex: 60, animation: 'mnpop .25s var(--ease-out)',
      }}
    >
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────

export default function Home() {
  const [view, setView] = useState<View>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [library, setLibrary] = useState(loadLib);
  const [toast, setToast] = useState<string | null>(null);
  const [detail, setDetail] = useState<(CardItem & { kind: string; by?: string }) | null>(null);

  const toastT = useRef<NodeJS.Timeout>();

  const flash = (msg: string) => {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2600);
  };

  const inLib = (name: string) => library.some((x) => x.name === name);

  const handleAcquire = (kind: string, item: CardItem) => {
    if (inLib(item.name)) { setDetail(null); return; }
    const tagline = item.tagline || '';
    const newLib = [...library, { name: item.name, kind, price: item.price || 0, tagline }];
    setLibrary(newLib);
    saveLib(newLib);
    setDetail(null);

    let msg: string;
    if (item.price > 0) msg = `Purchased — "${item.name}" is in your library.`;
    else if (kind === 'skill') msg = `Downloaded — "${item.name}" is in your library.`;
    else msg = `Added "${item.name}" to your library.`;
    flash(msg);
  };

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, system: HERMES_PROMPT }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.response || data.message || "I'm here — tell me a little more and I'll make a plan.";
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: typeof replyText === 'string' ? replyText : JSON.stringify(replyText),
          timestamp: new Date(),
        }]);
      } else {
        throw new Error('API error');
      }
    } catch {
      // Graceful fallback — Hermes-style plan response
      const fallback = `Great idea! Here's how I'd tackle it:\n\n1. Start by gathering what we need — your details, preferences, and any deadlines.\n2. I'll lay out the options clearly, with the pros and cons of each.\n3. Once you pick the path, I'll get everything lined up step by step.\n4. Before anything happens in the real world, I'll show you exactly what's about to go out — you give the final yes.\n\nTake a look and tell me what you think. Want to adjust anything?`;
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallback,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activeView={view}
        onViewChange={setView}
        libraryCount={library.length}
      />
      <main style={{ flex: 1, minWidth: 0 }}>
        {view === 'chat' && (
          <ChatView
            messages={messages}
            onSend={handleSend}
            isLoading={isLoading}
          />
        )}
        {view === 'products' && <ProductsView />}
        {view === 'agents' && (
          <AgentsView
            library={library}
            onAcquire={handleAcquire}
            onOpenDetail={(item) => setDetail(item)}
            onViewChange={setView}
          />
        )}
        {view === 'skills' && (
          <SkillsView
            library={library}
            onAcquire={handleAcquire}
            onOpenDetail={(item) => setDetail(item)}
          />
        )}
        {view === 'library' && (
          <LibraryView
            library={library}
            onViewChange={setView}
            onToast={flash}
          />
        )}
      </main>

      <DetailModal
        detail={detail}
        library={library}
        onClose={() => setDetail(null)}
        onAcquire={handleAcquire}
      />

      <Toast message={toast} />
    </div>
  );
}
