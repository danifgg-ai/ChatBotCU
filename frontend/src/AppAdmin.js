import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Upload, BarChart3, FileText, Settings, MessageSquare, TrendingUp, Users, Clock, Menu, X, Trash2, CheckCircle, AlertCircle, RotateCcw, Sun, Moon, Copy, Check, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const Sidebar = React.memo(({ activeView, setActiveView, sidebarOpen, darkMode }) => {
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;
  
  const menuItems = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'stats', icon: BarChart3, label: 'Estadísticas' },
    { id: 'docs', icon: FileText, label: 'Documentos' },
    { id: 'settings', icon: Settings, label: 'Configuración' }
  ];

  return (
    <div 
      className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r overflow-hidden`}
      style={{ 
        borderColor: darkMode ? colors.surface : colors.light,
        backgroundColor: darkMode ? colors.light : 'white'
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: darkMode ? colors.surface : colors.light }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: colors.primary }}>
            <MessageSquare size={20} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate" style={{ color: darkMode ? colors.text : colors.primary }}>
              CU Chatbot
            </h2>
            <p className="text-xs truncate" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              Panel Admin
            </p>
          </div>
        </div>
      </div>

      <nav className="p-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all"
              style={{
                backgroundColor: isActive 
                  ? (darkMode ? colors.surface : colors.lightGreen)
                  : 'transparent',
                color: isActive 
                  ? colors.primary 
                  : (darkMode ? colors.textSecondary : '#6b7280')
              }}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
});

const ChatView = React.memo(({ 
  messages, 
  inputMessage, 
  setInputMessage, 
  isLoading, 
  handleSendMessage,
  handleClearChat,
  sidebarOpen, 
  setSidebarOpen,
  messagesEndRef,
  darkMode
}) => {
  const inputRef = useRef(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;

  const confirmClearChat = () => {
    handleClearChat();
    setShowClearModal(false);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between" 
           style={{ 
             borderColor: darkMode ? colors.surface : colors.light,
             backgroundColor: darkMode ? colors.light : 'white'
           }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-all"
            style={{ color: colors.primary }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h3 className="font-semibold" style={{ color: darkMode ? colors.text : colors.dark }}>
            Chat con Asistente
          </h3>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-opacity-10"
            style={{ 
              borderColor: colors.primary + '40',
              color: colors.primary
            }}
            title="Limpiar conversación"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline text-sm">Limpiar Chat</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                 style={{ backgroundColor: colors.primary + '20' }}>
              <MessageSquare size={40} style={{ color: colors.primary }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: darkMode ? colors.text : colors.dark }}>
              Bienvenido al Panel de Administración
            </h3>
            <p className="max-w-md mx-auto" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              Inicia una conversación para probar el chatbot o gestiona documentos y configuraciones desde el menú lateral.
            </p>
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

      <div className="border-t p-4" 
           style={{ 
             borderColor: darkMode ? colors.surface : colors.light,
             backgroundColor: darkMode ? colors.light : 'white'
           }}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Escribe tu mensaje..."
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

      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 max-w-md w-full mx-4"
               style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: darkMode ? colors.text : colors.dark }}>
              ¿Limpiar conversación?
            </h3>
            <p className="mb-6" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              Se eliminarán todos los mensajes del chat actual.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-lg border transition-all"
                style={{ 
                  borderColor: darkMode ? colors.surface : '#e5e7eb',
                  color: darkMode ? colors.text : colors.dark
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearChat}
                className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const StatsView = React.memo(({ stats, darkMode }) => {
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;
  
  const chartData = [
    { name: 'Lun', consultas: 45 },
    { name: 'Mar', consultas: 52 },
    { name: 'Mié', consultas: 38 },
    { name: 'Jue', consultas: 61 },
    { name: 'Vie', consultas: 48 },
    { name: 'Sáb', consultas: 23 },
    { name: 'Dom', consultas: 15 }
  ];

  return (
    <div className="p-6 overflow-y-auto h-full" 
         style={{ backgroundColor: darkMode ? colors.dark : colors.light }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: darkMode ? colors.text : colors.dark }}>
        Estadísticas del Sistema
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg p-6"
             style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
          <div className="flex items-center justify-between mb-2">
            <MessageSquare size={24} style={{ color: colors.primary }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: darkMode ? colors.text : colors.dark }}>
            {stats.totalQueries}
          </p>
          <p className="text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
            Total Consultas
          </p>
        </div>

        <div className="rounded-lg p-6"
             style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
          <div className="flex items-center justify-between mb-2">
            <Clock size={24} style={{ color: colors.secondary }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: darkMode ? colors.text : colors.dark }}>
            {stats.avgResponseTime}s
          </p>
          <p className="text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
            Tiempo Promedio
          </p>
        </div>

        <div className="rounded-lg p-6"
             style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
          <div className="flex items-center justify-between mb-2">
            <Users size={24} style={{ color: colors.accent }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: darkMode ? colors.text : colors.dark }}>
            {stats.activeUsers}
          </p>
          <p className="text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
            Usuarios Activos
          </p>
        </div>

        <div className="rounded-lg p-6"
             style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} style={{ color: colors.primary }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: darkMode ? colors.text : colors.dark }}>
            95%
          </p>
          <p className="text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
            Satisfacción
          </p>
        </div>
      </div>

      <div className="rounded-lg p-6 mb-6"
           style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? colors.text : colors.dark }}>
          Consultas por Día
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? colors.surface : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={darkMode ? colors.textSecondary : '#6b7280'} />
            <YAxis stroke={darkMode ? colors.textSecondary : '#6b7280'} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkMode ? colors.light : 'white',
                border: `1px solid ${darkMode ? colors.surface : '#e5e7eb'}`,
                color: darkMode ? colors.text : colors.dark
              }}
            />
            <Bar dataKey="consultas" fill={colors.primary} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const DocsView = React.memo(({ 
  documents, 
  handleFileUpload, 
  handleDeleteDocument, 
  uploadProgress, 
  isUploading,
  darkMode 
}) => {
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const event = {
        target: {
          files: files,
          value: ''
        }
      };
      handleFileUpload(event);
    }
  };

  const confirmDelete = () => {
    if (docToDelete) {
      handleDeleteDocument(docToDelete);
      setShowDeleteModal(false);
      setDocToDelete(null);
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full" 
         style={{ backgroundColor: darkMode ? colors.dark : colors.light }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: darkMode ? colors.text : colors.dark }}>
        Gestión de Documentos
      </h2>

      {/* ÁREA DE DRAG & DROP */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging ? 'border-opacity-100 scale-105' : 'border-opacity-40'
        }`}
        style={{
          borderColor: isDragging ? colors.primary : (darkMode ? colors.surface : '#d1d5db'),
          backgroundColor: isDragging 
            ? colors.primary + '10' 
            : (darkMode ? colors.light : 'white')
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
        />
        <Upload 
          size={48} 
          className="mx-auto mb-4" 
          style={{ color: isDragging ? colors.primary : (darkMode ? colors.textSecondary : '#9ca3af') }}
        />
        <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? colors.text : colors.dark }}>
          {isDragging ? '¡Suelta los archivos aquí!' : 'Arrastra archivos aquí'}
        </h3>
        <p className="text-sm mb-4" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
          o haz click para seleccionar
        </p>
        <p className="text-xs" style={{ color: darkMode ? colors.textSecondary : '#9ca3af' }}>
          Formatos soportados: PDF, DOCX, TXT
        </p>
      </div>

      {/* PROGRESO DE CARGA */}
      {isUploading && (
        <div className="mb-6 p-4 rounded-lg border"
             style={{ 
               backgroundColor: darkMode ? colors.light : 'white',
               borderColor: darkMode ? colors.surface : '#e5e7eb'
             }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                 style={{ borderColor: colors.primary }}></div>
            <span className="font-medium" style={{ color: darkMode ? colors.text : colors.dark }}>
              Subiendo: {uploadProgress.currentFile}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                backgroundColor: colors.primary
              }}
            ></div>
          </div>
          <p className="text-sm mt-1" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
            {uploadProgress.current} de {uploadProgress.total} archivos
          </p>
        </div>
      )}

      {/* LISTA DE DOCUMENTOS */}
      <div className="rounded-lg border overflow-hidden"
           style={{ 
             backgroundColor: darkMode ? colors.light : 'white',
             borderColor: darkMode ? colors.surface : '#e5e7eb'
           }}>
        <div className="px-6 py-3 border-b font-semibold"
             style={{ 
               backgroundColor: darkMode ? colors.surface : colors.lightGreen,
               borderColor: darkMode ? colors.surface : '#e5e7eb',
               color: darkMode ? colors.text : colors.dark
             }}>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">Nombre</div>
            <div className="col-span-2">Tamaño</div>
            <div className="col-span-2">Fecha</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-1 text-right">Acciones</div>
          </div>
        </div>

        {documents.length === 0 && !isUploading ? (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto mb-4" style={{ color: darkMode ? colors.textSecondary : '#9ca3af' }} />
            <p className="text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              No hay documentos cargados. Arrastra archivos para comenzar.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: darkMode ? colors.surface : '#e5e7eb' }}>
            {documents.map(doc => (
              <div key={doc.id} 
                   className="px-6 py-4 hover:bg-opacity-50 transition-all"
                   style={{ backgroundColor: 'transparent' }}>
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Nombre */}
                  <div className="col-span-5 flex items-center gap-3">
                    <FileText size={20} style={{ color: colors.primary }} className="flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm" 
                         style={{ color: darkMode ? colors.text : colors.dark }}>
                        {doc.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                        {doc.chunksCount} chunks
                      </p>
                    </div>
                  </div>

                  {/* Tamaño */}
                  <div className="col-span-2">
                    <p className="text-sm" style={{ color: darkMode ? colors.text : colors.dark }}>
                      {doc.size}
                    </p>
                  </div>

                  {/* Fecha */}
                  <div className="col-span-2">
                    <p className="text-sm" style={{ color: darkMode ? colors.text : colors.dark }}>
                      {new Date(doc.uploadDate).toLocaleDateString('es-PY')}
                    </p>
                  </div>

                  {/* Estado */}
                  <div className="col-span-2">
                    {doc.status === 'Vectorizado' ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} style={{ color: colors.accent }} />
                        <span className="text-xs font-medium" style={{ color: colors.accent }}>
                          Vectorizado
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                        <span className="text-xs font-medium" style={{ color: '#f59e0b' }}>
                          Procesando...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => {
                        setDocToDelete(doc.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded hover:bg-red-100 transition-all"
                      style={{ color: '#ef4444' }}
                      title="Eliminar documento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 max-w-md w-full mx-4"
               style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: darkMode ? colors.text : colors.dark }}>
              ¿Eliminar documento?
            </h3>
            <p className="mb-6" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              Esta acción no se puede deshacer. Se eliminarán todos los chunks vectorizados.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDocToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border transition-all"
                style={{ 
                  borderColor: darkMode ? colors.surface : '#e5e7eb',
                  color: darkMode ? colors.text : colors.dark
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#ef4444' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const SettingsView = React.memo(({ documents, stats, darkMode, setDarkMode }) => {
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;

  return (
    <div className="p-6 overflow-y-auto h-full" 
         style={{ backgroundColor: darkMode ? colors.dark : colors.light }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: darkMode ? colors.text : colors.dark }}>
        Configuración
      </h2>

      <div className="space-y-6">
        <div className="rounded-lg p-6"
             style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? colors.text : colors.dark }}>
            Apariencia
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: darkMode ? colors.text : colors.dark }}>
                Modo Oscuro
              </p>
              <p className="text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                Cambia entre tema claro y oscuro
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: darkMode ? colors.primary : '#d1d5db' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="rounded-lg p-6"
             style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? colors.text : colors.dark }}>
            Información del Sistema
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                Documentos cargados:
              </span>
              <span className="font-semibold" style={{ color: darkMode ? colors.text : colors.dark }}>
                {documents.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                Total consultas:
              </span>
              <span className="font-semibold" style={{ color: darkMode ? colors.text : colors.dark }}>
                {stats.totalQueries}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                Versión:
              </span>
              <span className="font-semibold" style={{ color: darkMode ? colors.text : colors.dark }}>
                v8.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const ChatbotCU = () => {
  const [activeView, setActiveView] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalQueries: 0,
    avgResponseTime: 0,
    activeUsers: 0,
    topTopics: []
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentFile: '' });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('cu-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const callBackendAPI = useCallback(async (userMessage) => {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: 'colaborador-' + Math.random().toString(36).substr(2, 9),
          conversationId: 'conv-' + Date.now()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          content: data.response,
          sources: data.sources || []
        };
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error llamando al backend:', error);
      return {
        content: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.',
        sources: []
      };
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const result = await callBackendAPI(userMsg.content);
      
      const botMsg = {
        role: 'assistant',
        content: result.content,
        sources: result.sources,
        timestamp: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, callBackendAPI]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setInputMessage('');
  }, []);

  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length, currentFile: '' });
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(prev => ({ ...prev, current: i + 1, currentFile: file.name }));
      
      const formData = new FormData();
      formData.append('documents', file);

      try {
        const response = await fetch(`${API_URL}/documents/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        if (data.success) {
          console.log(`✅ ${file.name} subido correctamente`);
        } else {
          console.error(`❌ Error subiendo ${file.name}`);
        }
      } catch (error) {
        console.error(`❌ Error subiendo ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    loadDocuments();
    e.target.value = '';
  }, []);

  const handleDeleteDocument = useCallback(async (docId) => {
    try {
      const response = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Documento eliminado');
        loadDocuments();
      }
    } catch (error) {
      console.error('❌ Error eliminando documento:', error);
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/documents`);
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error cargando documentos:', error);
    }
  }, []);

  const loadStatistics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/statistics`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.statistics);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadStatistics();
  }, [loadDocuments, loadStatistics]);

  useEffect(() => {
    localStorage.setItem('cu-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        sidebarOpen={sidebarOpen}
        darkMode={darkMode}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'chat' && (
          <ChatView 
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            isLoading={isLoading}
            handleSendMessage={handleSendMessage}
            handleClearChat={handleClearChat}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            messagesEndRef={messagesEndRef}
            darkMode={darkMode}
          />
        )}
        {activeView === 'stats' && <StatsView stats={stats} darkMode={darkMode} />}
        {activeView === 'docs' && (
          <DocsView 
            documents={documents} 
            handleFileUpload={handleFileUpload}
            handleDeleteDocument={handleDeleteDocument}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
            darkMode={darkMode}
          />
        )}
        {activeView === 'settings' && (
          <SettingsView 
            documents={documents} 
            stats={stats}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}
      </div>
    </div>
  );
};

export default ChatbotCU;