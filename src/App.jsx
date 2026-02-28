import { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import ProductGrid from "./components/ProductGrid";
import FeatureBanner from "./components/FeatureBanner";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import Category from "./pages/Category";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import AllProducts from "./pages/AllProducts";
import Product from "./pages/Product";
import Address from "./pages/Address";
import SellerDashboard from "./pages/SellerDashboard";
import { api, getToken } from "./lib/api";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import UserDashboard from "./pages/UserDashboard";

export default function App() {
  const [cart, setCart] = useState({});
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState(() => window.location.hash || "#/");
  const [search, setSearch] = useState("");
  const [validIds, setValidIds] = useState(null);
  useEffect(() => {
    const h = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", h);
    if (!window.location.hash) window.location.hash = "#/";
    return () => window.removeEventListener("hashchange", h);
  }, []);
  useEffect(() => {
    if (search.trim()) {
      window.location.hash = "#/all-products";
    }
  }, [search]);
  useEffect(() => {
    api("/products").then((res)=>{
      const set = new Set((res.products || []).map((p)=>p._id));
      setValidIds(set);
    }).catch(()=> setValidIds(new Set()));
  },[]);
  const count = Object.entries(cart).reduce((sum,[id,qty]) => {
    if (validIds && !validIds.has(id)) return sum;
    return sum + qty;
  }, 0);
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setCart({});
    window.location.hash = "#/auth";
  }
  function handleAdd(p) {
    if (!getToken()) { window.location.hash = "#/auth"; return; }
    setCart((c) => ({ ...c, [p._id]: (c[p._id] || 0) + 1 }));
    api("/cart/add", { method: "POST", body: { productId: p._id, qty: 1 }, auth: true })
      .then(()=> alert("Item added successfully"))
      .catch(()=>{});
  }
  function inc(p){
    if(!getToken()){window.location.hash="#/auth";return;}
    setCart((c)=>({...c,[p._id]:(c[p._id]||0)+1}));
    api("/cart/add",{method:"POST",body:{productId:p._id,qty:1},auth:true}).catch(()=>{});
  }
  function dec(p){
    if(!getToken()){window.location.hash="#/auth";return;}
    setCart((c)=>{ const q=(c[p._id]||0)-1; const n={...c}; if(q<=0) delete n[p._id]; else n[p._id]=q; return n; });
    api("/cart",{method:"PUT",body:{productId:p._id,qty:Math.max(0,(cart[p._id]||1)-1)},auth:true}).catch(()=>{});
  }
  function remove(p){
    if(!getToken()){window.location.hash="#/auth";return;}
    setCart((c)=>{ const n={...c}; delete n[p._id]; return n; });
    api(`/cart/${p._id}`,{method:"DELETE",auth:true})
      .then(()=> alert("Item removed successfully"))
      .catch(()=>{});
  }
  function clearCart(){
    setCart({});
  }
  const isHome = route === "#/" || route === "";
  useEffect(()=>{
    const t = getToken();
    if (t) {
      api("/auth/me",{auth:true})
        .then((me)=>{ setUser(me); return api("/cart",{auth:true});})
        .then((res)=>{
          const mapped = {};
          res.items.forEach(i=> mapped[i.productId]=i.qty);
          setCart(mapped);
        })
        .catch(()=>{
          setUser(null);
          window.location.hash = "#/auth";
        });
    } else {
      if (!location.hash || location.hash === "#/") window.location.hash = "#/auth";
    }
  },[]);
  useEffect(()=>{
    const t = getToken();
    if (t) {
      api("/auth/me",{auth:true})
        .then((me)=> setUser(me))
        .catch(()=> setUser(null));
    } else {
      setUser(null);
    }
  },[route]);
  useEffect(()=>{
    if (!user) return;
    if (route === "#/seller" && !(user.role === "seller" || user.role === "admin")) {
      window.location.hash = "#/";
    }
    if (route === "#/delivery" && user.role !== "delivery") {
      window.location.hash = "#/";
    }
  },[route, user]);
  let body = (
    <>
      <Hero />
      <Categories />
      <ProductGrid onAdd={handleAdd} searchQuery={search} />
      <FeatureBanner />
      <Newsletter />
    </>
  );
  if (route.startsWith("#/category/")) {
    const name = decodeURIComponent(route.replace("#/category/", ""));
    body = <Category name={name} onAdd={handleAdd} searchQuery={search} />;
  }
  if (route === "#/cart") {
    body = <Cart cart={cart} onInc={inc} onDec={dec} onRemove={remove} onClearCart={clearCart} />;
  }
  if (route === "#/auth") {
    body = <Auth />;
  }
  if (route === "#/forgot") {
    body = <ForgotPassword />;
  }
  if (route === "#/profile") {
    body = <Profile user={user} setUser={setUser} />;
  }
  if (route === "#/all-products") {
    body = <AllProducts onAdd={handleAdd} searchQuery={search} />;
  }
  if (route.startsWith("#/product/")) {
    const id = route.replace("#/product/", "");
    body = <Product id={id} onAdd={handleAdd} />;
  }
  if (route === "#/address") {
    body = <Address />;
  }
  if (route === "#/seller") {
    body = <SellerDashboard />;
  }
  if (route === "#/orders") {
    body = <Orders />;
  }
  if (route === "#/delivery") {
    body = <DeliveryDashboard />;
  }
  if (route === "#/dashboard") {
    body = <UserDashboard />;
  }
  return (
    <>
      <Header cartCount={count} searchQuery={search} setSearch={setSearch} user={user} onLogout={logout} />
      {body}
      <Footer />
    </>
  );
}
