export interface Customer {
  id: string;
  nama: string;
  noHP: string;
  jenisMobil: string;
  noKendaraan: string;
  tanggalMulai: string; // ISO string date
  tanggalJatuhTempo: string; // ISO string date
  roomNumber: number;
  fotoKendaraan: string; // Base64 string
  harga: number;
  periodeBulan: number;
}

export interface Expense {
  id: string;
  deskripsi: string;
  harga: number;
  tanggal: string; // ISO string date
}
