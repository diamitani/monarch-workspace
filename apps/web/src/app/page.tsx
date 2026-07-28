'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  FolderKanban,
  Bot,
  Wrench,
  Library,
  Settings,
  ChevronRight,
  Send,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type View = 'chat' | 'projects' | 'agents' | 'tools' | 'library';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Plan {
  id: string;
  objective: string;
  steps: PlanStep[];
  status: 'draft' | 'approved' | 'running' | 'complete' | 'failed';
}

interface PlanStep {
  id: string;
  title: string;
  description: string;
  risk: 'safe' | 'consequential';
  status: 'pending' | 'running' | 'complete' | 'failed' | 'awaiting_approval';
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'complete';
  lastActivity: Date;
  plans: Plan[];
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
  status: 'available' | 'busy';
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  riskLevel: 'safe' | 'consequential';
  enabled: boolean;
}

// ─────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────

const MOCK_AGENTS: Agent[] = [
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Finds information, compares options, synthesizes knowledge',
    icon: '🔍',
    capabilities: ['web search', 'document analysis', 'comparison tables'],
    status: 'available',
  },
  {
    id: 'planner',
    name: 'Planner',
    description: 'Breaks goals into actionable steps with clear milestones',
    icon: '📋',
    capabilities: ['task breakdown', 'timeline creation', 'dependency mapping'],
    status: 'available',
  },
  {
    id: 'writer',
    name: 'Writer',
    description: 'Drafts emails, documents, messages in your voice',
    icon: '✍️',
    capabilities: ['email drafting', 'document writing', 'editing'],
    status: 'available',
  },
  {
    id: 'scheduler',
    name: 'Scheduler',
    description: 'Manages calendar, books appointments, sends reminders',
    icon: '📅',
    capabilities: ['calendar management', 'booking', 'reminders'],
    status: 'available',
  },
  {
    id: 'organizer',
    name: 'Organizer',
    description: 'Sorts files, creates folders, maintains structure',
    icon: '📁',
    capabilities: ['file organization', 'tagging', 'archiving'],
    status: 'busy',
  },
];

const MOCK_TOOLS: Tool[] = [
  { id: 'web-search', name: 'Web Search', description: 'Search the internet for information', category: 'Research', riskLevel: 'safe', enabled: true },
  { id: 'email-read', name: 'Read Email', description: 'Access and read your emails', category: 'Communication', riskLevel: 'safe', enabled: true },
  { id: 'email-send', name: 'Send Email', description: 'Send emails on your behalf', category: 'Communication', riskLevel: 'consequential', enabled: true },
  { id: 'calendar-read', name: 'View Calendar', description: 'See your schedule', category: 'Scheduling', riskLevel: 'safe', enabled: true },
  { id: 'calendar-write', name: 'Book Meetings', description: 'Schedule appointments', category: 'Scheduling', riskLevel: 'consequential', enabled: false },
  { id: 'files-read', name: 'Read Files', description: 'Access your documents', category: 'Files', riskLevel: 'safe', enabled: true },
  { id: 'files-write', name: 'Create Files', description: 'Create and edit documents', category: 'Files', riskLevel: 'consequential', enabled: true },
  { id: 'purchase', name: 'Make Purchases', description: 'Buy items online', category: 'Commerce', riskLevel: 'consequential', enabled: false },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Chicago Move',
    description: 'Planning relocation to Chicago in March',
    status: 'active',
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    plans: [
      {
        id: 'plan1',
        objective: 'Research neighborhoods in Chicago',
        status: 'complete',
        steps: [
          { id: 's1', title: 'List key criteria (commute, safety, budget)', description: '', risk: 'safe', status: 'complete' },
          { id: 's2', title: 'Research top 5 neighborhoods', description: '', risk: 'safe', status: 'complete' },
          { id: 's3', title: 'Create comparison table', description: '', risk: 'safe', status: 'complete' },
        ],
      },
    ],
  },
  {
    id: 'p2',
    name: 'Wedding Budget',
    description: 'Track expenses for Sarah\'s wedding',
    status: 'active',
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
    plans: [],
  },
];

