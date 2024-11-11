import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TicketManager from './pages/TicketManager';
import Websites from './pages/Websites';
import EventWebsite from './pages/EventWebsite';
import EventManagement from './pages/EventManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tickets/:eventId" element={<TicketManager />} />
          <Route path="websites" element={<Websites />} />
          <Route path="website/:eventId" element={<EventWebsite />} />
          <Route path="event/:eventId" element={<EventManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;