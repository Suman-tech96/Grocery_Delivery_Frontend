import { useEffect, useState } from "react";
import { api, apiForm, fileUrl } from "../lib/api";

function Card({ o, onPick, onDeliver, onNote, onProof }) {
  const [otp, setOtp] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  return (
    <div className="rounded-xl border border-gray-200 p-4 space-y-2">
      <div className="font-semibold text-gray-800">Order #{o._id}</div>
      <div className="text-sm text-gray-600">Address: {o.address}</div>
      <div className="text-sm text-gray-700">Status: {o.orderStatus}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        {o.items.map((it) => (
          <div key={it.productId} className="rounded-lg border border-gray-200 p-2 text-sm">
            <div className="font-medium text-gray-800">{it.name}</div>
            <div className="text-gray-600">Qty: {it.qty}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2 mt-2">
        <div className="flex items-center gap-2">
          <input className="border rounded px-2 py-1 text-sm" placeholder="Add a note" value={note} onChange={(e)=>setNote(e.target.value)} />
          <button onClick={()=> onNote(o, note, ()=> setNote(""))} className="px-3 py-1 rounded bg-gray-100 text-gray-800 text-sm">Add Note</button>
        </div>
        <div className="flex items-center gap-2">
          <input className="border rounded px-2 py-1 text-sm" placeholder="Delivery OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
          <button onClick={()=> onDeliver(o, otp)} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Confirm Delivery</button>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
          <button onClick={()=> file && onProof(o, file, ()=> setFile(null))} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Upload Proof</button>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        {o.orderStatus !== "OutForDelivery" && o.orderStatus !== "Delivered" && (
          <button onClick={() => onPick(o)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Acknowledge Pickup</button>
        )}
      </div>
      {o.deliveryNotes?.length ? (
        <div className="mt-2 text-xs text-gray-600">
          <div className="font-semibold text-gray-800">Notes</div>
          <ul className="list-disc list-inside">
            {o.deliveryNotes.map((n, i)=> <li key={i}>{new Date(n.at).toLocaleString()} • {n.message}</li>)}
          </ul>
        </div>
      ) : null}
      {o.deliveryProofImages?.length ? (
        <div className="mt-2 text-xs text-gray-600">
          <div className="font-semibold text-gray-800">Proof Images</div>
          <div className="flex items-center gap-2 mt-1">
            {o.deliveryProofImages.slice(0,3).map((img,i)=>(
              <img key={i} src={fileUrl(img)} alt="Proof" className="w-12 h-12 object-cover rounded border border-gray-200" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/orders/assigned", { auth: true })
      .then((res) => setOrders(res.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);
  async function handlePick(o) {
    try {
      await api(`/orders/${o._id}/ack/pick`, { method: "PUT", auth: true });
      const res = await api("/orders/assigned", { auth: true });
      setOrders(res.orders || []);
    } catch {
      alert("Failed to acknowledge pickup");
    }
  }
  async function handleDeliver(o, otp) {
    try {
      await api(`/orders/${o._id}/ack/deliver`, { method: "PUT", auth: true, body: { otp } });
      const res = await api("/orders/assigned", { auth: true });
      setOrders(res.orders || []);
    } catch (e) {
      alert(e.message || "Failed to mark delivered");
    }
  }
  async function handleNote(o, note, reset){
    try{
      await api(`/orders/${o._id}/note`, { method:"PUT", auth:true, body:{ message: note } });
      reset && reset();
      const res = await api("/orders/assigned", { auth: true });
      setOrders(res.orders || []);
    } catch(e){
      alert(e.message || "Failed to add note");
    }
  }
  async function handleProof(o, file, reset){
    try{
      const fd = new FormData();
      fd.append("image", file);
      await apiForm(`/orders/${o._id}/proof`, fd, { auth: true });
      reset && reset();
      const res = await api("/orders/assigned", { auth: true });
      setOrders(res.orders || []);
    } catch(e){
      alert(e.message || "Failed to upload proof");
    }
  }
  const pending = orders.filter((o) => o.orderStatus !== "Delivered").length;
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-800">Delivery Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Assigned Orders</div>
            <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Pending Deliveries</div>
            <div className="text-2xl font-bold text-gray-800">{pending}</div>
          </div>
        </div>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-600">No assigned orders</div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o._id} o={o} onPick={handlePick} onDeliver={handleDeliver} onNote={handleNote} onProof={handleProof} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
