import { useEffect, useState } from "react";
import { api, apiForm, fileUrl } from "../lib/api";

export default function AdminRecipes() {
  const [name, setName] = useState("");
  const [serves, setServes] = useState(1);
  const [ingredients, setIngredients] = useState([{ qtyPerServe: 100, unit: "g", name: "" }]);
  const [image, setImage] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [edit, setEdit] = useState({ name: "", serves: 1, ingredients: [], image: null });

  async function load() {
    try {
      const r = await api("/recipes");
      setList(r.recipes || []);
    } catch {
      setList([]);
    }
  }
  useEffect(() => { load(); }, []);
  function setIng(i, patch) {
    setIngredients((list) => list.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }
  function addIng() {
    setIngredients(list => [...list, { qtyPerServe: 100, unit: "g", name: "" }]);
  }
  function removeIng(i) {
    setIngredients(list => list.filter((_, idx) => idx !== i));
  }
  async function submit(e) {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("serves", String(serves));
      fd.append("ingredients", JSON.stringify(ingredients.map(i => ({
        name: i.name, unit: i.unit, qtyPerServe: Number(i.qtyPerServe||0)
      }))));
      if (image) fd.append("image", image);
      const res = await apiForm("/recipes", fd, { auth: true });
      setOk("Recipe created");
      setName(""); setServes(1); setIngredients([{ qtyPerServe: 100, unit: "g", name: "" }]); setImage(null);
      await load();
    } catch (e) {
      setErr(e.message || "Failed");
    }
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Recipe Dashboard</h1>
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="text-sm text-gray-700 block mb-1">Recipe Name</label>
            <input className="w-full border rounded-lg px-4 py-2" value={name} onChange={(e)=>setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-gray-700 block mb-1">Serves</label>
            <input type="number" min="1" className="w-full border rounded-lg px-4 py-2" value={serves} onChange={(e)=>setServes(Number(e.target.value||1))} required />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800 mb-2">Ingredients</div>
            <div className="space-y-3">
              {ingredients.map((ing, i)=>(
                
                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <input className="border rounded-lg px-3 py-2" placeholder="Ingredient name" value={ing.name} onChange={(e)=>setIng(i,{name:e.target.value})} />
                  <input type="number" min="0" className="border rounded-lg px-3 py-2" placeholder="Qty per serve" value={ing.qtyPerServe} onChange={(e)=>setIng(i,{qtyPerServe:Number(e.target.value||0)})} />
                    <select className="border rounded-lg px-3 py-2" value={ing.unit} onChange={(e)=>setIng(i,{unit:e.target.value})}>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="pcs">pcs</option>
                  </select>
                  
                  <button type="button" onClick={()=>removeIng(i)} className="border rounded-lg px-3 py-2">Remove</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addIng} className="mt-2 border rounded-lg px-3 py-2">Add Ingredient</button>
          </div>
          <div>
            <label className="text-sm text-gray-700 block mb-1">Photo</label>
            <input type="file" accept="image/*" onChange={(e)=>setImage(e.target.files?.[0] || null)} />
          </div>
          <button className="bg-emerald-600 text-white font-semibold rounded-lg px-5 py-2">Create Recipe</button>
          {ok && <div className="text-emerald-700 text-sm">{ok}</div>}
          {err && <div className="text-red-600 text-sm">{err}</div>}
        </form>
        <hr className="my-8" />
        <div>
          <div className="text-xl font-bold text-gray-800 mb-3">Existing Recipes</div>
          <div className="space-y-3">
            {list.map((r)=>(
              <div key={r._id} className="rounded-xl border border-gray-200 p-4">
                {editingId === r._id ? (
                  <EditRecipe r={r} edit={edit} setEdit={setEdit} onCancel={()=>{ setEditingId(""); setEdit({ name:"",serves:1,ingredients:[],image:null }); }} onSave={async ()=>{
                    try{
                      const fd = new FormData();
                      fd.append("name", edit.name);
                      fd.append("serves", String(edit.serves));
                      fd.append("ingredients", JSON.stringify(edit.ingredients.map(i=>({ name:i.name, unit:i.unit, qtyPerServe:Number(i.qtyPerServe||0) }))));
                      if (edit.image) fd.append("image", edit.image);
                      await apiForm(`/recipes/${r._id}`, fd, { method:"PUT", auth:true });
                      setEditingId(""); setEdit({ name:"",serves:1,ingredients:[],image:null });
                      await load();
                    } catch(e){ alert(e.message || "Failed to update"); }
                  }} />
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <img src={fileUrl(r.imageUrl)} alt="" className="w-20 h-20 object-cover rounded border border-gray-200" />
                      <div>
                        <div className="font-semibold text-gray-800">{r.name}</div>
                        <div className="text-sm text-gray-600">Serves: {r.serves}</div>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <button className="px-3 py-2 border rounded" onClick={()=>{
                          setEditingId(r._id);
                          setEdit({ name:r.name, serves:r.serves, ingredients:r.ingredients, image:null });
                        }}>Edit</button>
                        <button className="px-3 py-2 border rounded text-red-700" onClick={async ()=>{
                          if (!confirm("Delete this recipe?")) return;
                          try{ await api(`/recipes/${r._id}`, { method:"DELETE", auth:true }); await load(); } catch(e){ alert(e.message || "Failed to delete"); }
                        }}>Delete</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {list.length === 0 && <div className="text-gray-600">No recipes found</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function EditRecipe({ r, edit, setEdit, onCancel, onSave }) {
  function setIng(i, patch) {
    setEdit(e => ({ ...e, ingredients: e.ingredients.map((x, idx) => idx === i ? { ...x, ...patch } : x) }));
  }
  function addIng() {
    setEdit(e => ({ ...e, ingredients: [...(e.ingredients||[]), { qtyPerServe: 100, unit: "g", name: "" }] }));
  }
  function removeIng(i) {
    setEdit(e => ({ ...e, ingredients: (e.ingredients||[]).filter((_, idx) => idx !== i) }));
  }
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSave(); }} className="space-y-3 w-full">
      <input className="border rounded-lg px-3 py-2 w-full" value={edit.name} onChange={(e)=>setEdit(s=>({...s,name:e.target.value}))} />
      <input type="number" min="1" className="border rounded-lg px-3 py-2 w-full" value={edit.serves} onChange={(e)=>setEdit(s=>({...s,serves:Number(e.target.value||1)}))} />
      <div className="space-y-2">
        {(edit.ingredients||[]).map((ing,i)=>(
          <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input type="number" min="0" className="border rounded-lg px-3 py-2" value={ing.qtyPerServe} onChange={(e)=>setIng(i,{qtyPerServe:Number(e.target.value||0)})} />
            <select className="border rounded-lg px-3 py-2" value={ing.unit} onChange={(e)=>setIng(i,{unit:e.target.value})}>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="pcs">pcs</option>
            </select>
            <input className="border rounded-lg px-3 py-2" value={ing.name} onChange={(e)=>setIng(i,{name:e.target.value})} />
            <button type="button" className="border rounded-lg px-3 py-2" onClick={()=>removeIng(i)}>Remove</button>
          </div>
        ))}
      </div>
      <button type="button" className="border rounded-lg px-3 py-2" onClick={addIng}>Add Ingredient</button>
      <input type="file" accept="image/*" onChange={(e)=>setEdit(s=>({...s,image:e.target.files?.[0] || null}))} />
      <div className="flex items-center gap-2">
        <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white">Save</button>
        <button type="button" className="px-4 py-2 rounded border" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
