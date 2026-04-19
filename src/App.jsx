import { useState } from 'react';
import AppShell from './components/AppShell';
import Home from './Home';
import DcfModeler from './tools/DcfModeler';
import LeaseCalc from './tools/LeaseCalc';
import SaasPlanner from './tools/SaasPlanner';
import EngEconomics from './tools/EngEconomics';
import VaultMerge from './tools/VaultMerge';

export default function App() {
  const [page, setPage] = useState('home');

  const view = (() => {
    switch (page) {
      case 'dcf':   return <DcfModeler />;
      case 'lease': return <LeaseCalc />;
      case 'saas':  return <SaasPlanner />;
      case 'eng':   return <EngEconomics />;
      case 'vault': return <VaultMerge />;
      default:      return <Home onNavigate={setPage} />;
    }
  })();

  return (
    <AppShell active={page} onNavigate={setPage}>
      {view}
    </AppShell>
  );
}
