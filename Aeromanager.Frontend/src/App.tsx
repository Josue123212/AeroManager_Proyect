import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import AdminHeader from './components/layout/AdminHeader';
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
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
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
