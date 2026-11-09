"use client";

import Link from "next/link";
import { rupiah } from "../data/menu";
import { useState } from "react";

type MenuItem = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi?: string;
};

export default function MenuCard({ item }: { item: MenuItem }) {
  const isHabis = item.stok === 0;

  const [isFavorit, setIsFavorit] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const savedFav = JSON.parse(
        localStorage.getItem("favorit") || "[]",
      ) as number[];
      return savedFav.includes(item.id);
    } catch {
      return false;
    }
  });

  const toggleFavoritCard = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      let savedFav = JSON.parse(
        localStorage.getItem("favorit") || "[]",
      ) as number[];
      if (isFavorit) {
        savedFav = savedFav.filter((favId: number) => favId !== item.id);
        setIsFavorit(false);
      } else {
        savedFav.push(item.id);
        setIsFavorit(true);
      }
      localStorage.setItem("favorit", JSON.stringify(savedFav));
      window.dispatchEvent(new Event("favorit-berubah"));
    } catch {
      // ignore
    }
  };

  return (
    <Link
      href={`/menu/${item.id}`}
      className={`bg-white p-6 rounded-2xl border transition flex flex-col justify-between space-y-4 group relative ${
        isHabis
          ? "opacity-60 bg-gray-50 border-gray-200 cursor-not-allowed"
          : "border-gray-200 hover:border-emerald-500 hover:shadow-md"
      }`}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isHabis
                ? "bg-gray-200 text-gray-600"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {isHabis ? "Habis" : item.kategori}
          </span>

          <button
            type="button"
            onClick={toggleFavoritCard}
            className={`p-2 rounded-xl text-xs font-bold transition ${
              isFavorit
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50"
            }`}
            title="Suka / Favorit"
          >
            {isFavorit ? "♥" : "♡"}
          </button>
        </div>

        <h3
          className={`font-bold text-lg transition ${
            isHabis
              ? "text-gray-500"
              : "text-gray-900 group-hover:text-emerald-600"
          }`}
        >
          {item.nama}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2">
          {item.deskripsi || "Menu lezat dan higienis dari kantin sekolah."}
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span
          className={`font-bold text-base ${isHabis ? "text-gray-400" : "text-emerald-600"}`}
        >
          {rupiah(item.harga)}
        </span>
        <span className="text-xs font-medium text-gray-500">
          Stok:{" "}
          <span
            className={
              isHabis ? "text-red-500 font-bold" : "text-gray-900 font-bold"
            }
          >
            {item.stok}
          </span>
        </span>
      </div>
    </Link>
  );
}
