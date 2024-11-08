import React from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutGrid, Ticket, Globe, Heart } from 'lucide-react';
import Navbar from './Navbar';

const navItems = [
  {
    icon: LayoutGrid,
    label: 'Dashboard',
    path: '/',
  },
  {
    icon: Ticket,
    label: 'Tickets',
    path: '/tickets',
  },
  {
    icon: Globe,
    label: 'Websites',
    path: '/websites',
  },
];

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <Navbar items={navItems} />
      <main className="flex-1 bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;