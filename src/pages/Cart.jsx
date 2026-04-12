import { useEffect, useState } from "react";
import { assets } from "../assets/greencart/greencart_assets/assets";
import { api, getToken, fileUrl } from "../lib/api";
import { navigate } from "../lib/router";

export default function Cart({ cart = {}, onInc, onDec, onRemove, onClearCart }) {
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/products").then((res) => {
      const map = {};
      (res.products || []).forEach((p) => { map[p._id] = p; });
      setProductMap(map);
    }).catch(() => setProductMap({}))
    .finally(() => setLoading(false));
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
    if (!t) { navigate("/auth"); return; }
    if (!addr) {
      alert("Please add delivery address before placing order");
      navigate("/address");
      return;
    }
    if (total < 1) { alert("Total amount must be at least ₹1"); return; }
    const insufficient = items.find(({ p, qty }) => (p.stock ?? 0) < qty);
    if (insufficient) {
      alert(`Out of stock for "${insufficient.p.name}". Available: ${insufficient.p.stock ?? 0}. Please reduce quantity.`);
      return;
    }
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
        navigate("/orders");
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
        alert(e.message || "Payment initialization failed");
      }
      return;
    }
  }

  async function loadRazorpayAndPay({ key, order, payload }){
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => {
        const options = {
            key,
            amount: order.amount,
            currency: order.currency,
            name: "GreenCart",
            description: "Gourmet Grocery Payment",
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
                onClearCart && onClearCart();
                navigate("/orders");
              } catch { alert("Verification failed"); }
            },
            prefill: {
              name: `${addr?.firstName || ""} ${addr?.lastName || ""}`.trim(),
              email: addr?.email || "",
              contact: addr?.phone || ""
            },
            theme: { color: "#10b981" }
        };
        const rz = new window.Razorpay(options);
        rz.open();
    };
    document.body.appendChild(s);
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-200 uppercase tracking-[0.3em]">Mapping Essentials...</div>;

  return (
    <section className="bg-white py-4 md:py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Cart List */}
        <div className="flex-1 space-y-8 md:space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-emerald-600 pb-4">
            <div>
              <span className="text-emerald-600 font-extrabold tracking-[0.2em] text-[9px] uppercase bg-emerald-50 px-2 py-1 rounded-full italic">Your Selection</span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-2 tracking-tighter italic">Shopping Bag</h1>
            </div>
            <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest">{items.length} Master Items</p>
          </div>

          <div className="space-y-6">
            {items.map(({ p, qty }) => {
              const price = p.offerPrice ?? p.price;
              const available = p.stock ?? 0;
              return (
                <div key={p._id} className="group relative bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 hover:shadow-2xl hover:border-emerald-200 transition-all animate-fade-in group">
                  <div 
                    onClick={() => navigate(`/product/${p._id}`)}
                    className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-[2rem] p-4 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <img src={fileUrl(p.images?.[0])} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                        <div>
                        <div className="cursor-pointer" onClick={() => navigate(`/product/${p._id}`)}>
                            <h3 className="text-base font-black text-gray-900 mb-0.5 hover:text-emerald-600 transition-colors">{p.name}</h3>
                        </div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Category: {p.category}</div>
                        </div>
                        <div className="flex items-center justify-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                            <button onClick={() => onDec(p)} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-gray-800 hover:text-emerald-600">-</button>
                            <span className="w-8 text-center font-black text-xs text-gray-900 tabular-nums">{qty}</span>
                            <button onClick={() => { if (qty < available) onInc(p); else alert("Inventory Limit Reached"); }} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-gray-800 hover:text-emerald-600">+</button>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center md:justify-start gap-6">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Unit Price</p>
                            <p className="text-sm font-black text-gray-800">₹{price}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Subtotal</p>
                            <p className="text-sm font-black text-emerald-600">₹{price * qty}</p>
                        </div>
                    </div>
                  </div>

                  <button onClick={() => onRemove(p)} className="absolute top-6 right-6 md:static p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              );
            })}
            
            {items.length === 0 && (
              <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 italic">
                <p className="text-gray-400 font-black uppercase tracking-widest mb-4">Your bag is weightless</p>
                <a href="#/all-products" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100">Explore Collection</a>
              </div>
            )}
          </div>
          
          <a href="/" className="inline-flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors py-2 group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            Back to Boutique
          </a>
        </div>

        {/* Sidebar Summary */}
        <aside className="w-full lg:w-[400px] lg:shrink-0">
          <div className="bg-white rounded-[1.5rem] p-6 md:p-8 text-gray-900 shadow-xl border border-emerald-100 sticky top-24">
            <h2 className="text-xl font-black mb-4 italic tracking-tighter">Order Summary</h2>
            
            <div className="space-y-3 mb-6 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Base Amount</span>
                    <span className="text-sm font-black tabular-nums">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Conveyance Fee</span>
                    <span className="text-xs font-black text-emerald-600 italic uppercase">Gratis</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Surcharge (2%)</span>
                    <span className="text-sm font-black tabular-nums">₹{tax}</span>
                </div>
            </div>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Total Valuation</span>
                    <p className="text-2xl font-black tracking-tighter tabular-nums text-gray-900 leading-none mt-1">₹{total}</p>
                </div>
                <div className="text-[7px] font-black text-gray-300 uppercase tracking-tighter text-right">VAT INCLUDED • ALL TAX IN</div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="group">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Shipping Destination</label>
                        <a href="/address" className="text-[8px] font-black text-emerald-500 uppercase tracking-widest border-b border-emerald-500/30">Edit</a>
                    </div>
                    {addr ? (
                        <p className="text-[10px] font-medium text-gray-500 leading-relaxed truncate">
                            {addr.street}, {addr.city}, {addr.state}
                        </p>
                    ) : (
                        <p className="text-[8px] font-bold text-red-400 uppercase tracking-tighter italic">Pending Details</p>
                    )}
                </div>

                <div>
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Gateway Method</label>
                    <div className="grid grid-cols-2 gap-2">
                        {["Cash On Delivery", "UPI"].map((m) => (
                            <button 
                                key={m}
                                onClick={() => setMethod(m)}
                                className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                    method === m ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                            >{m === "UPI" ? "Digital" : "Cash (COD)"}</button>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={handlePlaceOrder}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-gray-900 transition-all hover:scale-[1.02] active:scale-95 shadow-emerald-50"
            >
                Confirm Order
            </button>
            <p className="text-[7px] text-center text-gray-300 uppercase font-black tracking-widest mt-4">Secure Encrypted Checkout</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
