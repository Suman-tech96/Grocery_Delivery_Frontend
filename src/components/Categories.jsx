import { categories } from "../assets/greencart/greencart_assets/assets";

export default function Categories() {
  return (
    <section className="bg-white py-12 md:py-20 w-full max-w-full overflow-hidden">
      <div className="mx-auto max-w-7xl w-full px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <span className="text-emerald-600 font-extrabold tracking-[0.2em] text-[9px] uppercase bg-emerald-50 px-3 py-1.5 rounded-full italic">Explore by Kind</span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-3 tracking-tighter">Essential Categories</h2>
          </div>
          <p className="text-gray-400 font-bold text-[9px] uppercase tracking-widest md:max-w-xs md:text-right">
            Handpicked selections from local farms to your kitchen.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
          {categories.map((c, idx) => (
            <a
              key={c.text}
              href={`/category/${encodeURIComponent(c.path)}`}
              className="group relative flex flex-col items-center bg-gray-50 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 transition-all duration-500 hover:bg-emerald-600 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-200 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="relative w-full aspect-square bg-white rounded-[2rem] p-4 mb-4 flex items-center justify-center shadow-inner group-hover:scale-95 transition-transform duration-500 overflow-hidden">
                <img 
                    src={c.image} 
                    alt={c.text} 
                    className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Sector</div>
                <div className="text-sm font-black text-gray-800 tracking-tight group-hover:text-white transition-colors">{c.text}</div>
              </div>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
