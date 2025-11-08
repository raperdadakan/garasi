import React, { useState } from 'react';
import { Customer } from '../types';
import { TOTAL_ROOMS } from '../constants';
import { formatCurrency, formatDate, calculateNextDueDate } from '../lib/utils';
import { CarIcon, XIcon } from './icons';

interface RoomGridProps {
  customers: Customer[];
}

const RoomDetailModal: React.FC<{ customer: Customer; onClose: () => void }> = ({ customer, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">Detail Room #{customer.roomNumber}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 space-y-4">
                {customer.fotoKendaraan && (
                    <img src={customer.fotoKendaraan} alt={customer.jenisMobil} className="w-full h-48 object-cover rounded-md" />
                )}
                <div>
                    <p className="text-sm text-slate-400">Nama Customer</p>
                    <p className="text-lg text-white font-semibold">{customer.nama}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-400">No. HP</p>
                    <p className="text-lg text-white">{customer.noHP}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Mobil</p>
                    <p className="text-lg text-white">{customer.jenisMobil} ({customer.noKendaraan})</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-slate-400">Harga per Bulan</p>
                        <p className="text-lg text-blue-400 font-semibold">{formatCurrency(customer.harga)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-slate-400">Periode Sewa</p>
                        <p className="text-lg text-white">{customer.periodeBulan || 1} Bulan</p>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Jatuh Tempo Berikutnya</p>
                    <p className="text-lg text-red-500 font-bold">{formatDate(calculateNextDueDate(customer.tanggalMulai, customer.periodeBulan || 1))}</p>
                </div>
            </div>
        </div>
    </div>
);


export const RoomGrid: React.FC<RoomGridProps> = ({ customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const occupiedRooms = new Map(customers.map(c => [c.roomNumber, c]));

  return (
    <div className="p-4 md:p-8">
       <h2 className="text-xl font-bold text-white mb-6 text-center">Status Room Garasi</h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-4">
        {Array.from({ length: TOTAL_ROOMS }, (_, i) => i + 1).map(roomNumber => {
          const customer = occupiedRooms.get(roomNumber);
          const isOccupied = !!customer;
          const roomClasses = `aspect-square flex flex-col justify-center items-center rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105`;
          const occupiedClasses = "bg-red-800 hover:bg-red-700 text-white";
          const emptyClasses = "bg-slate-700 hover:bg-slate-600 text-slate-400";
          
          return (
            <div
              key={roomNumber}
              className={`${roomClasses} ${isOccupied ? occupiedClasses : emptyClasses}`}
              onClick={() => isOccupied && setSelectedCustomer(customer)}
            >
              <CarIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-1"/>
              <span className="font-bold text-lg sm:text-xl">{roomNumber}</span>
              <span className="text-xs">{isOccupied ? 'Terisi' : 'Kosong'}</span>
            </div>
          );
        })}
      </div>
      {selectedCustomer && <RoomDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
    </div>
  );
};