'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockChatMessages } from '@/lib/mockData';
import { Send, Paperclip, Search, ChevronDown, Bot, User as UserIcon, FileText, LayoutTemplate, MoreHorizontal } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState(mockChatMessages);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('GPT-4o Enterprise');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const submitQuery = async (query: string) => {
    if (!query.trim() || isTyping) return;

    const newMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/nextapi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        sources: data.sources || [],
        timestamp: new Date().toISOString()
      }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Lo siento, hubo un error al conectar con el servidor de IA. \n\n**Detalle técnico:** \`${err.message}\``,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuery(input);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ padding: '0 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Asistente IA RAG</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Consulta tus documentos en lenguaje natural</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="card" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        background: 'var(--bg-card)',
        position: 'relative'
      }}>
        
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
            
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '20vh', color: 'var(--text-tertiary)' }}>
                <Bot size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>¿Qué tienes en mente hoy?</h3>
                <p>Haz una pregunta sobre tus documentos o datos indexados.</p>
              </div>
            )}

            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: '16px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
              >
                <div style={{ 
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? 'var(--gradient-accent)' : 'var(--bg-tertiary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  border: msg.role === 'assistant' ? '1px solid var(--border-primary)' : 'none'
                }}>
                  {msg.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                </div>

                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    padding: '14px 18px', 
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'transparent',
                    border: msg.role === 'assistant' ? 'none' : '1px solid var(--border-primary)',
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    boxShadow: msg.role === 'user' ? 'var(--shadow-sm)' : 'none'
                  }}>
                    {/* Render simple markdown-like content */}
                    {msg.content.split('\n').map((line, i) => {
                      if (line.startsWith('|')) {
                        // Very basic table render simulation
                        return <div key={i} style={{ fontFamily: 'monospace', fontSize: 13, padding: '4px 0' }}>{line}</div>;
                      }
                      return <p key={i} style={{ marginBottom: line.trim() ? 8 : 0 }}>{line.replace(/\*\*/g, '')}</p>;
                    })}
                  </div>

                  {/* Render Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {msg.sources.map((src, i) => (
                        <div key={i} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8,
                          background: 'var(--accent-light)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          fontSize: 12, fontWeight: 500, color: 'var(--accent)'
                        }}>
                          <FileText size={12} />
                          {src.docName}
                          {src.page && <span style={{ opacity: 0.7 }}> (p. {src.page})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} />
                </div>
                <div style={{ padding: '14px 18px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div className="status-dot processing" style={{ background: 'var(--text-tertiary)' }} />
                  <div className="status-dot processing" style={{ background: 'var(--text-tertiary)', animationDelay: '0.2s' }} />
                  <div className="status-dot processing" style={{ background: 'var(--text-tertiary)', animationDelay: '0.4s' }} />
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div style={{ padding: '0 32px 32px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          
          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { icon: FileText, label: '¿Cual es la estructura general de archivos?' },
              { icon: Search, label: '¿Como se hace un plan de facilidades?' },
              { icon: LayoutTemplate, label: '¿Como se genera un CAI para resguardo?' },
              { icon: UserIcon, label: '¿Quien es FERNANDEZ DAIANA?' }
            ].map((action, i) => (
              <button key={i} type="button" onClick={() => submitQuery(action.label)} className="btn-ghost" style={{ 
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', 
                borderRadius: 100, fontSize: 12, padding: '6px 14px', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
              }}>
                <action.icon size={14} /> {action.label}
              </button>
            ))}
          </div>

          {/* Floating Pill Input */}
          <form onSubmit={handleSend} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-secondary)',
            borderRadius: 32,
            padding: '8px 12px 8px 24px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta a la IA sobre tus documentos..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 15
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button type="button" className="tooltip" data-tooltip="Adjuntar" style={{ 
                width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Paperclip size={18} />
              </button>
              
              {/* Model Selector */}
              <button type="button" style={{ 
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: 16, border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}>
                {model} <ChevronDown size={14} />
              </button>

              <button type="submit" disabled={!input.trim() || isTyping} style={{ 
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: input.trim() ? 'var(--accent)' : 'var(--bg-hover)',
                color: input.trim() ? 'white' : 'var(--text-tertiary)',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                <Send size={18} style={{ marginLeft: 2 }} />
              </button>
            </div>
          </form>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              La IA puede cometer errores. Verifica la información usando las fuentes citadas.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
