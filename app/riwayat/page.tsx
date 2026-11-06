"use client";

import { useState, useEffect } from "react";
import { rupiah } from "../data/menu";
import Link from "next/link";

type RiwayatItem = {
  nama: string;
  jumlah: number;
  total: number;
};

type Transaksi = {
  nama: string;
  items: RiwayatItem[];
  subtotal: number;
  diskon: number;
  ongkir: number;
  caraAmbil: string;
  kelas: string | null;
  totalBayar: number;
  waktu: string;
};

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<Transaksi[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRiwayat = JSON.parse(localStorage.getItem("riwayat") || "[]");
    // Urutkan dari yang terbaru di atas
    setRiwayat(savedRiwayat.reverse());
  }, []);

  if (!mounted) return null;

  const totalBelanjaSemua = riwayat.reduce(
    (acc, curr) => acc + curr.totalBayar,
    0,
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-0 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Riwayat Pesanan</h1>

      {riwayat.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-4">
          <p className="text-gray-500 font-medium">Belum ada pesanan.</p>
          <Link
            href="/menu"
            className="inline-block bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            Pesan Menu Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ringkasan Total */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-2 text-emerald-900 font-medium text-sm">
            <span>Total Pesanan: {riwayat.length} transaksi</span>
            <span>Akumulasi Belanja: {rupiah(totalBelanjaSemua)}</span>
          </div>

          {/* List Riwayat */}
          <div className="space-y-4">
            {riwayat.map((trx, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{trx.nama}</h3>
                    <p className="text-xs text-gray-500">{trx.waktu}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full uppercase">
                    {trx.caraAmbil} {trx.kelas ? `(${trx.kelas})` : ""}
                  </span>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  {trx.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        {item.nama} x{item.jumlah}
                      </span>
                      <span className="font-medium">{rupiah(item.total)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center font-bold text-sm">
                  <span className="text-gray-600">Total Bayar</span>
                  <span className="text-emerald-600">
                    {rupiah(trx.totalBayar)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
