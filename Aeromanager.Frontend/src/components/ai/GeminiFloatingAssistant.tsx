import React, { useEffect, useRef, useState } from 'react';
import axiosClient, { extractApiError } from '../../api/axiosClient';
import { AiAssistantResponseDto } from '../../types/models';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  contexto?: string;
  timestamp: string;
}

const SUGERENCIAS_OPERATIVAS = [
  '¿Cuál es el resumen ejecutivo actual de vuelos, aviones y reservas?',
  '¿Qué recomendaciones operativas sugieres para optimizar la asignación de puertas de embarque?',
  '¿Cómo previene AeroManager el solapamiento de asientos cuando dos counters venden al mismo tiempo?',
  '¿Qué vuelos prioritarios deberían abrir embarque en los próximos 45 minutos?'
];

export const OPEN_GEMINI_ASSISTANT_EVENT = 'aeromanager:open-gemini-assistant';

export function openGeminiAssistant() {
  window.dispatchEvent(new CustomEvent(OPEN_GEMINI_ASSISTANT_EVENT));
}

const BUBBLE_SIZE = 56;
const MARGIN = 20;
const POS_STORAGE_KEY = 'aeromanager_ai_bubble_pos';

function clampPos(x: number, y: number, w = BUBBLE_SIZE, h = BUBBLE_SIZE) {
  const maxX = Math.max(12, window.innerWidth - w - 12);
  const maxY = Math.max(12, window.innerHeight - h - 12);
  return {
    x: Math.min(Math.max(12, x), maxX),
    y: Math.min(Math.max(12, y), maxY)
  };
}

function getInitialPos() {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { x: number; y: number };
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        return clampPos(parsed.x, parsed.y);
      }
    }
  } catch {
    // ignorar error de lectura
  }
  return {
    x: Math.max(12, window.innerWidth - BUBBLE_SIZE - MARGIN),
    y: Math.max(12, window.innerHeight - BUBBLE_SIZE - MARGIN)
  };
}

export default function GeminiFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => getInitialPos());
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
    w: number;
    h: number;
  } | null>(null);
  const [pregunta, setPregunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Bienvenido al Copilot Operativo AeroManager. Todas las consultas se envían directamente al Sistema AeroManager, inyectando la telemetría real en vivo de las tablas Vuelo, Avión y Reserva.',
      timestamp: new Date().toLocaleTimeString('es-PE')
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener(OPEN_GEMINI_ASSISTANT_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_GEMINI_ASSISTANT_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(pos));
    } catch {
      // ignorar
    }
  }, [pos]);

  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => clampPos(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrag = (e: React.PointerEvent, w = BUBBLE_SIZE, h = BUBBLE_SIZE) => {
    if (e.button !== 0) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false,
      w,
      h
    };
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragRef.current.moved = true;
      }
      const next = clampPos(
        dragRef.current.originX + dx,
        dragRef.current.originY + dy,
        dragRef.current.w,
        dragRef.current.h
      );
      setPos(next);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setDragging(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

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
        extractApiError(err, 'No se pudo contactar Sistema AeroManager en Aeromanager.Api.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enviarConsulta(pregunta);
  };

  if (!isOpen) {
    const showTooltipRight = pos.x < window.innerWidth / 2;
    return (
      <div
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
        className="fixed z-50 touch-none select-none"
      >
        <button
          type="button"
          onPointerDown={(e) => startDrag(e, BUBBLE_SIZE, BUBBLE_SIZE)}
          onClick={() => {
            if (dragRef.current?.moved) return;
            setIsOpen(true);
          }}
          title="Arrastra para mover o haz clic para abrir Copilot IA"
          aria-label="Abrir Copilot Operativo IA (Gemini)"
          className={`group relative w-14 h-14 rounded-full bg-gradient-to-br from-[#0284C7] to-[#4F46E5] hover:from-[#0369A1] hover:to-[#4338CA] text-white shadow-xl hover:shadow-2xl flex items-center justify-center ring-4 ring-white ${
            dragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105 transition-transform duration-150'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">smart_toy</span>
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
          <span
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity shadow-md ${
              showTooltipRight ? 'left-16' : 'right-16'
            }`}
          >
            Asistente IA (arrastrable)
          </span>
        </button>
      </div>
    );
  }

  const popupW = Math.min(400, window.innerWidth - 24);
  const popupH = Math.min(530, Math.round(window.innerHeight * 0.82));
  const popupPos = clampPos(
    pos.x > window.innerWidth / 2 ? pos.x + BUBBLE_SIZE - popupW : pos.x,
    pos.y > window.innerHeight / 2 ? pos.y + BUBBLE_SIZE - popupH : pos.y,
    popupW,
    popupH
  );

  return (
    <div
      style={{ left: `${popupPos.x}px`, top: `${popupPos.y}px`, width: `${popupW}px`, height: `${popupH}px` }}
      className="fixed z-50 bg-white border border-zinc-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Cabecera estilo Messenger (sin botón X, solo minimizar) */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#0284C7] to-[#4F46E5] text-white flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0284C7]" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold">Copilot Operativo IA</span>
            <span className="text-[10px] text-sky-100 font-medium">
              Gemini 2.0 Flash · Telemetría en vivo
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          title="Minimizar a burbuja"
          aria-label="Minimizar asistente"
          className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
      </div>

      {/* Sugerencias rápidas */}
      <div className="px-3 py-2 bg-[#F8FAFC] border-b border-zinc-200 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
          Consultas rápidas
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {SUGERENCIAS_OPERATIVAS.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => enviarConsulta(sug)}
              disabled={loading}
              className="shrink-0 max-w-[230px] truncate px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 hover:border-[#0284C7] hover:text-[#0284C7] border border-zinc-200 text-[11px] text-zinc-700 font-medium transition-colors cursor-pointer disabled:opacity-60"
              title={sug}
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mx-3 mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium shrink-0">
          {errorMsg}
        </div>
      )}

      {/* Historial de mensajes */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-white">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-[#0284C7] text-white rounded-br-sm'
                  : 'bg-[#F4F4F5] border border-zinc-200 text-[#18181B] rounded-bl-sm'
              }`}
            >
              <div>{m.text}</div>
              {m.contexto && (
                <div className="mt-2 pt-1.5 border-t border-zinc-300/80 font-mono-code text-[10px] text-zinc-600">
                  <strong>Telemetría:</strong> {m.contexto}
                </div>
              )}
            </div>
            <span className="font-mono-code text-[10px] text-zinc-400 mt-1 px-1">
              {m.role === 'user' ? 'Tú' : 'Gemini'} • {m.timestamp}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-[11px] font-mono-code text-[#0284C7] animate-pulse px-1">
            Consultando telemetría en Aeromanager.Api...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de consulta */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 bg-[#F4F4F5] border-t border-zinc-200 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Escribe una consulta operativa..."
          className="flex-1 h-9 px-3 rounded-full border border-zinc-300 bg-white text-xs outline-none focus:border-[#0284C7]"
        />
        <button
          type="submit"
          disabled={loading || !pregunta.trim()}
          aria-label="Enviar consulta"
          className="w-9 h-9 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
}
