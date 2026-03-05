import { useEffect, useState } from "react";
import { api, fileUrl } from "../lib/api";
import { assets, dummyProducts } from "../assets/greencart/greencart_assets/assets";

const steps = ["Processing", "Packed", "Shipped", "OutForDelivery", "Delivered"];

function OrderCard({ o, onCancelled }) {
  const isCancelled = o.orderStatus === "Cancelled";
  const currentIndex = isCancelled ? -1 : Math.max(0, steps.indexOf(o.orderStatus || "Processing"));
  const [prog, setProg] = useState(0);
  useEffect(() => {
    setProg(0);
    const t = setTimeout(() => {
      setProg((Math.max(0, currentIndex) / (steps.length - 1)) * 100);
    }, 50);
    return () => clearTimeout(t);
  }, [currentIndex]);
  return (
    <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-gray-800">Order #{o._id}</div>
          <div className="text-xs text-gray-600">Placed on {new Date(o.createdAt).toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-700">Total: <span className="font-semibold">₹{o.totalAmount}</span></div>
          <div className="text-xs text-gray-600">Payment: {o.paymentMethod} ({o.paymentStatus})</div>
        </div>
      </div>
      <div className="text-sm text-gray-600">Delivery Address: {o.address}</div>
      <div className="mt-2">
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>
          <div
            className={`absolute left-2 top-2 w-0.5 ${isCancelled ? "bg-red-600" : "bg-emerald-600"} transition-all duration-700`}
            style={{ height: isCancelled ? "100%" : `${prog}%` }}
          ></div>
          {steps.map((s,i)=>(
            <div key={s} className="flex items-center mb-2">
              <div className={`relative w-3 h-3 rounded-full mr-3 ${isCancelled ? "bg-red-600" : (i<=currentIndex ? "bg-emerald-600" : "bg-gray-300")}`}>
                {!isCancelled && i===currentIndex ? <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping"></span> : null}
              </div>
              <div className={`${isCancelled ? "text-red-700 font-medium" : (i<=currentIndex ? "text-emerald-700 font-medium" : "text-gray-500")}`}>{s}</div>
            </div>
          ))}
        </div>
        {isCancelled ? (
          <div className="mt-2 flex items-center">
            {/* <span className="px-2 py-1 rounded-full border border-red-300 text-xs text-red-700 bg-red-50">Cancelled</span> */}
          </div>
        ) : null}
      </div>
      <div className="text-sm">
        <span className={`px-2 py-1 rounded-full border text-xs ${
          o.orderStatus==='Delivered'
            ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
            : (o.orderStatus==='Cancelled'
              ? 'border-red-300 text-red-700 bg-red-50'
              : 'border-gray-300 text-gray-700 bg-gray-50')
        }`}>{o.orderStatus}</span>
        {o.orderStatus === "Delivered" && o.otpVerified ? (
          <span className="ml-2 text-xs inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            OTP verified
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {o.items.map((it) => (
          <div key={it.productId} className="rounded-lg border border-gray-200 p-3 text-sm flex items-center gap-3">
            <img
              src={(dummyProducts.find((x) => x._id === it.productId)?.image?.[0]) || assets.product_list_icon}
              alt={it.name}
              className="w-12 h-12 object-contain rounded-md border border-gray-200"
            />
            <div>
              <div className="font-medium text-gray-800">{it.name}</div>
              <div className="text-gray-600">Qty: {it.qty} • Price: ₹{it.price}</div>
            </div>
          </div>
        ))}
      </div>
      {o.deliveryNotes?.length ? (
        <div className="mt-2">
          <div className="text-sm font-semibold text-gray-800">Delivery Timeline</div>
          <div className="relative pl-4 mt-1">
            <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {o.deliveryNotes.map((n,i)=>(
              <div key={i} className="mb-2">
                <div className="text-xs text-gray-600">{new Date(n.at).toLocaleString()}</div>
                <div className="text-xs text-gray-800">{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {o.deliveryProofImages?.length ? (
        <div className="mt-2">
          <div className="text-sm font-semibold text-gray-800">Delivery Proof</div>
          <div className="flex items-center gap-2 mt-1">
            {o.deliveryProofImages.slice(0,3).map((img, i)=>(
              <img key={i} src={fileUrl(img)} alt="Proof" className="w-16 h-16 object-cover rounded border border-gray-200" />
            ))}
          </div>
        </div>
      ) : null}
      {(() => {
        const canCancel = o.orderStatus !== "Cancelled";
        async function cancelOrder() {
          try {
            const r = await api(`/orders/${o._id}/cancel`, { method: "PUT", auth: true });
            if (o.paymentMethod === "UPI" && o.paymentStatus === "Paid") {
              alert("Order cancelled. Amount will be credited within 30 minutes.");
            } else {
              alert("Order cancelled and items restocked.");
            }
            onCancelled && onCancelled();
          } catch (e) {
            const m = String(e?.message || "");
            if (m.toLowerCase().includes("refund_failed")) alert("Refund failed. Please contact support.");
            else if (m.toLowerCase().includes("not_cancellable")) alert("Order cannot be cancelled.");
            else alert(m || "Failed to cancel");
          }
        }
        return canCancel ? (
          <div className="pt-2">
            <button onClick={cancelOrder} className="px-3 py-2 rounded border border-red-300 text-red-700 bg-red-50">Cancel Order</button>
            <span className="ml-2 text-xs text-gray-600">Refund within 30 minutes for paid UPI</span>
          </div>
        ) : null;
      })()}
      {o.orderStatus === "Cancelled" ? (
        <div className="mt-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="8" x2="16" y2="16"></line>
            <line x1="16" y1="8" x2="8" y2="16"></line>
          </svg>
          <span className="ml-2 text-red-700 text-sm font-semibold">Order Cancelled</span>
        </div>
      ) : null}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/orders/my", { auth: true })
      .then((res) => setOrders(res.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">My Orders</h1>
        {loading ? (
          <div className="text-gray-600">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-600">
            No orders found.{" "}
            <a href="#/" className="text-emerald-600">Start shopping</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => <OrderCard key={o._id} o={o} onCancelled={()=>{
              api("/orders/my", { auth: true }).then((res)=>setOrders(res.orders||[])).catch(()=>{}); 
            }} />)}
          </div>
        )}
      </div>
    </section>
  );
}
