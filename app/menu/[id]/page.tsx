"use client";

import { use, useState } from "react";
import { menu, rupiah } from "@/app/data/menu";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function DetailMenuPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const item = menu.find((m) => m.id === Number(resolvedParams.id));

  const [jumlah, setJumlah] = useState(1);
  const [pesan, setPesan] = useState("");
  const [pesanError, setPesanError] = useState("");

  if (!item) {
    notFound();
  }

  const handleTambahJumlah = () => {
    if (jumlah >= item.stok) {
      setPesanError(`Jumlah tidak boleh melebihi stok (${item.stok}).`);
      return;
    }
    setPesanError("");
    setJumlah((prev) => prev + 1);
  };

  const handleKurangJumlah = () => {
    if (jumlah > 1) {
      setPesanError("");
      setJumlah((prev) => prev - 1);
    }
  };

  const handleTambahKeKeranjang = () => {
    if (item.stok === 0) return;

    if (jumlah > item.stok) {
      setPesanError(`Jumlah tidak boleh melebihi stok (${item.stok}).`);
      return;
    }

    const savedCart = JSON.parse(localStorage.getItem("keranjang") || "[]");
    const existingIndex = savedCart.findIndex(
      (c: { id: number }) => Number(c.id) === item.id,
    );

    if (existingIndex > -1) {
      const totalBaru = savedCart[existingIndex].jumlah + jumlah;
      if (totalBaru > item.stok) {
        setPesanError(
          `Total di keranjang melebihi stok maksimal (${item.stok}).`,
        );
        return;
      }
      savedCart[existingIndex].jumlah = totalBaru;
    } else {
      savedCart.push({ id: item.id, jumlah });
    }

    localStorage.setItem("keranjang", JSON.stringify(savedCart));
    window.dispatchEvent(new Event("keranjang-berubah"));

    setPesanError("");
    setPesan(`${jumlah} porsi ${item.nama} berhasil ditambahkan ke keranjang!`);
    setTimeout(() => setPesan(""), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-0 space-y-6">
      <Link
        href="/menu"
        className="text-sm text-emerald-600 font-medium hover:underline inline-block"
      >
        &larr; Kembali ke Menu
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="space-y-3 border-b border-gray-100 pb-6">
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full">
            {item.kategori}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{item.nama}</h1>
          <p className="text-xl font-bold text-emerald-600">
            {rupiah(item.harga)}
          </p>

          {/* Deskripsi Menu */}
          <p className="text-sm text-gray-600 leading-relaxed pt-1">
            {(item as any).deskripsi ||
              "Menu lezat dan higienis yang disajikan langsung dari kantin sekolah."}
          </p>

          <p className="text-sm text-gray-600 pt-1">
            Stok Tersedia:{" "}
            <span className="font-semibold text-gray-900">
              {item.stok} porsi
            </span>
          </p>
        </div>

        {item.stok > 0 ? (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-sm font-semibold text-gray-700">
                Atur Jumlah Pesanan:
              </span>

              {/* Tombol Kontrol Jumlah yang Rapi */}
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50 shadow-inner w-fit">
                <button
                  type="button"
                  onClick={handleKurangJumlah}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-bold transition border-r border-gray-300"
                >
                  -
                </button>
                <span className="px-6 py-2 text-sm font-bold text-gray-900 min-w-[50px] text-center bg-white">
                  {jumlah}
                </span>
                <button
                  type="button"
                  onClick={handleTambahJumlah}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-bold transition border-l border-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pesan Error Stok */}
            {pesanError && (
              <p className="text-xs text-red-500 font-medium bg-red-50 p-2.5 rounded-lg border border-red-200">
                {pesanError}
              </p>
            )}

            {/* Notifikasi Berhasil */}
            {pesan && (
              <p className="text-xs text-emerald-600 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                {pesan}
              </p>
            )}

            <button
              type="button"
              onClick={handleTambahKeKeranjang}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm text-sm"
            >
              + Tambah ke Keranjang
            </button>
          </div>
        ) : (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm font-medium text-red-600 text-center">
              Maaf, stok menu ini sedang habis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
