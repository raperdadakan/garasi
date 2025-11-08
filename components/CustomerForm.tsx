import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { fileToBase64, capitalizeWords } from '../lib/utils';
import { addMonths } from 'date-fns';

interface CustomerFormProps {
  onSubmit: (customer: Omit<Customer, 'id'>, id?: string) => void;
  onCancel: () => void;
  initialData?: Customer | null;
  occupiedRooms: number[];
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input {...props} className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600" />
    </div>
);

export const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onCancel, initialData, occupiedRooms }) => {
  const [formData, setFormData] = useState({
    nama: '',
    noHP: '',
    jenisMobil: '',
    noKendaraan: '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    roomNumber: 0,
    harga: 0,
    fotoKendaraan: '',
    periodeBulan: 1,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama,
        noHP: initialData.noHP,
        jenisMobil: initialData.jenisMobil,
        noKendaraan: initialData.noKendaraan,
        tanggalMulai: new Date(initialData.tanggalMulai).toISOString().split('T')[0],
        roomNumber: initialData.roomNumber,
        harga: initialData.harga,
        fotoKendaraan: initialData.fotoKendaraan,
        periodeBulan: initialData.periodeBulan || 1,
      });
      setImagePreview(initialData.fotoKendaraan);
    } else {
        // Reset form when adding a new customer after editing
        setFormData({
            nama: '',
            noHP: '',
            jenisMobil: '',
            noKendaraan: '',
            tanggalMulai: new Date().toISOString().split('T')[0],
            roomNumber: 0,
            harga: 0,
            fotoKendaraan: '',
            periodeBulan: 1,
        });
        setImagePreview(null);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: string | number = value;

    if (['nama', 'jenisMobil'].includes(name)) {
      processedValue = capitalizeWords(value);
    } else if (name === 'noKendaraan') {
      processedValue = value.toUpperCase();
    } else if (['roomNumber', 'periodeBulan'].includes(name)) {
      processedValue = parseInt(value, 10);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };
  
  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = parseInt(rawValue, 10) || 0;
    setFormData(prev => ({ ...prev, harga: numericValue }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setFormData(prev => ({ ...prev, fotoKendaraan: base64 }));
      setImagePreview(base64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.roomNumber === 0) {
      alert("Silakan pilih nomor room.");
      return;
    }
    
    const tanggalMulaiDate = new Date(formData.tanggalMulai);
    const tanggalJatuhTempo = addMonths(tanggalMulaiDate, formData.periodeBulan).toISOString();

    const customerDataToSubmit = {
        ...formData,
        tanggalJatuhTempo,
    };

    onSubmit(customerDataToSubmit, initialData?.id);
  };
  
  const availableRooms = Array.from({ length: 30 }, (_, i) => i + 1)
    .filter(room => !occupiedRooms.includes(room) || room === initialData?.roomNumber);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Nama Customer" name="nama" value={formData.nama} onChange={handleChange} required />
        <InputField label="No. HP" name="noHP" type="tel" value={formData.noHP} onChange={handleChange} required />
        <InputField label="Jenis Mobil" name="jenisMobil" value={formData.jenisMobil} onChange={handleChange} required />
        <InputField label="No. Kendaraan" name="noKendaraan" value={formData.noKendaraan} onChange={handleChange} required />
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Tanggal Mulai Sewa" name="tanggalMulai" type="date" value={formData.tanggalMulai} onChange={handleChange} required />
         <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Periode (Bulan)</label>
            <select
              name="periodeBulan"
              value={formData.periodeBulan}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map(p => (
                <option key={p} value={p}>{p} Bulan</option>
              ))}
            </select>
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Harga per Bulan</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-400">Rp</span>
                </div>
                <input
                    name="harga"
                    type="text"
                    value={new Intl.NumberFormat('id-ID').format(formData.harga)}
                    onChange={handleHargaChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nomor Room</label>
            <select
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value={0} disabled>Pilih Room</option>
              {initialData?.roomNumber && <option value={initialData.roomNumber}>Room {initialData.roomNumber} (Saat ini)</option>}
              {availableRooms.map(room => (
                <option key={room} value={room}>Room {room}</option>
              ))}
            </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Foto Kendaraan</label>
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"/>
        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 w-48 h-32 object-cover rounded-md"/>}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-slate-700 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-600">
          Batal
        </button>
        <button type="submit" className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">
          Simpan
        </button>
      </div>
    </form>
  );
};