import { categories } from "../assets/greencart/greencart_assets/assets";

export default function Categories() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((c) => (
            <a
              key={c.text}
              href={`#/category/${encodeURIComponent(c.path)}`}
              className="rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: c.bgColor }}
            >
              <div className="flex flex-col items-center p-4 gap-3">
                <img src={c.image} alt={c.text} className="h-20 object-contain" />
                <div className="text-sm font-medium text-gray-700">{c.text}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