const QUICK_PROMPTS = [
  'Help me plan my move to Chicago',
  'Organize my job search',
  'Create a budget for the wedding',
  'Research vacation options for spring',
];

// ─────────────────────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ─────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────

function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Crown/Monarch symbol */}
      <path
        d="M50 15L65 35L80 25L75 55H25L20 25L35 35L50 15Z"
        fill="var(--gold-500)"
        stroke="var(--gold-400)"
        strokeWidth="2"
      />
      <path
        d="M25 55H75V65C75 70 70 75 65 75H35C30 75 25 70 25 65V55Z"
        fill="var(--gold-500)"
      />
      {/* Jewels */}
      <circle cx="35" cy="42" r="4" fill="var(--navy-900)" />
      <circle cx="50" cy="38" r="5" fill="var(--navy-900)" />
      <circle cx="65" cy="42" r="4" fill="var(--navy-900)" />
    </svg>
  );
}

function Sidebar({
  activeView,
  onViewChange,
  projects,
}: {
  activeView: View;
  onViewChange: (v: View) => void;
  projects: Project[];
}) {
  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={18} /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={18} /> },
    { id: 'agents', label: 'Agents', icon: <Bot size={18} /> },
    { id: 'tools', label: 'Tools', icon: <Wrench size={18} /> },
    { id: 'library', label: 'Library', icon: <Library size={18} /> },
  ];

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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '4px 8px 20px',
          cursor: 'pointer',
        }}
        onClick={() => onViewChange('chat')}
      >
        <Logo />
        <span
          style={{
            fontSize: 15,
            letterSpacing: '.30em',
            color: 'var(--ink-050)',
            fontWeight: 500,
          }}
        >
          MONARCH
        </span>
      </div>

      {/* Navigation */}
      <div
        style={{
          padding: '0 10px 10px',
          fontSize: 11,
          letterSpacing: '.22em',
          color: 'var(--ink-500)',
          textTransform: 'uppercase',
        }}
      >
        Menu
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => (
          <a
            key={item.id}
            onClick={() => onViewChange(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 13px',
              borderRadius: 'var(--radius-md)',
              fontSize: 15,
              cursor: 'pointer',
              color: activeView === item.id ? 'var(--ink-050)' : 'var(--ink-300)',
              background: activeView === item.id ? 'var(--navy-800)' : 'transparent',
              fontWeight: activeView === item.id ? 600 : 500,
              transition: 'all 0.15s',
            }}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>

      {/* Recent Projects */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div
          style={{
            padding: '0 10px 8px',
            fontSize: 11,
            letterSpacing: '.22em',
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
          }}
        >
          Recent
        </div>
        {projects.slice(0, 3).map((p) => (
          <a
            key={p.id}
            onClick={() => onViewChange('projects')}
            style={{
              padding: '8px 10px',
              fontSize: 14,
              color: 'var(--ink-300)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            {p.name}
          </a>
        ))}
      </div>

      {/* Pro Upgrade CTA */}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <div
          style={{
            background: 'var(--navy-700)',
            borderRadius: 'var(--radius-lg)',
            padding: 16,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17,
              color: 'var(--ink-050)',
            }}
          >
            Monarch Pro
          </div>
          <p
            style={{
              margin: '5px 0 12px',
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--blue-200)',
            }}
          >
            Every agent, unlimited help, all your tools.
          </p>
          <button
            style={{
              width: '100%',
              background: 'var(--gold-500)',
              color: 'var(--navy-900)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '9px 0',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Upgrade
          </button>
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '2px 6px' }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--navy-700)',
              color: 'var(--gold-400)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
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

function ChatView({
  messages,
  onSend,
  isLoading,
  currentPlan,
  onApprovePlan,
  onApproveStep,
}: {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading: boolean;
  currentPlan: Plan | null;
  onApprovePlan: () => void;
  onApproveStep: (stepId: string) => void;
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  // Empty state
  if (messages.length === 0 && !currentPlan) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '56px 32px',
        }}
      >
        <Logo size={78} />
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            letterSpacing: '.06em',
            color: 'var(--gold-400)',
            marginTop: 22,
          }}
        >
          Good to see you, Pat.
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.1,
            color: 'var(--text-heading)',
            margin: '8px 0 10px',
            textAlign: 'center',
            maxWidth: 620,
          }}
        >
          What can I help you with today?
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--ink-500)',
            margin: '0 0 30px',
            textAlign: 'center',
            maxWidth: 520,
          }}
        >
          Describe what you need done. I'll make a plan — and nothing happens until you approve it.
        </p>

        {/* Input */}
        <div
          style={{
            width: '100%',
            maxWidth: 680,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-end',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: 12,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="What do you need done?"
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--ink-050)',
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              lineHeight: 1.5,
              padding: '9px 10px',
              maxHeight: 150,
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            style={{
              background: input.trim() ? 'var(--gold-500)' : 'var(--navy-700)',
              color: input.trim() ? 'var(--navy-900)' : 'var(--ink-500)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 600,
              cursor: input.trim() ? 'pointer' : 'default',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send'}
          </button>
        </div>

        {/* Quick prompts */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 20,
            maxWidth: 680,
          }}
        >
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
                textareaRef.current?.focus();
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--ink-300)',
                borderRadius: 'var(--radius-pill)',
                padding: '9px 17px',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Chat with messages
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: 24,
                display: 'flex',
                gap: 12,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--gold-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={16} color="var(--navy-900)" />
                </div>
              )}
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background:
                    msg.role === 'user' ? 'var(--gold-500)' : 'var(--surface-card)',
                  color: msg.role === 'user' ? 'var(--navy-900)' : 'var(--ink-100)',
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Plan display */}
          {currentPlan && (
            <div
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                marginTop: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--gold-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={14} color="var(--navy-900)" />
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    color: 'var(--ink-050)',
                    fontWeight: 500,
                  }}
                >
                  Plan: {currentPlan.objective}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentPlan.steps.map((step, i) => (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'var(--navy-800)',
                      borderRadius: 'var(--radius-md)',
                      border:
                        step.risk === 'consequential'
                          ? '1px solid var(--gold-500)'
                          : '1px solid transparent',
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background:
                          step.status === 'complete'
                            ? 'var(--gold-500)'
                            : step.status === 'running'
                            ? 'var(--blue-400)'
                            : 'var(--navy-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: 12,
                        color:
                          step.status === 'complete' || step.status === 'running'
                            ? 'var(--navy-900)'
                            : 'var(--ink-400)',
                      }}
                    >
                      {step.status === 'complete' ? (
                        <CheckCircle2 size={14} />
                      ) : step.status === 'running' ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          color: 'var(--ink-100)',
                          fontWeight: 500,
                        }}
                      >
                        {step.title}
                      </div>
                      {step.risk === 'consequential' && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 6,
                            padding: '3px 8px',
                            background: 'rgba(198, 162, 71, 0.15)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 11,
                            color: 'var(--gold-400)',
                            fontWeight: 500,
                          }}
                        >
                          <AlertCircle size={12} />
                          Requires approval
                        </div>
                      )}
                    </div>
                    {step.status === 'awaiting_approval' && (
                      <button
                        onClick={() => onApproveStep(step.id)}
                        style={{
                          background: 'var(--gold-500)',
                          color: 'var(--navy-900)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Approve
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {currentPlan.status === 'draft' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button
                    onClick={onApprovePlan}
                    style={{
                      flex: 1,
                      background: 'var(--gold-500)',
                      color: 'var(--navy-900)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 0',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Start Plan
                  </button>
                  <button
                    style={{
                      padding: '12px 20px',
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--ink-300)',
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--gold-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Loader2 size={16} color="var(--navy-900)" className="animate-spin" />
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  background: 'var(--surface-card)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--ink-400)',
                  fontSize: 14,
                }}
              >
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 32px',
          background: 'var(--surface-bg)',
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-end',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: 12,
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message..."
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--ink-050)',
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              lineHeight: 1.5,
              padding: '8px 10px',
              maxHeight: 150,
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            style={{
              background: input.trim() ? 'var(--gold-500)' : 'var(--navy-700)',
              color: input.trim() ? 'var(--navy-900)' : 'var(--ink-500)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectsView({ projects, onCreateProject, onSelectProject }: { 
  projects: Project[]; 
  onCreateProject: (name: string, description: string) => void;
  onSelectProject: (project: Project) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateProject(newName.trim(), newDesc.trim());
      setNewName('');
      setNewDesc('');
      setShowModal(false);
    }
  };

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-050)', fontWeight: 500 }}>
            Projects
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-400)', marginTop: 4 }}>
            {projects.length} active projects
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--gold-500)',
            color: 'var(--navy-900)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 17, color: 'var(--ink-050)', fontWeight: 500 }}>{project.name}</h3>
              <span
                style={{
                  padding: '4px 10px',
                  background: project.status === 'active' ? 'rgba(96, 165, 250, 0.15)' : 'var(--navy-800)',
                  color: project.status === 'active' ? 'var(--blue-400)' : 'var(--ink-400)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {project.status}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-400)', marginBottom: 16, lineHeight: 1.5 }}>
              {project.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-500)' }}>
              <Clock size={14} />
              {formatTimeAgo(project.lastActivity)}
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 28,
              width: '100%',
              maxWidth: 440,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, color: 'var(--ink-050)', fontWeight: 500 }}>New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--ink-400)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-300)', marginBottom: 6 }}>
                Project Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Website Redesign"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--navy-800)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--ink-100)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-300)', marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description of the project..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--navy-800)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--ink-100)',
                  fontSize: 14,
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--ink-300)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: newName.trim() ? 'var(--gold-500)' : 'var(--navy-700)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: newName.trim() ? 'var(--navy-900)' : 'var(--ink-500)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: newName.trim() ? 'pointer' : 'default',
                }}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentsView({ agents }: { agents: Agent[] }) {
  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-050)', fontWeight: 500 }}>
          Agents
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-400)', marginTop: 4 }}>
          Specialized helpers that execute your plans
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {agents.map((agent) => (
          <div
            key={agent.id}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{agent.icon}</span>
              <div>
                <h3 style={{ fontSize: 16, color: 'var(--ink-050)', fontWeight: 500 }}>{agent.name}</h3>
                <span
                  style={{
                    fontSize: 11,
                    color: agent.status === 'available' ? 'var(--gold-400)' : 'var(--ink-500)',
                    fontWeight: 500,
                  }}
                >
                  {agent.status === 'available' ? '● Available' : '○ Busy'}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-400)', marginBottom: 14, lineHeight: 1.5 }}>
              {agent.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  style={{
                    padding: '4px 10px',
                    background: 'var(--navy-800)',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 12,
                    color: 'var(--ink-300)',
                  }}
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolsView({ tools, onToggleTool }: { tools: Tool[]; onToggleTool: (id: string) => void }) {
  const categories = Array.from(new Set(tools.map((t) => t.category)));

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-050)', fontWeight: 500 }}>
          Tools
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-400)', marginTop: 4 }}>
          Capabilities agents can use to help you
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, color: 'var(--ink-400)', fontWeight: 500, marginBottom: 12 }}>{category}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tools
              .filter((t) => t.category === category)
              .map((tool) => (
                <div
                  key={tool.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, color: 'var(--ink-100)', fontWeight: 500 }}>{tool.name}</span>
                      {tool.riskLevel === 'consequential' && (
                        <span
                          style={{
                            padding: '2px 8px',
                            background: 'rgba(198, 162, 71, 0.15)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 10,
                            color: 'var(--gold-400)',
                            fontWeight: 500,
                          }}
                        >
                          APPROVAL REQUIRED
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ink-400)', marginTop: 2 }}>{tool.description}</p>
                  </div>
                  <button
                    onClick={() => onToggleTool(tool.id)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      border: 'none',
                      background: tool.enabled ? 'var(--gold-500)' : 'var(--navy-700)',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: 3,
                        left: tool.enabled ? 23 : 3,
                        transition: 'all 0.2s',
                      }}
                    />
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LibraryView() {
  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-050)', fontWeight: 500 }}>
          Library
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-400)', marginTop: 4 }}>
          Saved plans, templates, and knowledge
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          background: 'var(--surface-card)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Library size={48} color="var(--ink-500)" strokeWidth={1.5} />
        <p style={{ fontSize: 16, color: 'var(--ink-400)', marginTop: 16, textAlign: 'center' }}>
          Your library is empty
        </p>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', marginTop: 4, textAlign: 'center' }}>
          Save plans and templates from your conversations to reuse them later.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────

