"use client";

import { useState, useEffect } from "react";
import { menu, rupiah } from "../data/menu";
import Link from "next/link";

type CartItem = {
  id: number;
  jumlah: number;
};

export default function KeranjangPage() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [namaPemesan, setNamaPemesan] = useState("");
  const [caraAmbil, setCaraAmbil] = useState("ambil");
  const [kelas, setKelas] = useState("");
  const [kodeKupon, setKodeKupon] = useState("");
  const [diskon, setDiskon] = useState(0);
  const [pesanKupon, setPesanKupon] = useState("");
  const [pesanBerhasil, setPesanBerhasil] = useState("");
  const [pesanError, setPesanError] = useState("");

  useEffect(() => {
    setMounted(true);
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("keranjang") || "[]",
      ) as CartItem[];
      setCart(savedCart);
    } catch {
      setCart([]);
    }
  }, []);

  const updateKeranjang = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("keranjang", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("keranjang-berubah"));
  };

  const handleTambah = (id: number) => {
    const itemMenu = menu.find((m) => m.id === id);
    const updated = cart.map((c) => {
      if (c.id === id) {
        if (itemMenu && c.jumlah < itemMenu.stok) {
          return { ...c, jumlah: c.jumlah + 1 };
        }
      }
      return c;
    });
    updateKeranjang(updated);
  };

  const handleKurang = (id: number) => {
    const updated = cart
      .map((c) => (c.id === id ? { ...c, jumlah: c.jumlah - 1 } : c))
      .filter((c) => c.jumlah > 0);
    updateKeranjang(updated);
  };

  const handleHapusItem = (id: number) => {
    const updated = cart.filter((c) => c.id !== id);
    updateKeranjang(updated);
  };

  // Mencegah perbedaan render awal server & client secara mutlak
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-0 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
          <p className="text-gray-500 font-medium">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  const detailCart = cart
    .map((c) => {
      const itemMenu = menu.find((m) => m.id === c.id);
      return itemMenu ? { ...itemMenu, jumlah: c.jumlah } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = detailCart.reduce(
    (acc, item) => acc + item.harga * item.jumlah,
    0,
  );

  const ongkir = caraAmbil === "antar" ? 2000 : 0;
  const totalBayar = Math.max(0, subtotal - diskon + ongkir);

  const handleGunakanKupon = () => {
    const kuponValid = kodeKupon.trim().toUpperCase();
    if (
      kuponValid === "HEMAT10" ||
      kuponValid === "KANTINKU" ||
      kuponValid === "HEMAT5K"
    ) {
      const nilaiDiskon = kuponValid === "HEMAT10" ? 10000 : 5000;
      setDiskon(nilaiDiskon);
      setPesanKupon(
        `Kupon ${kuponValid} berhasil digunakan! Diskon ${rupiah(nilaiDiskon)} diterapkan.`,
      );
    } else {
      setDiskon(0);
      setPesanKupon("Kode kupon tidak valid. Coba: HEMAT10 atau KANTINKU");
    }
  };

  const handleCheckout = () => {
    if (detailCart.length === 0) return;

    if (!namaPemesan.trim()) {
      setPesanError("Mohon masukkan nama pemesan terlebih dahulu.");
      return;
    }
    setPesanError("");

    const transaksiBaru = {
      nama: `Pesanan oleh ${namaPemesan.trim()}`,
      items: detailCart.map((i) => ({
        nama: i.nama,
        jumlah: i.jumlah,
        total: i.harga * i.jumlah,
      })),
      subtotal,
      diskon,
      ongkir,
      caraAmbil,
      kelas: caraAmbil === "antar" ? kelas : null,
      totalBayar,
      waktu: new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    try {
      const riwayatLama = JSON.parse(
        localStorage.getItem("riwayat") || "[]",
      ) as Array<unknown>;
      const riwayatBaru = [transaksiBaru, ...riwayatLama];
      localStorage.setItem("riwayat", JSON.stringify(riwayatBaru));
    } catch {
      // ignore
    }

    updateKeranjang([]);
    setPesanBerhasil("Pesanan berhasil dibuat! Silakan cek menu Riwayat.");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-0 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>

      {pesanBerhasil && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium text-sm">
          {pesanBerhasil}
        </div>
      )}

      {detailCart.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
          <p className="text-gray-500 font-medium">
            Keranjang kamu masih kosong.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {detailCart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-between items-center gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900">{item.nama}</h3>
                  <p className="text-sm text-emerald-600 font-semibold">
                    {rupiah(item.harga)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      type="button"
                      onClick={() => handleKurang(item.id)}
                      className="px-3 py-1 bg-white hover:bg-gray-100 font-bold text-gray-700"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-bold text-gray-900">
                      {item.jumlah}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTambah(item.id)}
                      className="px-3 py-1 bg-white hover:bg-gray-100 font-bold text-gray-700"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleHapusItem(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 h-fit shadow-sm">
            <h2 className="font-bold text-gray-900 border-b pb-3">
              Ringkasan Pesanan
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Nama Pemesan:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi"
                  value={namaPemesan}
                  onChange={(e) => setNamaPemesan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Cara Pengambilan:
                </label>
                <select
                  value={caraAmbil}
                  onChange={(e) => setCaraAmbil(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ambil">Ambil di Kantin</option>
                  <option value="antar">Diantar ke Kelas (+Rp2.000)</option>
                </select>
              </div>

              {caraAmbil === "antar" && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Kelas:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: XII RPL 1"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}

              <div className="space-y-1 pt-2">
                <label className="block text-gray-700 font-medium mb-1">
                  Kode Kupon Voucher:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik: HEMAT10"
                    value={kodeKupon}
                    onChange={(e) => setKodeKupon(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleGunakanKupon}
                    className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-3 py-2 rounded-xl text-xs transition"
                  >
                    Pakai
                  </button>
                </div>
                {pesanKupon && (
                  <p
                    className={`text-xs mt-1 font-medium ${diskon > 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {pesanKupon}
                  </p>
                )}
              </div>

              <div className="border-t pt-3 space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {rupiah(subtotal)}
                  </span>
                </div>
                {diskon > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Diskon Kupon</span>
                    <span>-{rupiah(diskon)}</span>
                  </div>
                )}
                {ongkir > 0 && (
                  <div className="flex justify-between">
                    <span>Ongkir</span>
                    <span className="font-medium text-gray-900">
                      {rupiah(ongkir)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2">
                  <span>Total Bayar</span>
                  <span className="text-emerald-600">{rupiah(totalBayar)}</span>
                </div>
              </div>
            </div>

            {pesanError && (
              <p className="text-xs text-red-500 font-medium bg-red-50 p-2.5 rounded-lg border border-red-200">
                {pesanError}
              </p>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm"
            >
              Checkout Pesanan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
