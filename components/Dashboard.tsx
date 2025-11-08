
import React, { useState } from 'react';
import { Customer, Expense } from '../types';
import { TOTAL_ROOMS } from '../constants';
import { formatCurrency, formatDate, calculateNextDueDate, capitalizeWords } from '../lib/utils';
import { differenceInDays, isWithinInterval, startOfToday, addDays, isSameMonth, parseISO } from 'date-fns';
import { PlusCircleIcon, TrashIcon, DownloadIcon } from './icons';

interface DashboardProps {
    customers: Customer[];
    expenses: Expense[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onDeleteExpense: (expenseId: string) => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, colorClass }) => (
  <div className="bg-slate-900 p-6 rounded-lg shadow-lg">
    <h3 className="text-slate-400 text-sm font-medium uppercase">{title}</h3>
    <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ customers, expenses, onAddExpense, onDeleteExpense }) => {
  const occupiedRooms = customers.length;
  const emptyRooms = TOTAL_ROOMS - occupiedRooms;

  const today = startOfToday();
  const nextSevenDays = addDays(today, 7);
  
  const dueSoonCustomers = customers.map(customer => ({
    ...customer,
    nextDueDate: calculateNextDueDate(customer.tanggalMulai, customer.periodeBulan || 1)
  })).filter(customer => {
    return isWithinInterval(customer.nextDueDate, { start: today, end: nextSevenDays });
  }).sort((a,b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());

  const thisMonthGrossRevenue = customers.reduce((total, customer) => total + (customer.harga || 0), 0);
  const thisMonthExpensesList = expenses.filter(expense => isSameMonth(parseISO(expense.tanggal), today));
  const thisMonthExpenses = thisMonthExpensesList.reduce((total, expense) => total + expense.harga, 0);
  const netRevenue = thisMonthGrossRevenue - thisMonthExpenses;

  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseHarga, setExpenseHarga] = useState(0);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);


  const handleExpenseHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9]/g, '');
      setExpenseHarga(parseInt(rawValue, 10) || 0);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!expenseDesc || expenseHarga <= 0 || !expenseDate) {
          alert("Deskripsi, tanggal, dan harga pengeluaran tidak boleh kosong.");
          return;
      }
      onAddExpense({
          deskripsi: expenseDesc,
          harga: expenseHarga,
          tanggal: new Date(expenseDate).toISOString(),
      });
      setExpenseDesc('');
      setExpenseHarga(0);
      setExpenseDate(new Date().toISOString().split('T')[0]);
  };
  
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 10);

  const handleDownloadSummary = () => {
    const today = new Date();
    const monthName = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    let content = `Laporan Keuangan Garasi Sumber Jaya\n`;
    content += `Bulan: ${monthName}\n`;
    content += `=========================================\n\n`;

    content += `RINGKASAN KEUANGAN\n`;
    content += `-----------------------------------------\n`;
    content += `Pendapatan Kotor: ${formatCurrency(thisMonthGrossRevenue)}\n`;
    content += `Total Pengeluaran: ${formatCurrency(thisMonthExpenses)}\n`;
    content += `Pendapatan Bersih: ${formatCurrency(netRevenue)}\n\n`;

    content += `DETAIL PENDAPATAN (CUSTOMER AKTIF)\n`;
    content += `-----------------------------------------\n`;
    if (customers.length > 0) {
      customers.forEach(customer => {
        content += `- ${customer.nama} (Room ${customer.roomNumber}): ${formatCurrency(customer.harga)}\n`;
      });
    } else {
      content += `Tidak ada customer aktif.\n`;
    }
    content += `\n`;

    content += `DETAIL PENGELUARAN BULAN INI\n`;
    content += `-----------------------------------------\n`;
    if (thisMonthExpensesList.length > 0) {
      thisMonthExpensesList.forEach(expense => {
        content += `- ${formatDate(expense.tanggal)}: ${expense.deskripsi} - ${formatCurrency(expense.harga)}\n`;
      });
    } else {
      content += `Tidak ada pengeluaran bulan ini.\n`;
    }
    content += `\n`;

    content += `=========================================\n`;
    content += `Laporan dibuat pada: ${formatDate(today)}\n`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileNameDate = today.toISOString().split('T')[0].replace(/-/g, '');
    link.download = `Laporan_Garasi_Sumber_Jaya_${fileNameDate}.txt`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Dashboard</h2>
        <button 
          onClick={handleDownloadSummary} 
          className="flex items-center gap-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors duration-200 w-full sm:w-auto"
        >
          <DownloadIcon className="w-5 h-5"/>
          <span>Download Laporan</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Room Terisi" value={occupiedRooms} colorClass="text-green-500" />
        <StatCard title="Room Kosong" value={emptyRooms} colorClass="text-yellow-500" />
        <StatCard title="Akan Jatuh Tempo" value={dueSoonCustomers.length} colorClass="text-orange-400" />
        <StatCard title="Pendapatan Kotor" value={formatCurrency(thisMonthGrossRevenue)} colorClass="text-blue-500" />
        <StatCard title="Pengeluaran Bulan Ini" value={formatCurrency(thisMonthExpenses)} colorClass="text-red-500" />
        <StatCard title="Pendapatan Bersih" value={formatCurrency(netRevenue)} colorClass={netRevenue >= 0 ? 'text-green-400' : 'text-red-400'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">
            Customer Akan Jatuh Tempo ({dueSoonCustomers.length})
          </h2>
          {dueSoonCustomers.length > 0 ? (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-slate-300">
                <thead>
                  <tr className="border-b border-slate-700 sticky top-0 bg-slate-900">
                    <th className="p-3">Nama</th>
                    <th className="p-3">Room</th>
                    <th className="p-3">Tgl Jatuh Tempo</th>
                    <th className="p-3">Sisa Hari</th>
                  </tr>
                </thead>
                <tbody>
                  {dueSoonCustomers.map(customer => {
                    const daysLeft = differenceInDays(customer.nextDueDate, today);
                    return (
                      <tr key={customer.id} className="border-b border-slate-800 hover:bg-slate-800">
                        <td className="p-3 font-medium">{customer.nama}</td>
                        <td className="p-3">{customer.roomNumber}</td>
                        <td className="p-3 text-red-500 font-semibold">{formatDate(customer.nextDueDate)}</td>
                        <td className={`p-3 font-bold ${daysLeft <= 3 ? 'text-red-500' : 'text-yellow-500'}`}>
                          {daysLeft} hari
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400">Tidak ada customer yang akan jatuh tempo dalam 7 hari ke depan.</p>
          )}
        </div>

        <div className="bg-slate-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">
            Manajemen Pengeluaran
          </h2>
          <form onSubmit={handleAddExpenseSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <input 
                type="text"
                placeholder="e.g., Bayar Listrik"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(capitalizeWords(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
             <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal</label>
                <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">Harga</label>
              <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-400">Rp</span>
                  </div>
                  <input
                      type="text"
                      value={new Intl.NumberFormat('id-ID').format(expenseHarga)}
                      onChange={handleExpenseHargaChange}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
              </div>
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200">
              <PlusCircleIcon className="w-5 h-5"/>
              <span>Tambah</span>
            </button>
          </form>

          <div className="overflow-x-auto max-h-64">
             <h3 className="text-lg font-semibold text-white mb-2">10 Pengeluaran Terakhir</h3>
            <table className="w-full text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-700 sticky top-0 bg-slate-900">
                  <th className="p-3">Deskripsi</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Harga</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.length > 0 ? recentExpenses.map(expense => (
                  <tr key={expense.id} className="border-b border-slate-800 hover:bg-slate-800">
                    <td className="p-3 font-medium">{expense.deskripsi}</td>
                    <td className="p-3 text-slate-400">{formatDate(expense.tanggal)}</td>
                    <td className="p-3">{formatCurrency(expense.harga)}</td>
                    <td className="p-3">
                      <button onClick={() => {
                          if(window.confirm(`Yakin ingin menghapus pengeluaran "${expense.deskripsi}"?`)) {
                              onDeleteExpense(expense.id)
                          }
                      }} className="text-red-600 hover:text-red-500">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                      <td colSpan={4} className="text-center p-6 text-slate-500">
                          Belum ada data pengeluaran.
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};