"use client";

import { useState } from "react";
import { menu } from "../data/menu";
import MenuCard from "../components/MenuCard";

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [urutan, setUrutan] = useState("awal");

  // 1. Filter berdasarkan Pencarian & Kategori
  let filteredMenu = menu.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategori === "Semua" || item.kategori === kategori;
    return matchSearch && matchKategori;
  });

  // 2. Sort berdasarkan opsi Urutan
  if (urutan === "murah") {
    filteredMenu.sort((a, b) => a.harga - b.harga);
  } else if (urutan === "mahal") {
    filteredMenu.sort((a, b) => b.harga - a.harga);
  } else if (urutan === "az") {
    filteredMenu.sort((a, b) => a.nama.localeCompare(b.nama));
  }

  const listKategori = ["Semua", "Makanan", "Minuman", "Camilan"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Katalog Menu Kantin
        </h1>
        <p className="text-gray-500 text-sm">
          Pilih dan cari makanan atau minuman favoritmu
        </p>
      </div>

      {/* Control Panel: Pencarian, Kategori, Urutan */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Input Cari */}
        <input
          type="text"
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800"
        />

        {/* Filter Kategori (Sudah menggunakan tema Emerald) */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {listKategori.map((kat) => (
            <button
              key={kat}
              onClick={() => setKategori(kat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                kategori === kat
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* Pilihan Urutan */}
        <select
          value={urutan}
          onChange={(e) => setUrutan(e.target.value)}
          className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-700 bg-white"
        >
          <option value="awal">Urutan awal</option>
          <option value="murah">Harga termurah</option>
          <option value="mahal">Harga termahal</option>
          <option value="az">Nama A–Z</option>
        </select>
      </div>

      {/* Grid Katalog Menu */}
      {filteredMenu.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMenu.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Tampilan jika tidak ditemukan */
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 font-medium">Menu tidak ditemukan.</p>
        </div>
      )}
    </div>
  );
}
