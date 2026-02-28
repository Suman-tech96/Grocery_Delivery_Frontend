import { assets } from "../assets/greencart/greencart_assets/assets";
import { useEffect, useState } from "react";
import { api, fileUrl } from "../lib/api";

function RelatedCard({ p, onAdd }) {
  const price = p.offerPrice ?? p.price;
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
      <a href={`#/product/${p._id}`} className="flex items-center justify-center h-36">
        <img src={fileUrl(p.images?.[0])} alt={p.name} className="max-h-32 object-contain" />
      </a>
      <div className="text-xs text-gray-500">{p.category}</div>
      <a href={`#/product/${p._id}`} className="font-semibold text-gray-800 line-clamp-1">
        {p.name}
      </a>
      <div className="flex items-baseline gap-2">
        <div className="text-emerald-600 font-bold">₹{price}</div>
        {p.offerPrice ? <div className="text-gray-400 line-through text-sm">₹{p.price}</div> : null}
      </div>
      <button
        onClick={() => onAdd(p)}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 text-emerald-700 px-4 py-2 hover:bg-emerald-50"
      >
        <img src={assets.cart_icon} alt="" className="w-4 h-4" />
        Add
      </button>
    </div>
  );
}

export default function Product({ id, onAdd }) {
  const [p, setP] = useState(null);
  const [list, setList] = useState([]);
  const [sel, setSel] = useState(0);
  useEffect(() => {
    api(`/products/${id}`).then((res) => setP(res.product || null)).catch(() => setP(null));
    api("/products").then((res) => setList(res.products || [])).catch(() => setList([]));
    setSel(0);
  }, [id]);
  if (!p) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="text-center text-gray-700">Product not found.</div>
        </div>
      </section>
    );
  }
  const price = p.offerPrice ?? p.price;
  const related = list.filter((x) => x.category === p.category && x._id !== p._id).slice(0, 5);
  function buyNow() {
    onAdd(p);
    window.location.hash = "#/cart";
  }
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="text-sm text-gray-500 mb-3">
            <a href="#/" className="text-gray-600">Home</a> / Products /{" "}
            <a href={`#/category/${encodeURIComponent(p.category)}`} className="text-gray-600">{p.category}</a> /{" "}
            <span className="text-emerald-600">{p.name}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5 flex md:flex-col gap-3">
              <div className="flex md:flex-col gap-3 md:order-1">
                {(p.images?.length ? p.images : (Array.isArray(p.image) ? p.image : [])).slice(0,4).map((im, i)=>(
                  <button key={i} className={`w-20 h-20 rounded-lg border ${sel===i?'border-emerald-400':'border-gray-200'} flex items-center justify-center`} onClick={()=>setSel(i)}>
                    <img src={fileUrl(im)} alt="" className="max-h-16 object-contain" />
                  </button>
                ))}
              </div>
              <div className="flex-1">
                <div className="rounded-xl border border-gray-200 p-6 shadow-sm bg-white flex items-center justify-center">
                  <img src={fileUrl((p.images?.length ? p.images : (Array.isArray(p.image) ? p.image : []))[sel] || (p.images?.[0] || ""))} alt={p.name} className="max-h-[28rem] object-contain w-full" />
                </div>
              </div>
            </div>
            <div className="md:col-span-7 rounded-xl border border-gray-200 p-6 shadow-sm bg-white">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">{p.name}</h1>
              <div className="flex items-center gap-1 mt-2">
                <img src={assets.star_icon} alt="" className="w-4 h-4" />
                <img src={assets.star_icon} alt="" className="w-4 h-4" />
                <img src={assets.star_icon} alt="" className="w-4 h-4" />
                <img src={assets.star_icon} alt="" className="w-4 h-4" />
                <img src={assets.star_dull_icon} alt="" className="w-4 h-4" />
                <span className="text-sm text-gray-500 ml-1">(4)</span>
              </div>
              <div className="mt-3">
                {p.offerPrice ? <div className="text-gray-400 line-through">MRP: ₹{p.price}</div> : null}
                <div className="text-lg text-gray-600">MRP: <span className="text-2xl font-bold text-emerald-700">₹{price}</span></div>
                <div className="text-xs text-gray-500">(inclusive of all taxes)</div>
              </div>
              {(Array.isArray(p.description) ? p.description.length : (typeof p.description === "string" ? p.description.trim().length : 0)) ? (
                <div className="mt-4">
                  <div className="font-semibold text-gray-800 mb-1">About Product</div>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {(Array.isArray(p.description)
                      ? p.description.slice(0, 5)
                      : [p.description]).map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              ) : null}
              <div className="mt-5 flex items-center gap-3">
                <button onClick={() => onAdd(p)} className="px-6 py-3 rounded-lg bg-gray-100 text-gray-800 font-semibold">Add to Cart</button>
                <button onClick={buyNow} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold">Buy now</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map((rp) => (
              <RelatedCard key={rp._id} p={rp} onAdd={onAdd} />
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <a href="#/all-products" className="px-6 py-2 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50">See more</a>
          </div>
        </div>
      </section>
    </>
  );
}
