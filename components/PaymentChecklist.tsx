
import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { CheckCircle2, XCircle, Calendar, Search, Filter } from 'lucide-react';

interface PaymentChecklistProps {
  students: string[];
  transactions: Transaction[];
}

const PaymentChecklist: React.FC<PaymentChecklistProps> = ({ students, transactions }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  // Logic untuk memetakan pembayaran ke siswa
  const checklistData = useMemo(() => {
    // 1. Filter transaksi yang relevan (Pemasukan, Kategori Iuran)
    const relevantTransactions = transactions.filter(t => {
      // Jika ada paymentDate (Bulan Iuran spesifik), gunakan tahun dari situ.
      // Jika tidak, gunakan tahun dari tanggal transaksi.
      const dateToCheck = t.paymentDate ? new Date(t.paymentDate) : new Date(t.date);
      const tYear = dateToCheck.getFullYear();

      return (
        t.type === TransactionType.INCOME &&
        t.category === Category.DUES &&
        tYear === selectedYear &&
        t.studentName // Pastikan ada nama siswanya
      );
    });

    // 2. Buat map untuk akses cepat
    // Format Key: "NAMA_SISWA-BULAN_INDEX" (contoh: "BUDI-0" untuk Budi di Januari)
    const paymentMap = new Set<string>();
    
    relevantTransactions.forEach(t => {
      if (t.studentName) {
        // Logika Penting: Gunakan paymentDate jika ada untuk menentukan kolom bulan
        const dateToCheck = t.paymentDate ? new Date(t.paymentDate) : new Date(t.date);
        const monthIndex = dateToCheck.getMonth();
        
        // Normalisasi nama (lowercase trim) untuk pencocokan yang lebih baik
        const key = `${t.studentName.trim().toLowerCase()}-${monthIndex}`;
        paymentMap.add(key);
      }
    });

    // 3. Gabungkan dengan daftar siswa
    const data = students.map(student => {
      const statusPerMonth = months.map((_, index) => {
        const key = `${student.trim().toLowerCase()}-${index}`;
        return paymentMap.has(key);
      });

      // Hitung total bayar setahun
      const totalPaid = statusPerMonth.filter(Boolean).length;

      return {
        name: student,
        status: statusPerMonth,
        totalPaid
      };
    });

    // 4. Filter berdasarkan pencarian nama
    if (searchTerm) {
      return data.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return data; // Urutkan sesuai input (biasanya abjad dari AdminPanel)
  }, [students, transactions, selectedYear, searchTerm]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const totalStudents = students.length || 1; // avoid division by zero
    const totalMonths = 12;
    const totalExpected = totalStudents * totalMonths;
    const currentFilled = checklistData.reduce((acc, curr) => acc + curr.totalPaid, 0);
    const percentage = Math.round((currentFilled / totalExpected) * 100);
    
    return { percentage, currentFilled, totalExpected };
  }, [students, checklistData]);

  if (students.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl text-center">
        <div className="p-4 bg-slate-100 text-slate-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Filter size={32} />
        </div>
        <h3 className="text-lg font-black text-slate-700">Belum Ada Data Siswa</h3>
        <p className="text-slate-400 text-sm mt-2">Silakan tambahkan daftar nama siswa di menu <strong>Pengaturan Admin</strong> terlebih dahulu agar tabel ceklis muncul.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Filter */}
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-6 md:p-8 border border-white/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Ceklis Iuran</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pantau Kedisiplinan Pembayaran</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari Nama Siswa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-400 outline-none transition-all"
            />
          </div>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-3 bg-indigo-50 text-indigo-700 border-2 border-indigo-100 rounded-2xl text-sm font-black outline-none focus:border-indigo-400"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      {/* Tabel Ceklis */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white overflow-hidden">
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-100">
                <th className="sticky left-0 z-20 bg-slate-50 p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[150px] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                  Nama Siswa
                </th>
                {months.map(m => (
                  <th key={m} className="p-4 text-center text-[10px] font-black text-indigo-400 uppercase tracking-widest min-w-[60px]">
                    {m}
                  </th>
                ))}
                <th className="p-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[80px]">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {checklistData.map((row, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="sticky left-0 z-10 bg-white p-4 text-xs font-black text-slate-700 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] group-hover:bg-indigo-50/30 transition-colors whitespace-nowrap">
                    {row.name}
                  </td>
                  {row.status.map((isPaid, mIdx) => (
                    <td key={mIdx} className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        {isPaid ? (
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                            <CheckCircle2 size={16} />
                          </div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-100"></div>
                        )}
                      </div>
                    </td>
                  ))}
                  <td className="p-4 text-center">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${row.totalPaid >= 12 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      {row.totalPaid}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend / Keterangan */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-end px-4">
        <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-white shadow-sm">
           <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={12} /></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sudah Bayar</span>
        </div>
        <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-white shadow-sm">
           <div className="w-2 h-2 rounded-full bg-slate-200 ml-1.5 mr-1.5"></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Belum</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentChecklist;
