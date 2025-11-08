import React, { useState } from 'react';
import { Customer } from '../types';
import { formatCurrency, formatDate, calculateNextDueDate } from '../lib/utils';
import { EditIcon, TrashIcon, PlusCircleIcon } from './icons';

interface CustomerListProps {
  customers: Customer[];
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.noKendaraan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.roomNumber.toString().includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-8">
      <div className="bg-slate-900 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-white">Manajemen Customer ({customers.length})</h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari (nama, no plat, room)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button onClick={onAdd} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200">
              <PlusCircleIcon className="w-5 h-5"/>
              <span>Tambah</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-3">Nama</th>
                <th className="p-3 hidden md:table-cell">No. Kendaraan</th>
                <th className="p-3">Room</th>
                <th className="p-3 hidden lg:table-cell">Periode</th>
                <th className="p-3 hidden lg:table-cell">Jatuh Tempo Berikutnya</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                <tr key={customer.id} className="border-b border-slate-800 hover:bg-slate-800">
                  <td className="p-3 font-medium text-white">{customer.nama}</td>
                  <td className="p-3 hidden md:table-cell">{customer.noKendaraan}</td>
                  <td className="p-3">{customer.roomNumber}</td>
                  <td className="p-3 hidden lg:table-cell">{customer.periodeBulan || 1} bulan</td>
                  <td className="p-3 hidden lg:table-cell font-semibold text-red-500">{formatDate(calculateNextDueDate(customer.tanggalMulai, customer.periodeBulan || 1))}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onEdit(customer)} className="text-yellow-500 hover:text-yellow-400">
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => {
                          if(window.confirm(`Yakin ingin menghapus data ${customer.nama}?`)) {
                              onDelete(customer.id)
                          }
                      }} className="text-red-600 hover:text-red-500">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={7} className="text-center p-6 text-slate-500">
                        Data customer tidak ditemukan.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};