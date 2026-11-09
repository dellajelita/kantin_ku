"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [totalItem, setTotalItem] = useState(0);

  useEffect(() => {
    setMounted(true);
    try {
      const cart = JSON.parse(localStorage.getItem("keranjang") || "[]");
      const total = cart.reduce(
        (acc: number, item: { jumlah: number }) => acc + item.jumlah,
        0,
      );
      setTotalItem(total);
    } catch {
      setTotalItem(0);
    }

    const handleKeranjangBerubah = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("keranjang") || "[]");
        const total = cart.reduce(
          (acc: number, item: { jumlah: number }) => acc + item.jumlah,
          0,
        );
        setTotalItem(total);
      } catch {
        setTotalItem(0);
      }
    };

    window.addEventListener("keranjang-berubah", handleKeranjangBerubah);
    return () => {
      window.removeEventListener("keranjang-berubah", handleKeranjangBerubah);
    };
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Favorit", href: "/favorit" },
    {
      name: `Keranjang${mounted && totalItem > 0 ? ` (${totalItem})` : ""}`,
      href: "/keranjang",
    },
    { name: "Riwayat", href: "/riwayat" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-xl font-bold text-emerald-600">KantinKu</h1>
        <nav className="flex flex-wrap justify-center gap-6 text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition ${
                  isActive
                    ? "text-emerald-600 font-bold border-b-2 border-emerald-600 pb-1"
                    : "text-gray-600 font-medium hover:text-emerald-600"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}