import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MemberManagement from './pages/MemberManagement';
import Onboarding from './pages/Onboarding';
import Reporting from './pages/Reporting';
import Campaigns from './pages/Campaigns';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<MemberManagement />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="reporting" element={<Reporting />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
