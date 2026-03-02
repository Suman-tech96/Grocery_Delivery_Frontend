import { useEffect, useState } from "react";
import { api, apiForm, fileUrl } from "../lib/api";
import { categories } from "../assets/greencart/greencart_assets/assets";

export default function SellerDashboard() {
  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]?.path || "Vegetables");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api("/orders/all", { auth: true })
      .then((res) => setOrders(res.orders || []))
      .catch(() => setOrders([]));
    api("/products/mine", { auth: true })
      .then((res) => setMyProducts(res.products || []))
      .catch(() => setMyProducts([]));
  }, []);
  const revenue = orders.reduce((sum, o) => sum + (o.paymentStatus === "Paid" ? o.totalAmount : 0), 0);
  const pending = orders.filter((o) => o.orderStatus !== "Delivered").length;
  const [assignOrderId, setAssignOrderId] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [statusOrderId, setStatusOrderId] = useState("");
  const [statusValue, setStatusValue] = useState("Processing");
  async function addProduct(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("category", category);
      fd.append("price", String(price));
      if (offerPrice) fd.append("offerPrice", String(offerPrice));
      if (description) fd.append("description", description);
      if (stock) fd.append("stock", String(stock));
      imageFiles.forEach((f) => fd.append("images", f));
      await apiForm("/products", fd, { auth: true });
      setName(""); setCategory(categories[0]?.path || "Vegetables"); setPrice(""); setOfferPrice(""); setDescription(""); setStock(""); setImageFiles([]);
      const res = await api("/products/mine", { auth: true });
      setMyProducts(res.products || []);
      alert("Product added");
    } catch (e) {
      alert(e.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-800">Seller Dashboard</h1>
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-xl font-bold text-gray-800 mb-3">Add Product</div>
          <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input className="w-full border rounded-lg px-3 py-2 mt-1" value={name} onChange={(e)=>setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <select className="w-full border rounded-lg px-3 py-2 mt-1" value={category} onChange={(e)=>setCategory(e.target.value)}>
                {categories.map((c)=> <option key={c.path} value={c.path}>{c.path}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Price</label>
              <input className="w-full border rounded-lg px-3 py-2 mt-1" type="number" min="0" value={price} onChange={(e)=>setPrice(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">Offer Price (optional)</label>
              <input className="w-full border rounded-lg px-3 py-2 mt-1" type="number" min="0" value={offerPrice} onChange={(e)=>setOfferPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Stock Quantity</label>
              <input className="w-full border rounded-lg px-3 py-2 mt-1" type="number" min="0" value={stock} onChange={(e)=>setStock(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Description</label>
              <textarea className="w-full border rounded-lg px-3 py-2 mt-1" rows="3" value={description} onChange={(e)=>setDescription(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Images</label>
              <input className="w-full border rounded-lg px-3 py-2 mt-1" type="file" accept="image/*" multiple onChange={(e)=>setImageFiles(Array.from(e.target.files || []))} />
              {imageFiles.length ? (
                <div className="flex items-center gap-2 mt-2">
                  {imageFiles.slice(0,4).map((f,i)=>(
                    <div key={i} className="w-16 h-16 rounded border border-gray-200 overflow-hidden">
                      <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <button disabled={saving} className="bg-emerald-600 text-white font-semibold rounded-lg px-5 py-2">
                {saving ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Pending Orders</div>
            <div className="text-2xl font-bold text-gray-800">{pending}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Revenue (Paid)</div>
            <div className="text-2xl font-bold text-gray-800">₹{revenue}</div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-xl font-bold text-gray-800 mb-3"></div>
          <div className="space-y-3">
            {orders.slice(0, 10).map((o) => (
              <div key={o._id} className="flex items-center justify-between gap-3 text-sm">
                <div className="font-medium text-gray-800">#{o._id}</div>
                <div className="text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
                <div className="text-gray-800">₹{o.totalAmount}</div>
                <div className="text-gray-700">{o.orderStatus}</div>
                {o.orderStatus === "Delivered" && o.otpVerified ? <div className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">OTP verified</div> : null}
              </div>
            ))}
            {orders.length === 0 && <div className="text-gray-600 text-sm">No orders yet</div>}
          </div>
          <hr className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={(e)=>{e.preventDefault(); api(`/orders/${assignOrderId}/assign`, { method: "PUT", body: { deliveryEmail: assignEmail }, auth: true }).then(()=>{ alert("Assigned delivery"); setAssignOrderId(""); setAssignEmail(""); }).catch(()=> alert("Failed to assign")); }} className="space-y-2">
              <div className="text-sm font-semibold text-gray-800">Assign Delivery</div>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Order ID" value={assignOrderId} onChange={(e)=>setAssignOrderId(e.target.value)} required />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Delivery boy email" value={assignEmail} onChange={(e)=>setAssignEmail(e.target.value)} required />
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Assign</button>
            </form>
            <form onSubmit={(e)=>{e.preventDefault(); api(`/orders/${statusOrderId}/status`, { method: "PUT", body: { status: statusValue }, auth: true }).then(()=>{ alert("Status updated"); setStatusOrderId(""); }).catch(()=> alert("Failed to update status")); }} className="space-y-2">
              <div className="text-sm font-semibold text-gray-800">Update Order Status</div>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Order ID" value={statusOrderId} onChange={(e)=>setStatusOrderId(e.target.value)} required />
              <select className="w-full border rounded-lg px-3 py-2" value={statusValue} onChange={(e)=>setStatusValue(e.target.value)}>
                {["Processing","Packed","Shipped","OutForDelivery","Delivered","Cancelled"].map((s)=> <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm">Update</button>
            </form>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-xl font-bold text-gray-800 mb-3">My Products</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {myProducts.map((p)=>(
              <div key={p._id} className="rounded-lg border border-gray-200 p-3">
                <img src={fileUrl(p.images?.[0])} alt={p.name} className="w-full h-32 object-contain mb-2" />
                <div className="font-semibold text-gray-800">{p.name}</div>
                <div className="text-sm text-gray-600">{p.category}</div>
                <div className="text-emerald-600 font-bold">₹{p.offerPrice ?? p.price}</div>
                <div className="text-sm text-gray-700 mt-1">Stock: {p.stock ?? 0}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button className="px-3 py-1 rounded bg-red-600 text-white text-xs" onClick={async()=>{
                    try {
                      await api(`/products/${p._id}`,{method:"DELETE",auth:true});
                      setMyProducts((arr)=>arr.filter(x=>x._id!==p._id));
                      alert("Product deleted");
                    } catch(e){ alert(e.message || "Delete failed"); }
                  }}>Delete</button>
                  <form onSubmit={async(e)=>{e.preventDefault(); const nv = Number(prompt("Enter new stock", String(p.stock ?? 0)) || ""); if(isNaN(nv)||nv<0) return; try{ const r = await api(`/products/${p._id}/stock`,{method:"PUT",auth:true,body:{stock:nv}}); setMyProducts((arr)=>arr.map(x=> x._id===p._id ? {...x, stock:r.stock} : x)); alert("Stock updated"); }catch(err){ alert(err.message || "Stock update failed"); }}}>
                    <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs" type="submit">Update Stock</button>
                  </form>
                </div>
              </div>
            ))}
            {myProducts.length === 0 && <div className="text-gray-600 text-sm">No products added yet</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
