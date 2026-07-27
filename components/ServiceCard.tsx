type ServiceCardProps = {
  index: string;
  title: string;
  description: string;
};

export function ServiceCard({ index, title, description }: ServiceCardProps) {
  return (
    <article className="service-card">
      <span className="service-card__index">{index}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="service-card__arrow" aria-hidden="true">
        ↗
      </span>
    </article>
  );
}
