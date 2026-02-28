import { assets, dummyProducts } from "../assets/greencart/greencart_assets/assets";
import { useEffect, useState } from "react";
import { api, fileUrl } from "../lib/api";

function ProductCard({ p, onAdd }) {
  const price = p.offerPrice ?? p.price;
  const imgs = p.images?.length ? p.images : (Array.isArray(p.image) ? p.image : []);
  const [idx, setIdx] = useState(0);
  const src = imgs[idx] ? fileUrl(imgs[idx]) : "";
  return (
    <div className="group rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-200 flex flex-col gap-3">
      <a href={`#/product/${p._id}`} className="relative rounded-xl bg-white border border-gray-100 overflow-hidden">
        <div className="pt-[70%]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          {src ? <img src={src} alt={p.name} className="h-full w-full object-contain p-3 group-hover:scale-105 transition-transform" /> : <div className="text-sm text-gray-400">No image</div>}
        </div>
        <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{p.category}</div>
        {p.offerPrice ? <div className="absolute right-0 top-0 px-2 py-1 rounded-bl-lg bg-emerald-600 text-white text-xs">-{Math.max(0, Math.round(100 - (price / p.price) * 100))}%</div> : null}
      </a>
      {imgs.length > 1 ? (
        <div className="flex items-center gap-2 mt-1">
          {imgs.slice(0,3).map((im,i)=>(
            <button key={i} onMouseEnter={()=>setIdx(i)} className={`w-8 h-8 rounded border ${idx===i?'border-emerald-400':'border-gray-200'} overflow-hidden`}>
              <img src={fileUrl(im)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
      <a href={`#/product/${p._id}`} className="font-semibold text-gray-800 line-clamp-2">{p.name}</a>
      <div className="flex items-center gap-1 text-emerald-600">
        <img src={assets.star_icon} alt="" className="w-4 h-4" />
        <img src={assets.star_icon} alt="" className="w-4 h-4" />
        <img src={assets.star_icon} alt="" className="w-4 h-4" />
        <img src={assets.star_icon} alt="" className="w-4 h-4" />
        <img src={assets.star_dull_icon} alt="" className="w-4 h-4" />
        <span className="text-xs text-gray-500 ml-1">(4)</span>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-emerald-700 font-bold text-lg">₹{price}</div>
        {p.offerPrice ? <div className="text-gray-400 line-through text-sm">₹{p.price}</div> : null}
      </div>
      <button onClick={() => onAdd(p)} className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700">
        <img src={assets.cart_icon} alt="" className="w-4 h-4" />
        Add to Cart
      </button>
    </div>
  );
}

export default function ProductGrid({ onAdd, searchQuery = "" }) {
  const [list, setList] = useState(dummyProducts);
  const q = searchQuery.trim().toLowerCase();
  const products = q ? list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : list.slice(0, 10);
  useEffect(() => {
    api("/products").then((res) => {
      const arr = res.products || [];
      setList(arr.length ? arr : dummyProducts);
    }).catch(() => setList(dummyProducts));
  }, []);
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Best Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.map((p) => (
            <ProductCard key={p._id} p={p} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  );
}
