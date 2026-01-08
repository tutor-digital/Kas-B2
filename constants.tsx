
import React from 'react';
import { LayoutDashboard, List, BarChart3, Bot, Settings, ClipboardList } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'report', label: 'Laporan Kas', icon: <ClipboardList size={20} /> },
  { id: 'transactions', label: 'Transaksi', icon: <List size={20} /> },
  { id: 'analytics', label: 'Analisis', icon: <BarChart3 size={20} /> },
  { id: 'ai-assistant', label: 'AI Konsultan', icon: <Bot size={20} /> },
  { id: 'admin', label: 'Pengaturan Admin', icon: <Settings size={20} /> },
];

export const APP_THEME = {
  primary: 'indigo-600',
  secondary: 'slate-100',
  income: 'emerald-500',
  expense: 'rose-500',
};
