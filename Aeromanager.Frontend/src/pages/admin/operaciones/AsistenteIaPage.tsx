import React, { useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import { AiAssistantResponseDto } from '../../../types/models';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  contexto?: string;
  timestamp: string;
}

const SUGERENCIAS_OPERATIVAS = [
  '¿Cuál es el resumen ejecutivo actual de vuelos, aviones y reservas en Neon Cloud?',
  '¿Qué recomendaciones operativas sugieres para optimizar la asignación de puertas de embarque?',
  '¿Cómo previene AeroManager el solapamiento de asientos cuando dos counters venden al mismo tiempo?',
  '¿Qué vuelos prioritarios deberían abrir embarque en los próximos 45 minutos?'
];

export default function AsistenteIaPage() {
  const [pregunta, setPregunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Bienvenido al Copilot Operativo AeroManager. Todas las consultas se envían directamente a POST /api/ai/consultar (`AskAiAssistantCommandHandler` + `GeminiAiService`), inyectando la telemetría real en vivo de las tablas Vuelo, Avion y Reserva de Neon Cloud PostgreSQL.',
      timestamp: new Date().toLocaleTimeString('es-PE')
    }
  ]);

  const enviarConsulta = async (textoConsulta: string) => {
    const clean = textoConsulta.trim();
    if (!clean || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: clean,
      timestamp: new Date().toLocaleTimeString('es-PE')
    };
    setMessages((prev) => [...prev, userMsg]);
    setPregunta('');
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await axiosClient.post<AiAssistantResponseDto>('/ai/consultar', {
        pregunta: clean
      });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.data.respuesta,
          contexto: res.data.contextoAnalizado,
          timestamp: new Date(res.data.fechaConsulta).toLocaleTimeString('es-PE')
        }
      ]);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'No se pudo contactar POST /api/ai/consultar en Aeromanager.Api.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enviarConsulta(pregunta);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            Operaciones &amp; Inteligencia Artificial / Gemini 2.0 Flash
          </span>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Copilot Operativo con IA (Gemini)
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Asistente inteligente conectado en tiempo real a los repositorios de vuelos, aviones y
            reservas mediante POST /api/ai/consultar.
          </p>
        </div>
        <span className="font-mono-code text-xs px-3 py-1.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7] font-semibold">
          Endpoint: POST /api/ai/consultar
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Chips de Sugerencias Rápidas */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2.5">
          Consultas Ejecutivas Rápidas
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGERENCIAS_OPERATIVAS.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => enviarConsulta(sug)}
              className="px-3 py-1.5 rounded-lg bg-[#F4F4F5] hover:bg-sky-50 hover:border-[#0284C7] hover:text-[#0284C7] border border-zinc-200 text-xs text-zinc-700 font-medium transition-colors cursor-pointer text-left"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Contenedor del Chat Operativo */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden flex flex-col h-[460px]">
        <div className="px-5 py-3 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0284C7] text-lg">smart_toy</span>
            <span className="text-xs font-bold text-[#18181B]">
              Consola de Telemetría Conversacional
            </span>
          </div>
          <span className="font-mono-code text-[11px] text-emerald-700">
            Contexto BD Inyectado Automáticamente por AskAiAssistantCommandHandler
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-[#F4F4F5] border border-zinc-200 text-[#18181B]'
                }`}
              >
                <div>{m.text}</div>
                {m.contexto && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-300/80 font-mono-code text-[11px] text-zinc-600">
                    <strong>Telemetría Real de Neon DB:</strong> {m.contexto}
                  </div>
                )}
              </div>
              <span className="font-mono-code text-[10px] text-zinc-400 mt-1 px-1">
                {m.role === 'user' ? 'Administrador' : 'Gemini Copilot'} • {m.timestamp}
              </span>
            </div>
          ))}
          {loading && (
            <div className="text-xs font-mono-code text-[#0284C7] animate-pulse">
              Consultando POST /api/ai/consultar en Aeromanager.Api...
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-3 bg-[#F4F4F5] border-t border-zinc-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="Escribe una consulta operativa para el asistente IA..."
            className="flex-1 h-10 px-3.5 rounded-lg border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <span>Consultar IA</span>
            <span className="material-symbols-outlined text-[17px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
