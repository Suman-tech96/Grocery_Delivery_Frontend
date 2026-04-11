import { useEffect, useRef, useState } from "react";
import { assets, dummyProducts } from "../assets/greencart/greencart_assets/assets";
import { fileUrl } from "../lib/api";
import { navigate } from "../lib/router";

export default function Header({ cartCount = 0, searchQuery = "", setSearch, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const suggestions = q
    ? dummyProducts.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    : [];

  return (
    <header className={`sticky top-0 z-[100] transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-lg py-2" : "bg-white py-4"}`}>
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between" ref={wrapRef}>
        <div className="flex items-center gap-10">
          <a href="/" className="shrink-0">
            <img src={assets.logo} alt="GreenCart" className="h-6 md:h-7 hover:scale-105 transition-transform" />
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {[
              { name: "Home", path: "/" },
              { name: "All Products", path: "/all-products" },
              { name: "Orders", path: "/orders" },
              { name: "Recipes", path: "/recipes" },
              ...(user?.role === "seller" || user?.role === "admin"
                ? [
                    { name: "Seller Hub", path: "/seller" },
                    { name: "Manage Recipes", path: "/recipes-admin" },
                  ]
                : []),
              ...(user?.role === "delivery"
                ? [{ name: "Delivery Hub", path: "/delivery" }]
                : []),
            ].map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-emerald-600 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-2 min-w-[240px] relative border border-transparent focus-within:border-emerald-200 focus-within:bg-white transition-all">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              placeholder="Track down fresh deals..."
              className="w-full outline-none bg-transparent text-[11px] font-bold placeholder-gray-300"
              value={searchQuery}
              onChange={(e) => { setSearch?.(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {q && showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-4 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 p-4 max-h-80 overflow-auto animate-fade-in">
                {suggestions.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No match found</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {suggestions.map((p) => (
                      <a
                        key={p._id}
                        href={`/product/${p._id}`}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-50 transition-colors group"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden p-1">
                          <img src={p.image?.[0]} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">{p.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {user ? <Dropdown user={user} onLogout={onLogout} /> : (
              <a href="/auth" className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-100 uppercase italic">
                Get Started
              </a>
            )}

            <a href="/cart" className="group relative flex items-center justify-center p-3 rounded-2xl bg-gray-900 text-white hover:bg-emerald-600 hover:scale-110 active:scale-90 transition-all shadow-xl shadow-gray-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-xl bg-emerald-500 text-white text-[10px] font-black border-2 border-white animate-bounce-in">{cartCount}</span>
              )}
            </a>

            <button
              className="lg:hidden p-3 rounded-2xl bg-gray-50 text-gray-900"
              onClick={() => setOpen(!open)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="fixed inset-0 z-[150] lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
          <nav className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between mb-8">
              <img src={assets.logo} alt="" className="h-6" />
              <button onClick={() => setOpen(false)} className="p-2 bg-gray-50 rounded-xl">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {[
              { name: "Home", path: "/" },
              { name: "All Products", path: "/all-products" },
              { name: "Orders", path: "/orders" },
              { name: "Recipes", path: "/recipes" },
              ...(user?.role === "seller" || user?.role === "admin"
                ? [
                    { name: "Seller Hub", path: "/seller" },
                    { name: "Manage Recipes", path: "/recipes-admin" },
                  ]
                : []),
              ...(user?.role === "delivery"
                ? [{ name: "Delivery Hub", path: "/delivery" }]
                : []),
            ].map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="text-2xl font-black text-gray-900 hover:text-emerald-600 transition-colors"
                onClick={() => setOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <hr className="my-4 border-gray-50" />
            {!(user?.role === "seller" || user?.role === "admin" || user?.role === "delivery") ? (
              <a href="/auth" className="text-lg font-bold text-emerald-600" onClick={() => setOpen(false)}>Become a Partner</a>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}

function Dropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-3 p-1.5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-all"
        onClick={() => setOpen(!open)}
      >
        <img
          src={user.avatarUrl ? fileUrl(user.avatarUrl) : assets.profile_icon}
          alt=""
          className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover bg-white"
          onError={(e) => { e.currentTarget.src = assets.profile_icon; }}
        />
        <div className="hidden sm:block text-left mr-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">Healthy Chef</p>
          <p className="text-xs font-black text-gray-800 tracking-tight">{user.name || "Explorer"}</p>
        </div>
      </button>
      {open && (
        <div className="absolute right-0 mt-4 w-48 rounded-[2rem] bg-white shadow-2xl border border-gray-50 p-2 animate-bounce-in overflow-hidden z-[200]">
          <a href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors" onClick={() => setOpen(false)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Account
          </a>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
