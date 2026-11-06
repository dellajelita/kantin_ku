"use client";

import { useState, useEffect } from "react";
import { rupiah } from "../data/menu";
import Link from "next/link";

type MenuItem = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi?: string;
};

export default function FavoritPage() {
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [favIds, setFavIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedFav = JSON.parse(localStorage.getItem("favorit") || "[]");
    setFavIds(savedFav);

    fetch("/api/menu")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data menu.");
        return res.json();
      })
      .then((data) => {
        setMenuList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const menuFavorit = menuList.filter((m) => favIds.includes(m.id));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-gray-500 font-medium">
        Memuat...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-0 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Menu Favorit Saya</h1>

      {menuFavorit.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-4">
          <p className="text-gray-500 font-medium">Belum ada menu favorit.</p>
          <Link
            href="/menu"
            className="inline-block bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            Jelajahi Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menuFavorit.map((item) => (
            <Link
              key={item.id}
              href={`/menu/${item.id}`}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-500 transition space-y-2 block"
            >
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                {item.kategori}
              </span>
              <h3 className="font-bold text-gray-900 text-lg">{item.nama}</h3>
              <p className="text-emerald-600 font-semibold">
                {rupiah(item.harga)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
