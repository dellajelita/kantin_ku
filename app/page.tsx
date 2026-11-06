import Link from "next/link";

export default function Home() {
  return (
    <div className="py-12 px-4 text-center max-w-2xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        Selamat Datang di <span className="text-emerald-600">KantinKu</span>!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Pesan makanan dan minuman favoritmu di kantin sekolah dengan cepat,
        mudah, tanpa harus mengantre lama.
      </p>
      <Link
        href="/menu"
        className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-emerald-700 transition"
      >
        Lihat Menu Kantin
      </Link>
    </div>
  );
}
