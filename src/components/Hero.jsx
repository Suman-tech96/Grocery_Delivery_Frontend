import { assets } from "../assets/greencart/greencart_assets/assets";

export default function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <picture>
            <source media="(max-width: 640px)" srcSet={assets.main_banner_bg_sm} />
            <img src={assets.main_banner_bg} alt="" className="block w-full h-auto" />
          </picture>
          <div className="absolute left-10 md:left-12 lg:left-14 top-1/2 -translate-y-1/2 max-w-[640px]">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-800 leading-tight">
              Freshness You Can
              <br />
              Trust, Savings You
              <br />
              will Love!
            </h1>
            <div className="mt-5 flex items-center gap-4">
              <a href="#/all-products" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2FA25B] text-white font-semibold">
                Shop now
              </a>
              <a href="#footer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold hover:text-gray-900">
                Explore details
                <img src={assets.arrow_right_icon_colored} alt="" className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
