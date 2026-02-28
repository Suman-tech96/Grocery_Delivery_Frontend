import { assets } from "../assets/greencart/greencart_assets/assets";
import { useEffect, useState } from "react";

import { api, setToken } from "../lib/api";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "register") {
        const res = await api("/auth/register", { method: "POST", body: { email, password, name, role, phone, storeName: role==="seller"?storeName:"" } });
        setToken(res.token);
      } else {
        const res = await api("/auth/login", { method: "POST", body: { email, password } });
        setToken(res.token);
      }
      try {
        const me = await api("/auth/me", { auth: true });
        window.location.hash = (me.role === "seller" || me.role === "admin") ? "#/seller" : (me.role === "delivery" ? "#/delivery" : "#/");
      } catch {
        window.location.hash = "#/";
      }
    } catch (e) {
      const msg = String(e.message || "").toLowerCase().includes("invalid")
        ? "Invalid email or password"
        : e.message;
      setErr(msg);
    }
  }
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="hidden md:block">
          <img src={assets.bottom_banner_image} alt="" className="w-full h-auto rounded-xl" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setMode("login")} className={`px-4 py-2 rounded-lg border ${mode==="login"?"bg-emerald-600 text-white border-emerald-600":"border-gray-200"}`}>Login</button>
            <button onClick={() => setMode("register")} className={`px-4 py-2 rounded-lg border ${mode==="register"?"bg-emerald-600 text-white border-emerald-600":"border-gray-200"}`}>Register</button>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{mode==="login"?"Welcome Back":"Create Your Account"}</h1>
          <p className="text-gray-500 mb-4">{mode==="login"?"Sign in to continue":"Sign up to start shopping fresh groceries"}</p>
          <form onSubmit={submit} className="space-y-3">
            {mode==="register" && (
              <>
                <input className="w-full border rounded-lg px-4 py-2" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} required />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="radio" name="role" value="user" checked={role==="user"} onChange={(e)=>setRole(e.target.value)} />
                    User
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="radio" name="role" value="seller" checked={role==="seller"} onChange={(e)=>setRole(e.target.value)} />
                    Seller
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="radio" name="role" value="delivery" checked={role==="delivery"} onChange={(e)=>setRole(e.target.value)} />
                    Delivery Boy
                  </label>
                </div>
                {role==="user" && (
                  <input className="w-full border rounded-lg px-4 py-2" placeholder="Phone number" value={phone} onChange={(e)=>setPhone(e.target.value)} />
                )}
                {role==="seller" && (
                  <>
                    <input className="w-full border rounded-lg px-4 py-2" placeholder="Store name" value={storeName} onChange={(e)=>setStoreName(e.target.value)} required />
                    <input className="w-full border rounded-lg px-4 py-2" placeholder="Contact phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
                  </>
                )}
              </>
            )}
            <input className="w-full border rounded-lg px-4 py-2" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <input className="w-full border rounded-lg px-4 py-2" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            <button className="w-full bg-emerald-600 text-white font-semibold rounded-lg py-3">
              {mode==="login"?"Login":"Create account"}
            </button>
          </form>
          {err && <div className="text-sm text-red-600 mt-2">{err}</div>}
          <div className="text-sm text-gray-600 mt-3">
            {mode==="login" ? (
              <>
                <button onClick={() => (window.location.hash = "#/forgot")} className="text-emerald-600 mr-3">Forgot password?</button>
                Don’t have an account? <button onClick={() => setMode("register")} className="text-emerald-600">Register</button>
              </>
            ) : (
              <>Already have an account? <button onClick={() => setMode("login")} className="text-emerald-600">Login</button></>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
