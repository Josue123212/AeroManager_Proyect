import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute, { getSessionHomePath } from './components/auth/ProtectedRoute';
import AdminHeader from './components/layout/AdminHeader';
import OperatorSidebar from './components/layout/OperatorSidebar';
import CounterNavbar from './components/layout/CounterNavbar';
import SuperAdminHeader from './components/layout/SuperAdminHeader';
import SuperAdminDashboardPage from './pages/superadmin/SuperAdminDashboardPage';
import SuperAdminUsuariosPage from './pages/superadmin/SuperAdminUsuariosPage';
import SuperAdminRolesPermisosPage from './pages/superadmin/SuperAdminRolesPermisosPage';
import DashboardEjecutivoPage from './pages/admin/DashboardEjecutivoPage';
import PaisesPage from './pages/admin/catalogos/PaisesPage';
import CiudadesPage from './pages/admin/catalogos/CiudadesPage';
import TiposDocumentoPage from './pages/admin/catalogos/TiposDocumentoPage';
import AeropuertosPage from './pages/admin/infraestructura/AeropuertosPage';
import TerminalesPage from './pages/admin/infraestructura/TerminalesPage';
import PuertasEmbarquePage from './pages/admin/infraestructura/PuertasEmbarquePage';
import AerolineasPage from './pages/admin/flota/AerolineasPage';
import ModelosAvionPage from './pages/admin/flota/ModelosAvionPage';
import AvionesPage from './pages/admin/flota/AvionesPage';
import ClasesAsientoPage from './pages/admin/flota/ClasesAsientoPage';
import AsientosPage from './pages/admin/flota/AsientosPage';
import UsuariosPage from './pages/admin/seguridad/UsuariosPage';
import RolesPermisosPage from './pages/admin/seguridad/RolesPermisosPage';
import ReportesExcelPage from './pages/admin/operaciones/ReportesExcelPage';
import AsistenteIaPage from './pages/admin/operaciones/AsistenteIaPage';
import MonitorFidsPage from './pages/operador/MonitorFidsPage';
import RutasOperadorPage from './pages/operador/RutasOperadorPage';
import ProgramacionVuelosPage from './pages/operador/ProgramacionVuelosPage';
import DisponibilidadCabinaPage from './pages/operador/DisponibilidadCabinaPage';
import MonitorGatesPage from './pages/operador/MonitorGatesPage';
import FlotaOperativaPage from './pages/operador/FlotaOperativaPage';
import CarteleraVuelosCounterPage from './pages/counter/CarteleraVuelosCounterPage';
import PadronPasajerosCounterPage from './pages/counter/PadronPasajerosCounterPage';
import MapaCabinaReservaPage from './pages/counter/MapaCabinaReservaPage';
import HistorialTicketsCounterPage from './pages/counter/HistorialTicketsCounterPage';

function RootRedirect() {
  return <Navigate to={getSessionHomePath()} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute allowedRoles={['SuperAdmin']}>
            <SuperAdminHeader>
              <Routes>
                <Route path="dashboard" element={<SuperAdminDashboardPage />} />
                <Route path="usuarios" element={<SuperAdminUsuariosPage />} />
                <Route path="roles-permisos" element={<SuperAdminRolesPermisosPage />} />
                <Route path="*" element={<SuperAdminDashboardPage />} />
              </Routes>
            </SuperAdminHeader>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['Administrador']}>
            <AdminHeader>
              <Routes>
                <Route path="dashboard" element={<DashboardEjecutivoPage />} />
                <Route path="paises" element={<PaisesPage />} />
                <Route path="ciudades" element={<CiudadesPage />} />
                <Route path="tipos-documento" element={<TiposDocumentoPage />} />
                <Route path="aeropuertos" element={<AeropuertosPage />} />
                <Route path="terminales" element={<TerminalesPage />} />
                <Route path="puertas-embarque" element={<PuertasEmbarquePage />} />
                <Route path="aerolineas" element={<AerolineasPage />} />
                <Route path="modelos-avion" element={<ModelosAvionPage />} />
                <Route path="aviones" element={<AvionesPage />} />
                <Route path="clases-asiento" element={<ClasesAsientoPage />} />
                <Route path="asientos" element={<AsientosPage />} />
                <Route path="usuarios" element={<UsuariosPage />} />
                <Route path="roles-permisos" element={<RolesPermisosPage />} />
                <Route path="reportes-excel" element={<ReportesExcelPage />} />
                <Route path="asistente-ia" element={<AsistenteIaPage />} />
                <Route path="*" element={<DashboardEjecutivoPage />} />
              </Routes>
            </AdminHeader>
          </ProtectedRoute>
        }
      />
      <Route
        path="/operador/*"
        element={
          <ProtectedRoute allowedRoles={['Operador']}>
            <OperatorSidebar>
              <Routes>
                <Route path="fids" element={<MonitorFidsPage />} />
                <Route path="rutas" element={<RutasOperadorPage />} />
                <Route path="vuelos" element={<ProgramacionVuelosPage />} />
                <Route path="cabina" element={<DisponibilidadCabinaPage />} />
                <Route path="gates" element={<MonitorGatesPage />} />
                <Route path="flota" element={<FlotaOperativaPage />} />
                <Route path="*" element={<MonitorFidsPage />} />
              </Routes>
            </OperatorSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/counter/*"
        element={
          <ProtectedRoute allowedRoles={['Counter']}>
            <CounterNavbar>
              <Routes>
                <Route path="cartelera" element={<CarteleraVuelosCounterPage />} />
                <Route path="cabina" element={<MapaCabinaReservaPage />} />
                <Route path="pasajeros" element={<PadronPasajerosCounterPage />} />
                <Route path="tickets" element={<HistorialTicketsCounterPage />} />
                <Route path="*" element={<CarteleraVuelosCounterPage />} />
              </Routes>
            </CounterNavbar>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
