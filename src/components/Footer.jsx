import { assets, footerLinks } from "../assets/greencart/greencart_assets/assets";

export default function Footer() {
  return (
    <footer id="footer" className="bg-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-1">
          <img src={assets.logo} alt="GreenCart" className="h-8" />
          <p className="text-sm text-gray-600 mt-3">
            We deliver fresh groceries and snacks straight to your door. Trusted by thousands, we aim to make your shopping experience simple and affordable.
          </p>
        </div>
        {footerLinks.map((col) => (
          <div key={col.title}>
            <div className="font-semibold text-gray-800 mb-3">{col.title}</div>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.text}>
                  <a href={l.url} className="text-sm text-gray-600 hover:text-gray-800">{l.text}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
