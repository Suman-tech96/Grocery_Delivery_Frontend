import { useEffect, useState } from "react";
import { api, fileUrl } from "../lib/api";

export default function Recipes() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api("/recipes").then(res => setItems(res.recipes || [])).catch(()=>setItems([]));
  }, []);
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Recipes</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(r=>(
            <a key={r._id} href={`#/recipe/${r._id}`} className="rounded-xl border border-gray-200 p-4 hover:shadow">
              <img src={fileUrl(r.imageUrl)} alt="" className="w-full h-40 object-cover rounded-lg border border-gray-200 mb-2" />
              <div className="font-semibold text-gray-800">{r.name}</div>
              <div className="text-sm text-gray-600">Serves: {r.serves}</div>
            </a>
          ))}
          {items.length === 0 && <div className="text-gray-600">No recipes yet</div>}
        </div>
      </div>
    </section>
  );
}
