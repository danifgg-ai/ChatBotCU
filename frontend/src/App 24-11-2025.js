import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Upload, BarChart3, FileText, Settings, MessageSquare, TrendingUp, Users, Clock, Menu, X, Trash2, CheckCircle, AlertCircle, RotateCcw, Sun, Moon } from 'lucide-react';
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
const CHART_COLORS = ['#008556', '#D4AF37', '#00A86B', '#34d399', '#10b981'];
const CHART_COLORS_DARK = ['#00a86b', '#fbbf24', '#34d399', '#4ade80', '#22d3ee'];

// ============================================
// MODAL DE CONFIRMACIÓN
// ============================================

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor, darkMode }) => {
  if (!isOpen) return null;

  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
           style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
               style={{ backgroundColor: confirmColor + '20' }}>
            <AlertCircle size={24} style={{ color: confirmColor }} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: darkMode ? colors.text : colors.dark }}>
            {title}
          </h3>
        </div>
        
        <p className="mb-6" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
          {message}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border-2 font-semibold transition-all hover:bg-opacity-10"
            style={{ 
              borderColor: colors.primary + '40', 
              color: colors.primary,
              backgroundColor: darkMode ? 'transparent' : 'white'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
            style={{ backgroundColor: confirmColor }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SIDEBAR
// ============================================

const Sidebar = React.memo(({ activeView, setActiveView, sidebarOpen, darkMode }) => {
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;
  
  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`} 
         style={{ backgroundColor: darkMode ? colors.dark : colors.dark }}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
               style={{ backgroundColor: colors.primary }}>
            <MessageSquare className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">CU Assistant</h1>
            <p className="text-gray-400 text-xs">Cooperativa Universitaria</p>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'stats', icon: BarChart3, label: 'Estadísticas' },
            { id: 'docs', icon: FileText, label: 'Documentos' },
            { id: 'settings', icon: Settings, label: 'Configuración' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeView === item.id 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              style={activeView === item.id ? { backgroundColor: colors.primary } : {}}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
});

// ============================================
// CHAT VIEW
// ============================================

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
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;

  const confirmClearChat = () => {
    handleClearChat();
    setShowClearModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between" 
           style={{ 
             borderColor: darkMode ? colors.surface : colors.light,
             backgroundColor: darkMode ? colors.light : 'white'
           }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            {sidebarOpen ? <X size={24} style={{ color: colors.text }} /> : <Menu size={24} style={{ color: colors.text }} />}
          </button>
          <h2 className="text-xl font-bold" style={{ color: colors.primary }}>
            Asistente Virtual CU
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all hover:shadow-md"
              style={{ borderColor: colors.primary + '40', color: colors.primary }}
              title="Limpiar conversación"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">Limpiar Chat</span>
            </button>
          )}
          <div className="flex items-center gap-2 text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="hidden sm:inline">En línea</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4" 
           style={{ backgroundColor: darkMode ? colors.dark : colors.light }}>
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                 style={{ backgroundColor: colors.primary + '20' }}>
              <MessageSquare size={40} style={{ color: colors.primary }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: darkMode ? colors.text : colors.dark }}>
              ¡Bienvenido al Asistente CU!
            </h3>
            <p className="max-w-md mx-auto" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              Estoy aquí para ayudarte con consultas sobre manuales, políticas y procedimientos internos de la Cooperativa Universitaria.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                '¿Cómo aperturar una cuenta de ahorros?',
                '¿Cuáles son los requisitos para un crédito personal?',
                '¿Qué beneficios tienen los socios?',
                '¿Cómo procesar una solicitud urgente?'
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
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'text-white' 
                : darkMode ? '' : 'shadow-sm'
            }`}
            style={msg.role === 'user' 
              ? { backgroundColor: colors.primary } 
              : { backgroundColor: darkMode ? colors.light : 'white', color: darkMode ? colors.text : colors.dark }}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                <span>{msg.timestamp}</span>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t text-xs" 
                     style={{ borderColor: darkMode ? colors.surface : '#e5e7eb', color: darkMode ? colors.textSecondary : '#6b7280' }}>
                  <span className="font-semibold">Fuentes:</span>
                  <div className="mt-1 space-y-1">
                    {msg.sources.map((src, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <FileText size={12} />
                        <span>{src}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl p-4 shadow-sm" 
                 style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.primary }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.primary, animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.primary, animationDelay: '0.2s' }}></div>
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
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu consulta aquí..."
            className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none transition-all"
            style={{ 
              borderColor: colors.primary + '40',
              backgroundColor: darkMode ? colors.surface : 'white',
              color: darkMode ? colors.text : colors.dark
            }}
            autoComplete="off"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: colors.primary }}
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClearChat}
        title="Limpiar Conversación"
        message="¿Estás seguro de que deseas limpiar toda la conversación? Esta acción no se puede deshacer."
        confirmText="Limpiar"
        confirmColor="#ef4444"
        darkMode={darkMode}
      />
    </div>
  );
});

