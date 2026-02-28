import { useEffect, useState } from "react";
import { assets } from "../assets/greencart/greencart_assets/assets";

export default function Address() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("shippingAddress") || "null");
      if (saved) setForm((f) => ({ ...f, ...saved }));
    } catch {}
  }, []);
  function save(e) {
    e.preventDefault();
    localStorage.setItem("shippingAddress", JSON.stringify(form));
    window.location.hash = "#/cart";
  }
  function upd(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Add Shipping <span className="text-emerald-600">Address</span></h1>
          <form onSubmit={save} className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded-lg px-4 py-2" placeholder="First Name" value={form.firstName} onChange={(e)=>upd("firstName",e.target.value)} required />
              <input className="border rounded-lg px-4 py-2" placeholder="Last Name" value={form.lastName} onChange={(e)=>upd("lastName",e.target.value)} required />
            </div>
            <input className="border rounded-lg px-4 py-2 w-full" placeholder="Email address" type="email" value={form.email} onChange={(e)=>upd("email",e.target.value)} required />
            <input className="border rounded-lg px-4 py-2 w-full" placeholder="Street" value={form.street} onChange={(e)=>upd("street",e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded-lg px-4 py-2" placeholder="City" value={form.city} onChange={(e)=>upd("city",e.target.value)} required />
              <input className="border rounded-lg px-4 py-2" placeholder="State" value={form.state} onChange={(e)=>upd("state",e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded-lg px-4 py-2" placeholder="Zip code" value={form.zipcode} onChange={(e)=>upd("zipcode",e.target.value)} required />
              <input className="border rounded-lg px-4 py-2" placeholder="Country" value={form.country} onChange={(e)=>upd("country",e.target.value)} required />
            </div>
            <input className="border rounded-lg px-4 py-2 w-full" placeholder="Phone" value={form.phone} onChange={(e)=>upd("phone",e.target.value)} required />
            <button className="w-full bg-emerald-600 text-white font-semibold rounded-lg py-3">Save Address</button>
          </form>
        </div>
        <div className="hidden md:block">
          <img src={assets.add_address_iamge} alt="" className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}

