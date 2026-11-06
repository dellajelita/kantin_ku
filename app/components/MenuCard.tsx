import Link from "next/link";
import { Menu, rupiah } from "../data/menu";

type MenuCardProps = {
  item: Menu;
};

export default function MenuCard({ item }: MenuCardProps) {
  const isHabis = item.stok === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition duration-200">
      <div>
        <div className="flex justify-between items-center mb-3">
          {/* Badge Kategori */}
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 tracking-wide">
            {item.kategori}
          </span>
          {/* Badge Stok / Habis */}
          <span
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
              isHabis ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-600"
            }`}
          >
            {isHabis ? "Habis" : `Stok: ${item.stok}`}
          </span>
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-1 leading-snug">{item.nama}</h3>
        <p className="text-emerald-600 font-bold text-sm mb-4">{rupiah(item.harga)}</p>
      </div>

      <div>
        <Link
          href={`/menu/${item.id}`}
          className="inline-block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2.5 px-4 rounded-xl transition shadow-sm"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}