import React, { useEffect, useState } from 'react';
import axiosClient, { extractApiError } from '../../../api/axiosClient';

interface HistorialDescarga {
  id: string;
  tipoReporte: string;
  archivo: string;
  fechaDescarga: string;
  tamanoBytes: number;
}

const STORAGE_KEY = 'aeromanager_historial_reportes_excel';

export default function ReportesExcelPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [historial, setHistorial] = useState<HistorialDescarga[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistorial(JSON.parse(saved));
      } catch {
        setHistorial([]);
      }
    }
  }, []);

  const registrarEnHistorial = (tipoReporte: string, archivo: string, tamanoBytes: number) => {
    const nuevo: HistorialDescarga = {
      id: `RPT-${String(historial.length + 1).padStart(3, '0')}`,
      tipoReporte,
      archivo,
      fechaDescarga: new Date().toISOString(),
      tamanoBytes
    };
    const updated = [nuevo, ...historial].slice(0, 12);
    setHistorial(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleDescargarExcel = async (
    endpoint: 'vuelos-excel' | 'reservas-excel' | 'pasajeros-excel',
    titulo: string,
    prefijo: string
  ) => {
    setDownloading(endpoint);
    setErrorMsg(null);
    const fechaStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `${prefijo}_${fechaStr}.xlsx`;

    try {
      const res = await axiosClient.get(`/reportes/${endpoint}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      registrarEnHistorial(titulo, fileName, blob.size);
    } catch (err: any) {
      setErrorMsg(
        extractApiError(err, `Error al descargar Sistema AeroManager${endpoint} desde Aeromanager.Api.`)
      );
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
          Operaciones &amp; Inteligencia Comercial / Exportación
        </span>
        <h1 className="text-2xl font-bold text-[#18181B]">
          Centro de Descarga de Reportes Excel (.xlsx)
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Generación directa de hojas de cálculo en formato compatible con Microsoft Excel.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* 3 Tarjetas de Descarga de Reportes Excel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                Sistema AeroManager
              </span>
              <span className="material-symbols-outlined text-emerald-600">flight_takeoff</span>
            </div>
            <h3 className="text-base font-bold text-[#18181B] mt-3">
              Reporte Maestro de Vuelos
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Exporta el cronograma completo de la tabla Vuelo (rutas,
              aeronaves, puertas de embarque, tarifas base y estado operativo).
            </p>
          </div>
          <button
            type="button"
            disabled={downloading === 'vuelos-excel'}
            onClick={() =>
              handleDescargarExcel(
                'vuelos-excel',
                'Programación de Vuelos',
                'Reporte_Vuelos'
              )
            }
            className="mt-5 w-full h-9 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>
              {downloading === 'vuelos-excel' ? 'Consultando BD...' : 'Descargar Reporte Vuelos (.xlsx)'}
            </span>
          </button>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                Sistema AeroManager
              </span>
              <span className="material-symbols-outlined text-emerald-600">airplane_ticket</span>
            </div>
            <h3 className="text-base font-bold text-[#18181B] mt-3">
              Reporte Financiero de Reservas
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Exporta todos los tickets emitidos en la tabla Reserva (`CodigoTicket`, fechas de
              transacción, montos facturados en USD y estado de confirmación).
            </p>
          </div>
          <button
            type="button"
            disabled={downloading === 'reservas-excel'}
            onClick={() =>
              handleDescargarExcel(
                'reservas-excel',
                'Facturación de Reservas',
                'Reporte_Reservas'
              )
            }
            className="mt-5 w-full h-9 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>
              {downloading === 'reservas-excel'
                ? 'Consultando BD...'
                : 'Descargar Reporte Reservas (.xlsx)'}
            </span>
          </button>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                Sistema AeroManager
              </span>
              <span className="material-symbols-outlined text-emerald-600">groups</span>
            </div>
            <h3 className="text-base font-bold text-[#18181B] mt-3">
              Padrón General de Pasajeros
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Exporta la nómina completa de la tabla Pasajero registrada en mostrador con documento
              de identidad, correo, teléfono y país de nacionalidad.
            </p>
          </div>
          <button
            type="button"
            disabled={downloading === 'pasajeros-excel'}
            onClick={() =>
              handleDescargarExcel(
                'pasajeros-excel',
                'Padrón de Pasajeros',
                'Reporte_Pasajeros'
              )
            }
            className="mt-5 w-full h-9 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>
              {downloading === 'pasajeros-excel'
                ? 'Consultando BD...'
                : 'Descargar Padrón Pasajeros (.xlsx)'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabla de Historial de Descargas Recientes */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F4F4F5] border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#18181B]">
              Historial de Descargas Efectuadas en esta Terminal
            </h2>
            <span className="text-[11px] text-zinc-500">
              Se registra automáticamente cada vez que se descarga un archivo .xlsx desde la API
            </span>
          </div>
          <span className="font-mono-code text-xs text-zinc-600">
            Descargas: <strong>{historial.length}</strong>
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Código</th>
              <th className="py-2.5 px-4 font-semibold">Módulo Exportado</th>
              <th className="py-2.5 px-4 font-semibold">Archivo Generado</th>
              <th className="py-2.5 px-4 font-semibold">Fecha y Hora</th>
              <th className="py-2.5 px-4 font-semibold text-right">Tamaño</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {historial.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  Aún no se han realizado descargas en esta sesión. Haga clic en cualquiera de los 3
                  botones superiores para exportar.
                </td>
              </tr>
            ) : (
              historial.map((h) => (
                <tr key={h.id + h.fechaDescarga} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono-code text-zinc-500">{h.id}</td>
                  <td className="py-3 px-4 font-semibold text-[#18181B]">{h.tipoReporte}</td>
                  <td className="py-3 px-4 font-mono-code text-emerald-700 font-semibold">
                    {h.archivo}
                  </td>
                  <td className="py-3 px-4 font-mono-code text-zinc-600">
                    {new Date(h.fechaDescarga).toLocaleString('es-PE')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-code text-zinc-500">
                    {(h.tamanoBytes / 1024).toFixed(1)} KB
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
