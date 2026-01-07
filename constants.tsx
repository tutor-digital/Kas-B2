
import React from 'react';
import { LayoutDashboard, Receipt, BarChart3, Bot } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Laporan Kas B2', icon: <LayoutDashboard size={20} /> },
  { id: 'transactions', label: 'Transaksi', icon: <Receipt size={20} /> },
  { id: 'analytics', label: 'Analisis', icon: <BarChart3 size={20} /> },
  { id: 'ai-assistant', label: 'AI Konsultan', icon: <Bot size={20} /> },
];

export const APP_THEME = {
  primary: 'indigo-600',
  secondary: 'slate-100',
  income: 'emerald-500',
  expense: 'rose-500',
};