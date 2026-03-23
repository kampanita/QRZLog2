import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LogList from './components/LogList';
import NewQSO from './components/NewQSO';
import Settings from './components/Settings';
import Map from './components/Map';
import Repeaters from './components/Repeaters';
import PMRChannels from './components/PMRChannels';
import Emergencies from './components/Emergencies';
import FMStations from './components/FMStations';
import Hardware from './components/Hardware';
import Contest from './components/Contest';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/logs" element={<LogList />} />
          <Route path="/new" element={<NewQSO />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/map" element={<Map />} />
          <Route path="/repeaters" element={<Repeaters />} />
          <Route path="/pmr" element={<PMRChannels />} />
          <Route path="/emerg" element={<Emergencies />} />
          <Route path="/fm" element={<FMStations />} />
          <Route path="/hardware" element={<Hardware />} />
          <Route path="/contest" element={<Contest />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
