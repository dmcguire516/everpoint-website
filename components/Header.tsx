import Link from "next/link";
import { BrandMark } from "./BrandMark";

const navigation = [
  { label: "Services", href: "#services" },
  { label: "Approach", href: "#approach" },
  { label: "About", href: "#about" },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="site-header__brand">
          <BrandMark />
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="site-header__nav">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link className="site-header__cta" href="#contact">
          Start a project
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
