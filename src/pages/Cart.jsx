import { useEffect, useState } from "react";
import { assets } from "../assets/greencart/greencart_assets/assets";
import { api, getToken, fileUrl } from "../lib/api";

export default function Cart({ cart = {}, onInc, onDec, onRemove, onClearCart }) {
  const [productMap, setProductMap] = useState({});
  useEffect(() => {
    api("/products").then((res) => {
      const map = {};
      (res.products || []).forEach((p) => { map[p._id] = p; });
      setProductMap(map);
    }).catch(() => setProductMap({}));
  }, []);
  const items = Object.entries(cart).map(([id, qty]) => {
    const p = productMap[id];
    return { p, qty };
  }).filter((x) => x.p);
  const subtotal = items.reduce((s, { p, qty }) => s + (p.offerPrice ?? p.price) * qty, 0);
  const tax = +(subtotal * 0.02).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const [method, setMethod] = useState("Cash On Delivery");
  const addr = (() => {
    try { return JSON.parse(localStorage.getItem("shippingAddress") || "null"); }
    catch { return null; }
  })();
  function formatAddress(a){
    if(!a) return "";
    return `${a.firstName || ""} ${a.lastName || ""}, ${a.street || ""}, ${a.city || ""}, ${a.state || ""} ${a.zipcode || ""}, ${a.country || ""}. Phone: ${a.phone || ""}`.trim();
  }
  async function handlePlaceOrder(){
    const t = getToken();
    if (!t) { window.location.hash = "#/auth"; return; }
    if (!addr) {
      alert("Please add delivery address before placing order");
      window.location.hash = "#/address";
      return;
    }
    if (total < 1) { alert("Total amount must be at least ₹1"); return; }
    const lineItems = items.map(({ p, qty }) => ({
      productId: p._id,
      name: p.name,
      price: (p.offerPrice ?? p.price),
      qty
    }));
    const payload = {
      items: lineItems,
      totalAmount: total,
      address: formatAddress(addr)
    };
    if (method === "Cash On Delivery") {
      try{
        await api("/orders/cod",{method:"POST", body: payload, auth:true});
        alert("Order placed successfully");
        onClearCart && onClearCart();
        window.location.hash = "#/orders";
      } catch {
        alert("Could not place order. Please try again.");
      }
      return;
    }
    if (method === "UPI") {
      try{
        const { order, key } = await api("/payments/razorpay/order",{method:"POST", body:{ amount: total }, auth:true});
        await loadRazorpayAndPay({ key, order, payload });
      } catch(e){
        const msg = String(e?.message || "");
        alert(msg.toLowerCase().includes("payment_unavailable") ? "Payment gateway not configured" : "Payment initialization failed. Please try again.");
      }
      return;
    }
    alert("Selected payment method is not supported yet");
  }
  function loadScript(src){
    return new Promise((resolve,reject)=>{
      if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("failed to load script"));
      document.body.appendChild(s);
    });
  }
  async function loadRazorpayAndPay({ key, order, payload }){
    await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    const options = {
      key,
      amount: order.amount,
      currency: order.currency,
      name: "GreenCart",
      description: "Order Payment",
      order_id: order.id,
      handler: async function (response){
        try{
          await api("/payments/razorpay/verify",{
            method:"POST",
            auth:true,
            body:{
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...payload
            }
          });
          alert("Payment successful and order placed");
          onClearCart && onClearCart();
          window.location.hash = "#/";
        } catch {
          alert("Payment verification failed. Please contact support.");
        }
      },
      prefill: {
        name: `${addr?.firstName || ""} ${addr?.lastName || ""}`.trim(),
        email: addr?.email || "",
        contact: addr?.phone || ""
      },
      notes: { address: payload.address },
      theme: { color: "#059669" },
      method: { upi: true, card: false, netbanking: false, wallet: false, emi: false }
    };
    const rz = new window.Razorpay(options);
    rz.on("payment.failed", function () {
      alert("Payment failed. Please try again.");
    });
    rz.open();
  }
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Shopping Cart <span className="text-emerald-600 text-lg font-semibold">{items.length} Items</span></h1>
          <div className="hidden md:grid grid-cols-12 text-gray-500 text-sm mb-2">
            <div className="col-span-6">Product Details</div>
            <div className="col-span-3">Subtotal</div>
            <div className="col-span-3">Action</div>
          </div>
          <div className="space-y-4">
            {items.map(({ p, qty }) => {
              const price = p.offerPrice ?? p.price;
              return (
                <div key={p._id} className="grid grid-cols-12 items-center rounded-xl border border-gray-200 p-4">
                  <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                    <img src={fileUrl(p.images?.[0])} alt={p.name} className="w-20 h-20 object-contain rounded-lg border border-gray-200" />
                    <div>
                      <div className="font-semibold text-gray-800">{p.name}</div>
                      <div className="text-sm text-gray-500">Weight: N/A</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        Qty:
                        <button onClick={() => onDec(p)} className="px-2 py-1 border rounded">-</button>
                        <span className="min-w-6 text-center">{qty}</span>
                        <button onClick={() => onInc(p)} className="px-2 py-1 border rounded">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-3 mt-3 md:mt-0 text-gray-800 font-semibold">₹{price * qty}</div>
                  <div className="col-span-6 md:col-span-3 mt-3 md:mt-0">
                    <button onClick={() => onRemove(p)} className="inline-flex items-center gap-2 text-red-600">
                      <img src={assets.remove_icon} alt="" className="w-5 h-5" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <a href="#/" className="inline-flex items-center gap-2 text-emerald-600 mt-4">← Continue Shopping</a>
        </div>
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
            <hr className="my-3" />
            <div className="text-sm text-gray-700 mb-2">
              <div className="font-semibold mb-1">DELIVERY ADDRESS</div>
              {addr ? (
                <div className="flex items-start justify-between gap-4">
                  <div className="text-gray-600">
                    <div className="font-medium text-gray-800">{addr.firstName} {addr.lastName}</div>
                    <div>{addr.email}</div>
                    <div>{addr.street}</div>
                    <div>{addr.city}, {addr.state} {addr.zipcode}</div>
                    <div>{addr.country}</div>
                    <div>{addr.phone}</div>
                  </div>
                  <a href="#/address" className="text-emerald-600 whitespace-nowrap">Change</a>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">No address found</span>
                  <a href="#/address" className="text-emerald-600">Add</a>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-700 mb-2">
              <div className="font-semibold mb-1">PAYMENT METHOD</div>
              <select className="w-full border rounded-lg px-3 py-2" value={method} onChange={(e)=>setMethod(e.target.value)}>
                <option value="Cash On Delivery">Cash On Delivery</option>
                <option value="UPI">UPI (Razorpay)</option>
              </select>
            </div>
            <hr className="my-3" />
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between"><span>Price</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span>Shipping Fee</span><span className="text-emerald-600">Free</span></div>
              <div className="flex justify-between"><span>Tax (2%)</span><span>₹{tax}</span></div>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-800 mt-3">
              <span>Total Amount:</span><span>₹{total}</span>
            </div>
            <button onClick={handlePlaceOrder} className="w-full mt-4 bg-emerald-600 text-white font-semibold rounded-lg py-3">Place Order</button>
          </div>
        </aside>
      </div>
    </section>
  );
}
