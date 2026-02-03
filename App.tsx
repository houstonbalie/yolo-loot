import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import PlayerRegistration from './pages/PlayerRegistration';
import AdminDistribution from './pages/AdminDistribution';
import ItemRegistration from './pages/ItemRegistration';
import AdminGuard from './components/AdminGuard';

const App: React.FC = () => {
  return (
    <GameProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/drops" element={<Navigate to="/history" replace />} />

            {/* Rotas Protegidas pela Autenticação Anônima + Senha */}
            <Route 
              path="/register" 
              element={
                <AdminGuard>
                  <PlayerRegistration />
                </AdminGuard>
              } 
            />
            <Route 
              path="/items" 
              element={
                <AdminGuard>
                  <ItemRegistration />
                </AdminGuard>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminGuard>
                  <AdminDistribution />
                </AdminGuard>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </GameProvider>
  );
};

export default App;