import { useEffect, useRef, useState } from "react";
import { assets, dummyProducts } from "../assets/greencart/greencart_assets/assets";
import { fileUrl } from "../lib/api";

export default function Header({ cartCount = 0, searchQuery = "", setSearch, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  const q = searchQuery.trim().toLowerCase();
  const suggestions = q
    ? dummyProducts.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    : [];
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 flex items-center gap-6 py-3 relative" ref={wrapRef}>
        <a href="#/" className="shrink-0">
          <img src={assets.logo} alt="GreenCart" className="h-8" />
        </a>
        <button
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 ml-1"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        {open && <div className="fixed inset-0 bg-black/10 md:hidden" onClick={()=>setOpen(false)}></div>}
        <nav
          className={`${
            open
              ? "flex flex-col gap-3 absolute left-0 right-0 top-full bg-white border-b border-gray-200 px-4 py-3 md:static md:border-0 md:p-0"
              : "hidden"
          } md:flex md:flex-row md:items-center md:gap-5 md:ml-2`}
        >
          <a href="#/" className="font-semibold text-gray-800" onClick={()=>setOpen(false)}>
            Home
          </a>
          <a href="#/all-products" className="font-semibold text-gray-800" onClick={()=>setOpen(false)}>
            All Product
          </a>
          <a href="#/orders" className="font-semibold text-gray-800" onClick={()=>setOpen(false)}>
            Orders
          </a>
          {user?.role === "user" && (
            <a href="#/dashboard" className="font-semibold text-gray-800" onClick={()=>setOpen(false)}>
              Dashboard
            </a>
          )}
          {(user?.role === "seller" || user?.role === "admin") && (
            <a href="#/seller" className="font-semibold text-gray-800" onClick={()=>setOpen(false)}>
              Seller Dashboard
            </a>
          )}
          {user?.role === "delivery" && (
            <a href="#/delivery" className="font-semibold text-gray-800" onClick={()=>setOpen(false)}>
              Delivery Dashboard
            </a>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 min-w-[200px] md:min-w-[260px] relative">
            <img src={assets.search_icon} alt="" className="w-4 h-4" />
            <input
              placeholder="Search products"
              className="w-full outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => { setSearch?.(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { window.location.hash = "#/all-products"; setShowSuggestions(false); }
              }}
            />
            {q && showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow z-50 max-h-64 overflow-auto">
                {suggestions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No products found</div>
                ) : (
                  suggestions.map((p) => (
                    <a
                      key={p._id}
                      href={`#/product/${p._id}`}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <img src={p.image?.[0]} alt="" className="w-6 h-6 object-contain" />
                      <span className="text-sm text-gray-800 line-clamp-1">{p.name}</span>
                    </a>
                  ))
                )}
                {suggestions.length > 0 && (
                  <a href="#/all-products" className="block px-3 py-2 text-sm text-emerald-700 hover:bg-gray-50 border-t border-gray-100" onClick={() => setShowSuggestions(false)}>
                    See all results
                  </a>
                )}
              </div>
            )}
          </div>
          {user ? (
            <Dropdown user={user} onLogout={onLogout} />
          ) : null}
          <a href="#/cart" className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200">
            <img src={assets.nav_cart_icon} alt="" className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 text-xs leading-none px-1.5 py-1 rounded-full bg-[#2FA25B] text-white">{cartCount}</span>
          </a>
          {user ? null : (
            <a href="#/auth" className="inline-flex items-center font-semibold text-white bg-[#2FA25B] px-4 py-2 rounded-lg">
              Login
            </a>
          )}
        </div>
      </div>
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
        className="hidden sm:inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-gray-200"
        onClick={() => setOpen((v) => !v)}
      >
        <img src={user.avatarUrl ? fileUrl(user.avatarUrl) : assets.profile_icon} alt="" className="w-8 h-8 rounded-full object-cover" onError={(e)=>{ e.currentTarget.src = assets.profile_icon; }} />
        <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">{user.name || user.email}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow">
          <a href="#/profile" className="block px-3 py-2 text-sm hover:bg-gray-50">Profile</a>
          <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Logout</button>
        </div>
      )}
    </div>
  );
}