export default function Home() {
  const [view, setView] = useState<View>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [agents] = useState<Agent[]>(MOCK_AGENTS);
  const [tools, setTools] = useState<Tool[]>(MOCK_TOOLS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();

      // Check if response includes a plan
      if (data.plan) {
        setCurrentPlan(data.plan);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || "I've created a plan for you. Review the steps below.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      // Demo fallback - create a mock plan
      const mockPlan: Plan = {
        id: Date.now().toString(),
        objective: text,
        status: 'draft',
        steps: [
          { id: '1', title: 'Research and gather information', description: '', risk: 'safe', status: 'pending' },
          { id: '2', title: 'Create initial outline', description: '', risk: 'safe', status: 'pending' },
          { id: '3', title: 'Draft detailed plan', description: '', risk: 'safe', status: 'pending' },
          { id: '4', title: 'Review and finalize', description: '', risk: 'consequential', status: 'pending' },
        ],
      };
      setCurrentPlan(mockPlan);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I've created a plan to help you. Review the steps below and click 'Start Plan' when ready.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePlan = () => {
    if (!currentPlan) return;
    setCurrentPlan((prev) => (prev ? { ...prev, status: 'running' } : null));
    // Simulate running steps
    let stepIndex = 0;
    const interval = setInterval(() => {
      setCurrentPlan((prev) => {
        if (!prev) return null;
        const newSteps = [...prev.steps];
        if (stepIndex < newSteps.length) {
          if (newSteps[stepIndex].risk === 'consequential') {
            newSteps[stepIndex].status = 'awaiting_approval';
          } else {
            newSteps[stepIndex].status = 'complete';
            stepIndex++;
          }
        }
        return { ...prev, steps: newSteps };
      });
      if (stepIndex >= (currentPlan?.steps.length || 0)) {
        clearInterval(interval);
      }
    }, 1500);
  };

  const handleApproveStep = (stepId: string) => {
    setCurrentPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map((s) =>
          s.id === stepId ? { ...s, status: 'complete' } : s
        ),
      };
    });
  };

  const handleCreateProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description: description || `New project: ${name}`,
      status: 'active',
      lastActivity: new Date(),
      plans: [],
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    // Switch to chat with project context
    setView('chat');
    setMessages([{
      id: Date.now().toString(),
      role: 'system',
      content: `Now working on project: ${project.name}`,
      timestamp: new Date(),
    }]);
  };

  const handleToggleTool = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeView={view} onViewChange={setView} projects={projects} />
      <main style={{ flex: 1, minWidth: 0 }}>
        {view === 'chat' && (
          <ChatView
            messages={messages}
            onSend={handleSend}
            isLoading={isLoading}
            currentPlan={currentPlan}
            onApprovePlan={handleApprovePlan}
            onApproveStep={handleApproveStep}
          />
        )}
        {view === 'projects' && (
          <ProjectsView 
            projects={projects} 
            onCreateProject={handleCreateProject}
            onSelectProject={handleSelectProject}
          />
        )}
        {view === 'agents' && <AgentsView agents={agents} />}
        {view === 'tools' && <ToolsView tools={tools} onToggleTool={handleToggleTool} />}
        {view === 'library' && <LibraryView />}
      </main>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
