import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageSquare, Send, Copy, Check, Download, FileText, Sun, Moon, Settings, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const CU_COLORS = {
  primary: '#008556',
  secondary: '#D4AF37',
  accent: '#00A86B',
  dark: '#1a1a2e',
  light: '#f5f5f5',
  lightGreen: '#E8F5E9'
};

const CU_COLORS_DARK = {
  primary: '#00a86b',
  secondary: '#fbbf24',
  accent: '#34d399',
  dark: '#0f172a',
  light: '#1e293b',
  surface: '#334155',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1'
};

const API_URL = 'http://localhost:3001/api';

const AppUser = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callBackendAPI = useCallback(async (message) => {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userId: 'user-001',
          conversationId: 'default'
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          content: data.response,
          sources: data.sources || []
        };
      } else {
        return {
          content: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.',
          sources: []
        };
      }
    } catch (error) {
      console.error('Error calling backend:', error);
      return {
        content: 'Lo siento, no puedo conectarme al servidor en este momento. Por favor, verifica que el servidor esté activo.',
        sources: []
      };
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage.trim();
    const userMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const result = await callBackendAPI(messageToSend);
      
      const botMessage = {
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }),
        sources: result.sources
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error en handleSendMessage:', error);
    } finally {
      setIsLoading(false);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [inputMessage, isLoading, callBackendAPI]);

  const handleCopyMessage = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const handleDownloadDocument = async (documentName) => {
    try {
      console.log('📥 Descargando documento:', documentName);
      
      const response = await fetch(`${API_URL}/documents/download/${encodeURIComponent(documentName)}`);
      
      if (!response.ok) {
        throw new Error('Error al descargar el documento');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Descarga iniciada:', documentName);
      
    } catch (error) {
      console.error('❌ Error al descargar documento:', error);
      alert('No se pudo descargar el documento. Por favor, intenta de nuevo.');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInputMessage('');
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" 
         style={{ backgroundColor: darkMode ? colors.dark : colors.light }}>
      
      <header className="border-b p-4 flex items-center justify-between"
              style={{ 
                borderColor: darkMode ? colors.surface : '#e5e7eb',
                backgroundColor: darkMode ? colors.light : 'white'
              }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
               style={{ backgroundColor: colors.primary }}>
            <MessageSquare size={24} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
              Cooperativa Universitaria
            </h1>
            <p className="text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              Asistente Virtual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-opacity-10"
              style={{ 
                borderColor: colors.primary + '40',
                color: colors.primary
              }}
              title="Limpiar conversación"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline text-sm">Limpiar</span>
            </button>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg transition-all hover:bg-opacity-10"
            style={{ color: colors.primary }}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-opacity-10"
            style={{ 
              borderColor: colors.primary + '40',
              color: colors.primary
            }}
            title="Panel de administración"
          >
            <Settings size={18} />
            <span className="hidden sm:inline text-sm">Admin</span>
          </button> */}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                 style={{ backgroundColor: colors.primary + '20' }}>
              <MessageSquare size={40} style={{ color: colors.primary }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: darkMode ? colors.text : colors.dark }}>
              ¡Bienvenido al Asistente CU!
            </h3>
            <p className="max-w-md mx-auto mb-6" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              Estoy aquí para ayudarte con consultas sobre manuales, políticas y procedimientos de la Cooperativa Universitaria.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mt-6">
              {[
                '¿Cómo aperturar una cuenta de ahorros?',
                '¿Cuáles son los requisitos para un crédito personal?',
                '¿Qué beneficios tienen los socios?',
                '¿Cuál es el plazo máximo de amortización?'
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(q)}
                  className="p-3 text-left rounded-lg border-2 hover:shadow-md transition-all text-sm"
                  style={{ 
                    borderColor: colors.primary + '40',
                    backgroundColor: darkMode ? colors.light : 'white',
                    color: darkMode ? colors.text : colors.dark
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'text-white' 
                : darkMode ? '' : 'shadow-sm'
            }`}
            style={msg.role === 'user' 
              ? { backgroundColor: colors.primary } 
              : { backgroundColor: darkMode ? colors.light : 'white', color: darkMode ? colors.text : colors.dark }}>
              
              <p className="text-sm leading-relaxed message-content">{msg.content}</p>
              
              <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopyMessage(msg.content, idx)}
                    className="flex items-center gap-1 px-2 py-1 rounded transition-all hover:bg-opacity-10"
                    style={{ 
                      color: colors.primary,
                      backgroundColor: copiedIndex === idx ? colors.primary + '20' : 'transparent'
                    }}
                    title={copiedIndex === idx ? '¡Copiado!' : 'Copiar respuesta'}
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check size={14} />
                        <span className="text-xs">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span className="text-xs">Copiar</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t text-xs" 
                     style={{ borderColor: darkMode ? colors.surface : '#e5e7eb', color: darkMode ? colors.textSecondary : '#6b7280' }}>
                  <span className="font-semibold">Fuentes:</span>
                  <div className="mt-1 space-y-1">
                    {msg.sources.map((src, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 py-1">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <FileText size={12} className="flex-shrink-0" />
                          <span className="truncate text-xs">{src}</span>
                        </div>
                        <button
                          onClick={() => handleDownloadDocument(src)}
                          className="flex items-center gap-1 px-2 py-1 rounded transition-all hover:bg-opacity-10 flex-shrink-0"
                          style={{ 
                            color: colors.primary,
                            backgroundColor: 'transparent'
                          }}
                          title={`Descargar ${src}`}
                        >
                          <Download size={12} />
                          <span className="text-xs hidden sm:inline">Descargar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="rounded-2xl p-4 shadow-sm" 
                 style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-bounce" 
                     style={{ backgroundColor: colors.primary, animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" 
                     style={{ backgroundColor: colors.primary, animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" 
                     style={{ backgroundColor: colors.primary, animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 max-w-4xl w-full mx-auto"
           style={{ 
             borderColor: darkMode ? colors.surface : '#e5e7eb',
             backgroundColor: darkMode ? colors.light : 'white'
           }}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
            style={{
              borderColor: darkMode ? colors.surface : '#e5e7eb',
              backgroundColor: darkMode ? colors.dark : 'white',
              color: darkMode ? colors.text : colors.dark
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Send size={20} />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppUser;