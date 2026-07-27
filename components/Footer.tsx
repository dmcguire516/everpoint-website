import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <BrandMark />
          <p className="site-footer__tagline">Reliable by design.</p>
        </div>
        <div className="site-footer__contact">
          <p>Charleston, South Carolina</p>
          <a href="mailto:hello@everpoint.tech">hello@everpoint.tech</a>
        </div>
        <div className="site-footer__links">
          <Link href="#services">Services</Link>
          <Link href="#approach">Approach</Link>
          <Link href="#contact">Contact</Link>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <p>© {new Date().getFullYear()} Everpoint. All rights reserved.</p>
        <p>Technology integration for home and business.</p>
      </div>
    </footer>
  );
}
