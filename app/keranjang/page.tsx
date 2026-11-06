"use client";

import { useState, useEffect } from "react";
import { menu, rupiah } from "../data/menu";
import Link from "next/link";

type CartItem = {
  id: number;
  jumlah: number;
};

export default function KeranjangPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form Promo, Ambil, dan Pemesan
  const [inputPromo, setInputPromo] = useState("");
  const [promoAktif, setPromoAktif] = useState(false);
  const [pesanPromo, setPesanPromo] = useState("");

  const [caraAmbil, setCaraAmbil] = useState<"ambil" | "antar">("ambil");
  const [kelas, setKelas] = useState("");
  const [namaPemesan, setNamaPemesan] = useState("");

  const [pesanErrorForm, setPesanErrorForm] = useState("");
  const [struk, setStruk] = useState<any | null>(null);

  // State untuk menampung pesan error stok per item
  const [pesanStok, setPesanStok] = useState<{ [key: number]: string }>({});

  // Ambil data keranjang dari localStorage saat dimuat
  useEffect(() => {
    setMounted(true);
    const savedCart = JSON.parse(localStorage.getItem("keranjang") || "[]");
    setCart(savedCart);
  }, []);

  // Update localStorage dan event listener tiap kali cart berubah
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("keranjang", JSON.stringify(newCart));
    window.dispatchEvent(new Event("keranjang-berubah"));
  };

  if (!mounted) return null;

  // Gabungkan data cart dengan detail menu dari data/menu.ts
  const cartDetailed = cart
    .map((c) => {
      const detail = menu.find((m) => Number(m.id) === Number(c.id));
      return detail ? { ...detail, jumlah: c.jumlah } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Hitung Subtotal
  const subtotal = cartDetailed.reduce(
    (acc, item) => acc + item.harga * item.jumlah,
    0,
  );

  // Cek apakah diskon promo berlaku (syarat: minimal Rp 20.000)
  const diskonBerlaku = promoAktif && subtotal >= 20000;
  const nilaiDiskon = diskonBerlaku ? Math.round(subtotal * 0.1) : 0;
  const ongkir = caraAmbil === "antar" ? 2000 : 0;
  const totalBayar = Math.max(0, subtotal - nilaiDiskon + ongkir);

  // Ubah Jumlah Item (- / +) dengan validasi pesan stok
  const updateJumlah = (id: number, delta: number) => {
    const detailMenu = menu.find((m) => Number(m.id) === Number(id));
    const maxStok = detailMenu ? Number(detailMenu.stok) : 99;

    const target = cart.find((item) => Number(item.id) === Number(id));
    if (!target) return;

    if (delta > 0 && target.jumlah >= maxStok) {
      setPesanStok((prev) => ({
        ...prev,
        [id]: `Jumlah tidak boleh melebihi stok (${maxStok}).`,
      }));
      return;
    }

    const newQty = target.jumlah + delta;
    if (newQty < 1) return;

    setPesanStok((prev) => ({ ...prev, [id]: "" }));

    const newCart = cart.map((item) =>
      Number(item.id) === Number(id) ? { ...item, jumlah: newQty } : item,
    );
    saveCart(newCart);
  };

  // Hapus Item dari Keranjang
  const handleHapus = (id: number) => {
    const newCart = cart.filter((item) => Number(item.id) !== Number(id));
    setPesanStok((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    saveCart(newCart);
  };

  // Terapkan Kode Promo
  const handleGunakanPromo = () => {
    const kode = inputPromo.trim().toUpperCase();
    if (kode !== "HEMAT10") {
      setPesanPromo("Kode promo tidak dikenal.");
      setPromoAktif(false);
      return;
    }

    if (subtotal < 20000) {
      setPesanPromo("Promo HEMAT10 butuh belanja minimal Rp 20.000.");
      setPromoAktif(false);
      return;
    }

    setPromoAktif(true);
    setPesanPromo("Promo HEMAT10 dipakai: diskon 10%.");
  };

  // Proses Pesan Sekarang / Checkout
  const handlePesanSekarang = (e: React.FormEvent) => {
    e.preventDefault();
    setPesanErrorForm("");

    if (namaPemesan.trim().length < 3) {
      setPesanErrorForm("Nama pemesan minimal 3 karakter.");
      return;
    }

    if (caraAmbil === "antar" && kelas.trim().length < 3) {
      setPesanErrorForm("Kelas wajib diisi minimal 3 karakter bila diantar.");
      return;
    }

    // Buat Struk Pembayaran
    const dataStruk = {
      nama: namaPemesan.trim(),
      items: cartDetailed.map((i) => ({
        nama: i.nama,
        jumlah: i.jumlah,
        total: i.harga * i.jumlah,
      })),
      subtotal,
      diskon: nilaiDiskon,
      ongkir,
      caraAmbil,
      kelas: caraAmbil === "antar" ? kelas.trim() : null,
      totalBayar,
      waktu: new Date().toLocaleString("id-ID"),
    };

    setStruk(dataStruk);

    // Simpan ke Riwayat
    const existingRiwayat = JSON.parse(localStorage.getItem("riwayat") || "[]");
    existingRiwayat.push(dataStruk);
    localStorage.setItem("riwayat", JSON.stringify(existingRiwayat));

    // Reset Keranjang & Form
    saveCart([]);
    setPromoAktif(false);
    setInputPromo("");
    setNamaPemesan("");
    setKelas("");
    setPesanStok({});
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>

      {/* Jika Struk Berhasil Dibuat */}
      {struk && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-emerald-800">
            Terima kasih, {struk.nama}!
          </h2>
          <div className="text-sm text-gray-700 space-y-2 border-t border-emerald-200 pt-3">
            {struk.items.map((it: any, idx: number) => (
              <p key={idx}>
                {it.nama} x{it.jumlah} = {rupiah(it.total)}
              </p>
            ))}
            <div className="border-t border-emerald-200 pt-2 font-medium">
              <p>Subtotal: {rupiah(struk.subtotal)}</p>
              {struk.diskon > 0 && (
                <p className="text-emerald-700">
                  Diskon: -{rupiah(struk.diskon)}
                </p>
              )}
              <p>
                {struk.caraAmbil === "antar"
                  ? `Ongkir antar ke ${struk.kelas}: ${rupiah(struk.ongkir)}`
                  : "Diambil sendiri di kantin"}
              </p>
              <p className="text-base font-bold text-emerald-900 pt-1">
                Total bayar: {rupiah(struk.totalBayar)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStruk(null)}
            className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            Tutup Struk
          </button>
        </div>
      )}

      {/* Keranjang Kosong */}
      {cartDetailed.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-4">
          <p className="text-gray-500 font-medium">Keranjang masih kosong.</p>
          <Link
            href="/menu"
            className="inline-block bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            Lihat Katalog Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Daftar Items (Kiri) */}
          <div className="lg:col-span-2 space-y-4">
            {cartDetailed.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-gray-900">{item.nama}</h3>
                  <p className="text-sm text-emerald-600 font-semibold">
                    {rupiah(item.harga)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateJumlah(item.id, -1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold">
                        {item.jumlah}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateJumlah(item.id, 1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Teks Peringatan Stok Melebihi Batas (Render Paksa Berdasarkan Kondisi) */}
                    {(pesanStok[item.id] || item.jumlah >= item.stok) && (
                      <span className="text-[11px] text-red-500 font-medium">
                        {pesanStok[item.id] ||
                          `Jumlah tidak boleh melebihi stok (${item.stok}).`}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-gray-800 w-24 text-right">
                    {rupiah(item.harga * item.jumlah)}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleHapus(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Rincian Pembayaran & Form Checkout (Kanan) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-6 h-fit">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">
              Ringkasan Belanja
            </h2>

            {/* Form Kode Promo */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600">
                Kode Promo
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Contoh: HEMAT10"
                  value={inputPromo}
                  onChange={(e) => setInputPromo(e.target.value)}
                  className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleGunakanPromo}
                  className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition whitespace-nowrap"
                >
                  Pakai
                </button>
              </div>
              {pesanPromo && (
                <p
                  className={`text-xs ${
                    diskonBerlaku
                      ? "text-emerald-600 font-medium"
                      : "text-red-500"
                  }`}
                >
                  {pesanPromo}
                </p>
              )}
            </div>

            {/* Form Opsi Pengambilan */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-xs font-semibold text-gray-600">
                Cara Pengambilan
              </label>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="caraAmbil"
                    checked={caraAmbil === "ambil"}
                    onChange={() => setCaraAmbil("ambil")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Ambil sendiri</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="caraAmbil"
                    checked={caraAmbil === "antar"}
                    onChange={() => setCaraAmbil("antar")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Diantar (+Rp 2.000)</span>
                </label>
              </div>
            </div>

            {/* Input Kelas (Jika Diantar) */}
            {caraAmbil === "antar" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">
                  Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: XI RPL 2"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Input Nama Pemesan */}
            <div className="space-y-1 border-t pt-4">
              <label className="text-xs font-semibold text-gray-600">
                Nama Pemesan
              </label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={namaPemesan}
                onChange={(e) => setNamaPemesan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Total Rincian */}
            <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {rupiah(subtotal)}
                </span>
              </div>
              {diskonBerlaku && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon (10%)</span>
                  <span className="font-semibold">-{rupiah(nilaiDiskon)}</span>
                </div>
              )}
              {caraAmbil === "antar" && (
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span className="font-semibold text-gray-900">
                    {rupiah(ongkir)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2">
                <span>Total</span>
                <span className="text-emerald-600">{rupiah(totalBayar)}</span>
              </div>
            </div>

            {pesanErrorForm && (
              <p className="text-xs text-red-500 font-medium">
                {pesanErrorForm}
              </p>
            )}

            {/* Tombol Pesan Sekarang */}
            <button
              type="button"
              onClick={handlePesanSekarang}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm"
            >
              Pesan Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
