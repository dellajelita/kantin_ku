"use client";

import { useState, useEffect } from "react";
import { menu } from "../data/menu";
import MenuCard from "../components/MenuCard";

type MenuItem = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi?: string;
};

export default function FavoritPage() {
  const [mounted, setMounted] = useState(false);
  const [favoritList, setFavoritList] = useState<MenuItem[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const savedFav = JSON.parse(
        localStorage.getItem("favorit") || "[]",
      ) as number[];
      setFavoritList(menu.filter((m) => savedFav.includes(m.id)));
    } catch {
      setFavoritList([]);
    }

    const handleFavoritBerubah = () => {
      try {
        const savedFav = JSON.parse(
          localStorage.getItem("favorit") || "[]",
        ) as number[];
        setFavoritList(menu.filter((m) => savedFav.includes(m.id)));
      } catch {
        setFavoritList([]);
      }
    };

    window.addEventListener("favorit-berubah", handleFavoritBerubah);
    return () => {
      window.removeEventListener("favorit-berubah", handleFavoritBerubah);
    };
  }, []);

  // Mencegah perbedaan render HTML server & client secara mutlak
  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-0 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Favorit Kamu</h1>
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
          <p className="text-gray-500 font-medium">Memuat menu favorit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-0 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Menu Favorit Kamu</h1>

      {favoritList.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
          <p className="text-gray-500 font-medium">
            Belum ada menu favorit yang ditambahkan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favoritList.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
