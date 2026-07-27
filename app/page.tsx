import { ButtonLink } from "@/components/ButtonLink";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ServiceCard } from "@/components/ServiceCard";

const services = [
  {
    index: "01",
    title: "Network design & installation",
    description:
      "Reliable wired and wireless infrastructure designed around the way your space is used.",
  },
  {
    index: "02",
    title: "Wi-Fi optimization",
    description:
      "Consistent coverage, stronger performance, and fewer dead zones throughout your property.",
  },
  {
    index: "03",
    title: "Security camera systems",
    description:
      "Thoughtful camera placement, dependable recording, and simple access wherever you are.",
  },
  {
    index: "04",
    title: "Smart home integration",
    description:
      "Lighting, climate, access, and automation brought together into one intuitive system.",
  },
  {
    index: "05",
    title: "Small business technology",
    description:
      "Secure, scalable technology environments for teams that need to stay connected.",
  },
  {
    index: "06",
    title: "Ongoing support",
    description:
      "Responsive help and long-term care that keep your systems working as they should.",
  },
];

const process = [
  ["Discover", "Understand your space, priorities, and what is not working."],
  ["Design", "Build a clear plan around your needs, budget, and future."],
  ["Integrate", "Install cleanly and make every system work together."],
  ["Validate", "Test performance, document the system, and explain it simply."],
  ["Support", "Remain available after the installation is complete."],
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero" id="top">
          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">Technology integration · Charleston, SC</p>
              <h1>
                Technology that
                <br />
                simply <em>works.</em>
              </h1>
              <p className="hero__lede">
                Everpoint designs, installs, and supports reliable technology
                for homes and small businesses throughout the Lowcountry.
              </p>
              <div className="hero__actions">
                <ButtonLink href="#contact">Start a conversation</ButtonLink>
                <ButtonLink href="#services" variant="text">
                  Explore services
                </ButtonLink>
              </div>
            </div>
            <div className="hero__visual" aria-hidden="true">
              <div className="hero__frame">
                <span className="hero__crosshair hero__crosshair--one" />
                <span className="hero__crosshair hero__crosshair--two" />
                <span className="hero__crosshair hero__crosshair--three" />
                <div className="hero__panel">
                  <p>Integrated by design</p>
                  <strong>Connected.</strong>
                  <strong>Secure.</strong>
                  <strong>Supported.</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="container hero__foot">
            <span>Residential</span>
            <span>Small business</span>
            <span>Lowcountry</span>
          </div>
        </section>

        <section className="section services" id="services">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">What we do</p>
              <h2>One partner for the technology around you.</h2>
              <p>
                Purposeful systems. Clean installations. Plain-English support.
              </p>
            </div>
            <div className="services__grid">
              {services.map((service) => (
                <ServiceCard key={service.index} {...service} />
              ))}
            </div>
          </div>
        </section>

        <section className="section philosophy" id="about">
          <div className="container philosophy__grid">
            <p className="eyebrow">The Everpoint standard</p>
            <div>
              <h2>Technology should fade into the background.</h2>
              <p>
                The best systems are the ones you do not have to think about.
                They are carefully planned, professionally integrated, and
                dependable every day.
              </p>
            </div>
          </div>
        </section>

        <section className="section process" id="approach">
          <div className="container">
            <div className="section-heading section-heading--split">
              <div>
                <p className="eyebrow">Our approach</p>
                <h2>Clear from first conversation to final handoff.</h2>
              </div>
              <p>
                No jargon. No guesswork. A considered process that keeps you
                informed without making technology your job.
              </p>
            </div>
            <ol className="process__list">
              {process.map(([title, description], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-heading">
          <div className="container">
            <div className="contact__intro">
            <div>
              <p className="eyebrow">Start a project</p>
              <h2 id="contact-heading">Tell us what is not working.</h2>
            </div>
            <div className="contact__copy">
              <p>
                Share a little about your space and what you want technology
                to do better. We’ll review it personally and follow up with a
                clear next step.
              </p>
              <a className="contact__alternate" href="mailto:hello@everpoint.tech">
                hello@everpoint.tech
                <span aria-hidden="true">↗</span>
              </a>
            </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