// ============================================
// STATS VIEW
// ============================================

const StatsView = React.memo(({ stats, darkMode }) => {
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;
  const chartColors = darkMode ? CHART_COLORS_DARK : CHART_COLORS;

  const consultasEvolucion = [
    { mes: 'Jul', consultas: 145 },
    { mes: 'Ago', consultas: 189 },
    { mes: 'Sep', consultas: 234 },
    { mes: 'Oct', consultas: 298 },
    { mes: 'Nov', consultas: stats.totalQueries || 381 }
  ];

  const temasData = stats.topTopics.map((topic, idx) => ({
    name: topic.name.length > 20 ? topic.name.substring(0, 20) + '...' : topic.name,
    consultas: topic.count,
    fill: chartColors[idx % chartColors.length]
  }));

  const distribucionData = stats.topTopics.map((topic, idx) => ({
    name: topic.name,
    value: topic.count,
    fill: chartColors[idx % chartColors.length]
  }));

  return (
    <div className="p-6 overflow-y-auto h-full" style={{ backgroundColor: darkMode ? colors.dark : colors.light }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
        Dashboard de Estadísticas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: MessageSquare, label: 'Consultas Totales', value: stats.totalQueries, color: colors.primary },
          { icon: Clock, label: 'Tiempo Resp. Promedio', value: `${stats.avgResponseTime}s`, color: colors.secondary },
          { icon: Users, label: 'Usuarios Activos', value: stats.activeUsers, color: colors.accent },
          { icon: TrendingUp, label: 'Satisfacción', value: '94%', color: '#10b981' }
        ].map((stat, idx) => (
          <div key={idx} className="rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
               style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: stat.color + '20' }}>
                <stat.icon style={{ color: stat.color }} size={24} />
              </div>
            </div>
            <p className="text-sm mb-1" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: darkMode ? colors.text : colors.dark }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? colors.text : colors.dark }}>
            Evolución de Consultas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={consultasEvolucion}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? colors.surface : '#e5e7eb'} />
              <XAxis dataKey="mes" stroke={darkMode ? colors.textSecondary : '#6b7280'} />
              <YAxis stroke={darkMode ? colors.textSecondary : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? colors.surface : 'white', 
                  border: `1px solid ${darkMode ? colors.surface : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? colors.text : colors.dark
                }}
              />
              <Line 
                type="monotone" 
                dataKey="consultas" 
                stroke={colors.primary} 
                strokeWidth={3}
                dot={{ fill: colors.primary, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? colors.text : colors.dark }}>
            Distribución de Consultas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribucionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.substring(0, 15)}... ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distribucionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? colors.surface : 'white',
                  color: darkMode ? colors.text : colors.dark
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? colors.text : colors.dark }}>
          Temas Más Consultados
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={temasData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? colors.surface : '#e5e7eb'} />
            <XAxis 
              dataKey="name" 
              stroke={darkMode ? colors.textSecondary : '#6b7280'}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke={darkMode ? colors.textSecondary : '#6b7280'} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkMode ? colors.surface : 'white', 
                border: `1px solid ${darkMode ? colors.surface : '#e5e7eb'}`,
                borderRadius: '8px',
                color: darkMode ? colors.text : colors.dark
              }}
            />
            <Bar dataKey="consultas" radius={[8, 8, 0, 0]}>
              {temasData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

// ============================================
// DOCS VIEW
// ============================================

const DocsView = React.memo(({ documents, handleFileUpload, handleDeleteDocument, uploadProgress, isUploading, darkMode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, docId: null, docName: '' });
  const fileInputRef = useRef(null);
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;

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
      handleFileUpload({ target: { files } });
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full" style={{ backgroundColor: darkMode ? colors.dark : colors.light }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
          Gestión de Documentos
        </h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 rounded-xl text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          style={{ backgroundColor: colors.primary }}
          disabled={isUploading}
        >
          <Upload size={20} />
          Subir Documentos
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".pdf,.doc,.docx,.txt" 
        />
      </div>

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-6 border-4 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          isDragging ? 'border-green-500' : ''
        }`}
        onClick={() => fileInputRef.current?.click()}
        style={{ 
          borderColor: isDragging ? '#10b981' : (darkMode ? colors.surface : '#d1d5db'),
          backgroundColor: isDragging ? (darkMode ? colors.surface : '#f0fdf4') : (darkMode ? colors.light : 'white')
        }}
      >
        <Upload 
          size={64} 
          className="mx-auto mb-4" 
          style={{ color: isDragging ? colors.primary : (darkMode ? colors.textSecondary : '#9CA3AF') }}
        />
        <h3 className="text-xl font-bold mb-2" style={{ color: darkMode ? colors.text : colors.dark }}>
          {isDragging ? '¡Suelta los archivos aquí!' : 'Arrastra y suelta tus documentos'}
        </h3>
        <p className="mb-4" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
          o haz click para seleccionar archivos
        </p>
        <p className="text-sm" style={{ color: darkMode ? colors.textSecondary : '#9ca3af' }}>
          Formatos soportados: PDF, Word (.doc, .docx), TXT • Máx. 10MB por archivo
        </p>
      </div>

      {isUploading && (
        <div className="mb-6 rounded-xl p-6 shadow-sm" style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" 
                   style={{ borderColor: colors.primary }}></div>
              <span className="font-semibold" style={{ color: darkMode ? colors.text : colors.dark }}>
                Procesando y vectorizando documentos...
              </span>
            </div>
            <span className="text-sm font-medium" style={{ color: colors.primary }}>
              {uploadProgress.current}/{uploadProgress.total} archivos
            </span>
          </div>
          
          <div className="w-full rounded-full h-3 overflow-hidden" 
               style={{ backgroundColor: darkMode ? colors.surface : '#e5e7eb' }}>
            <div 
              className="h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                backgroundColor: colors.primary 
              }}
            ></div>
          </div>
          
          {uploadProgress.currentFile && (
            <p className="text-sm mt-2" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              Procesando: {uploadProgress.currentFile}
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl shadow-sm overflow-x-auto" style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
        <table className="w-full table-fixed">
          <thead style={{ backgroundColor: colors.primary }}>
            <tr>
              <th className="text-left p-4 text-white font-semibold" style={{width: '35%'}}>Nombre</th>
              <th className="text-left p-4 text-white font-semibold" style={{width: '15%'}}>Tamaño</th>
              <th className="text-left p-4 text-white font-semibold" style={{width: '20%'}}>Fecha</th>
              <th className="text-left p-4 text-white font-semibold" style={{width: '20%'}}>Estado</th>
              <th className="text-center p-4 text-white font-semibold" style={{width: '10%'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                  No hay documentos cargados. Sube tu primer documento para comenzar.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b transition-colors" 
                    style={{ 
                      borderColor: darkMode ? colors.surface : '#e5e7eb',
                      ':hover': { backgroundColor: darkMode ? colors.surface : '#f9fafb' }
                    }}>
                  <td className="p-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={18} style={{ color: colors.primary }} className="flex-shrink-0" />
                      <span className="font-medium truncate" style={{ color: darkMode ? colors.text : colors.dark }}>
                        {doc.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                    {doc.size}
                  </td>
                  <td className="p-4" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                    {new Date(doc.uploadDate).toLocaleDateString('es-PY')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {doc.status}
                      </span>
                      {doc.chunksCount && (
                        <span className="text-xs" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                          ({doc.chunksCount})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setDeleteModal({ isOpen: true, docId: doc.id, docName: doc.name });
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                        title="Eliminar documento"
                      >
                        <Trash2 size={18} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, docId: null, docName: '' })}
        onConfirm={() => {
          handleDeleteDocument(deleteModal.docId);
          setDeleteModal({ isOpen: false, docId: null, docName: '' });
        }}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el documento "${deleteModal.docName}"? Esta acción no se puede deshacer y se eliminarán todos los vectores asociados.`}
        confirmText="Eliminar"
        confirmColor="#ef4444"
        darkMode={darkMode}
      />
    </div>
  );
});

// ============================================
// SETTINGS VIEW CON TOGGLE DE MODO OSCURO
// ============================================

const SettingsView = React.memo(({ documents, stats, darkMode, setDarkMode }) => {
  const colors = darkMode ? CU_COLORS_DARK : CU_COLORS;

  const handleToggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('cu-dark-mode', JSON.stringify(newMode));
  };

  return (
    <div className="p-6 overflow-y-auto h-full" style={{ backgroundColor: darkMode ? colors.dark : colors.light }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
        Configuración
      </h2>

      {/* Toggle de Modo Oscuro */}
      <div className="rounded-xl p-6 shadow-sm mb-6" style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
        <h3 className="font-bold mb-4" style={{ color: darkMode ? colors.text : colors.dark }}>
          Apariencia
        </h3>
        <div className="flex items-center justify-between p-4 rounded-lg" 
             style={{ backgroundColor: darkMode ? colors.surface : colors.light }}>
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={24} style={{ color: colors.primary }} /> : <Sun size={24} style={{ color: colors.primary }} />}
            <div>
              <p className="font-semibold" style={{ color: darkMode ? colors.text : colors.dark }}>
                Modo Oscuro
              </p>
              <p className="text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
                {darkMode ? 'Desactiva para tema claro' : 'Activa para tema oscuro'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleDarkMode}
            className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none"
            style={{ backgroundColor: darkMode ? colors.primary : '#cbd5e1' }}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: darkMode ? colors.light : 'white' }}>
        <h3 className="font-bold mb-4" style={{ color: darkMode ? colors.text : colors.dark }}>
          Información del Sistema
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 rounded" 
               style={{ backgroundColor: darkMode ? colors.surface : colors.light }}>
            <span className="font-medium" style={{ color: darkMode ? colors.text : colors.dark }}>
              Backend URL:
            </span>
            <span style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              {API_URL}
            </span>
          </div>
          <div className="flex justify-between p-3 rounded" 
               style={{ backgroundColor: darkMode ? colors.surface : colors.light }}>
            <span className="font-medium" style={{ color: darkMode ? colors.text : colors.dark }}>
              Documentos Cargados:
            </span>
            <span style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              {documents.length}
            </span>
          </div>
          <div className="flex justify-between p-3 rounded" 
               style={{ backgroundColor: darkMode ? colors.surface : colors.light }}>
            <span className="font-medium" style={{ color: darkMode ? colors.text : colors.dark }}>
              Consultas Realizadas:
            </span>
            <span style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
              {stats.totalQueries}
            </span>
          </div>
        </div>
        <p className="mt-6 text-sm" style={{ color: darkMode ? colors.textSecondary : '#6b7280' }}>
          Para configurar la API Key de OpenAI, edita el archivo backend/.env
        </p>
      </div>
    </div>
  );
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

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
        throw new Error(data.error || 'Error en la respuesta');
      }
    } catch (error) {
      console.error('Error llamando al backend:', error);
      return {
        content: 'Lo siento, ha ocurrido un error. Verifica que el servidor backend esté funcionando en http://localhost:3001',
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

    const result = await callBackendAPI(messageToSend);
    
    const botMessage = {
      role: 'assistant',
      content: result.content,
      timestamp: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }),
      sources: result.sources
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  }, [inputMessage, isLoading, callBackendAPI]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length, currentFile: '' });
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length, currentFile: files[i].name });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        await loadDocuments();
        alert(`✅ ${files.length} documento(s) procesado(s) y vectorizado(s) exitosamente!`);
      } else {
        alert('❌ Error al procesar documentos: ' + data.error);
      }
    } catch (error) {
      console.error('Error subiendo archivos:', error);
      alert('❌ Error al subir archivos. Verifica que el servidor esté funcionando.');
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0, currentFile: '' });
    }
  }, []);

  const handleDeleteDocument = useCallback(async (docId) => {
    try {
      const response = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await loadDocuments();
        alert('✅ Documento eliminado exitosamente');
      } else {
        alert('❌ Error al eliminar documento: ' + data.error);
      }
    } catch (error) {
      console.error('Error eliminando documento:', error);
      alert('❌ Error al eliminar documento. Verifica que el servidor esté funcionando.');
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
        setStats({
          totalQueries: data.statistics.totalQueries,
          avgResponseTime: data.statistics.avgResponseTime,
          activeUsers: data.statistics.activeUsers,
          topTopics: data.statistics.topTopics
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadStatistics();
    const interval = setInterval(loadStatistics, 30000);
    return () => clearInterval(interval);
  }, [loadDocuments, loadStatistics]);

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