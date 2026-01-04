import Link from "next/link";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Why MyTime?", href: "/why-mytime" },
  { label: "Key Features", href: "/key-features" },
  { label: "Dashboard", href: "#" },
  { label: "Built Evidence", href: "#" },
  { label: "Reflection", href: "#" },
];

export default function SidebarNav() {
  return (
    <aside className="w-56 border-r border-zinc-300 bg-zinc-50 px-4 py-5">
      <div className="mb-4 text-sm font-semibold text-zinc-800">MyTime</div>
      <nav aria-label="Primary" className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isHash = item.href.startsWith("#");
          const className =
            "block rounded border border-zinc-400 bg-white px-3 py-2 text-sm text-zinc-800";

          return isHash ? (
            <a key={item.label} href={item.href} className={className}>
              {item.label}
            </a>
          ) : (
            <Link key={item.label} href={item.href} className={className}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
