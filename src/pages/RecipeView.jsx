import { useEffect, useState } from "react";
import { api, fileUrl, getToken } from "../lib/api";

export default function RecipeView({ id }) {
  const [r, setR] = useState(null);
  const [serves, setServes] = useState(1);
  const [selected, setSelected] = useState({});
  const [products, setProducts] = useState([]);
  const [selectedCount, setSelectedCount] = useState(0);
  function normName(x) {
    const s = String(x || "").toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");
    return s.endsWith("s") && s.length > 3 ? s.slice(0, -1) : s;
  }
  useEffect(() => {
    Promise.all([api(`/recipes/${id}`), api("/products")]).then(([res, p]) => {
      setR(res.recipe);
      setProducts(p.products || []);
      const map = new Map((p.products || []).map(pr => [normName(pr.name), pr]));
      const sel = {};
      (res.recipe.ingredients || []).forEach(i => {
        const pid = i.productId || map.get(normName(i.name))?._id || (p.products || []).find(pr => {
          const pn = normName(pr.name), iname = normName(i.name);
          return pn.includes(iname) || iname.includes(pn);
        })?._id;
        if (pid) sel[pid] = { checked: false, qty: Math.max(1, Math.round(i.qtyPerServe)) };
      });
      setSelected(sel);
      setSelectedCount(0);
      setServes(res.recipe.serves || 1);
    }).catch(()=> { setR(null); setProducts([]); });
  }, [id]);
  function setCheck(pid, checked) {
    setSelected(s => {
      const ns = { ...s, [pid]: { ...(s[pid]||{}), checked } };
      const cnt = Object.values(ns).filter(v => v.checked).length;
      setSelectedCount(cnt);
      return ns;
    });
  }
  function setQty(pid, qty) {
    setSelected(s => ({ ...s, [pid]: { ...(s[pid]||{}), qty: Math.max(1, qty) } }));
  }
  async function addSelected() {
    if (!getToken()) { window.location.hash = "#/auth"; return; }
    try {
      const entries = Object.entries(selected).filter(([, st]) => !!st?.checked);
      if (entries.length === 0) { alert("Please select at least one ingredient"); return; }
      for (const [pid, st] of entries) {
        const qty = Math.max(1, Math.round((st.qty || 1) * serves));
        await api("/cart/add", { method: "POST", body: { productId: pid, qty }, auth: true });
      }
      alert("Selected ingredients added to cart");
      window.location.hash = "#/cart";
    } catch (e) {
      alert(e.message || "Failed to add to cart");
    }
  }
  if (!r) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10">Loading recipe...</div>
      </section>
    );
  }
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">{r.name}</h1>
        <img src={fileUrl(r.imageUrl)} alt="" className="w-full h-64 object-cover rounded-xl border border-gray-200 mb-4" />
        <div className="flex items-center gap-3 mb-4">
          <div className="text-sm text-gray-700">Serves</div>
          <input type="number" min="1" value={serves} onChange={(e)=>setServes(Number(e.target.value||1))} className="w-20 border rounded-lg px-3 py-2" />
        </div>
        <div className="text-sm font-semibold text-gray-800 mb-2">Ingredients</div>
        <div className="space-y-2">
          {r.ingredients.map((ing, idx)=>{
            const pid = ing.productId || products.find(pr => {
              const pn = normName(pr.name), iname = normName(ing.name);
              return pn === iname || pn.includes(iname) || iname.includes(pn);
            })?._id;
            const prod = products.find(pr => pr._id === pid);
            const available = !!prod && (prod.stock ?? 0) > 0;
            if (!available) {
              return (
                <div key={idx} className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>{ing.name}</span>
                    <span>({ing.qtyPerServe} {ing.unit} per serve)</span>
                  </div>
                  <span className="text-xs text-gray-500">Not available</span>
                </div>
              );
            }
            return (
              <div key={idx} className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 hover:bg-emerald-50 transition">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!selected[pid]?.checked} onChange={(e)=>setCheck(pid, e.target.checked)} />
                  <span className="text-gray-800">{ing.name}</span>
                  <span className="text-gray-600">({ing.qtyPerServe} {ing.unit} per serve)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded border" onClick={()=>setQty(pid, Math.max(1,(selected[pid]?.qty||1)-1))}>-</button>
                  <input type="number" min="1" value={selected[pid]?.qty || 1} onChange={(e)=>setQty(pid, Number(e.target.value||1))} className="w-16 border rounded-lg px-2 py-1" />
                  <button className="px-2 py-1 rounded border" onClick={()=>setQty(pid, (selected[pid]?.qty||1)+1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={addSelected} disabled={selectedCount===0} className={`mt-4 font-semibold rounded-lg px-5 py-2 ${selectedCount===0?'bg-gray-300 text-gray-600 cursor-not-allowed':'bg-emerald-600 text-white'}`}>Add Selected To Cart{selectedCount>0?` (${selectedCount})`:""}</button>
      </div>
    </section>
  );
}
