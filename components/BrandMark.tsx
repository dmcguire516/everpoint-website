type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  tone?: "graphite" | "white";
};

export function BrandMark({
  className = "",
  compact = false,
  tone = "white",
}: BrandMarkProps) {
  const file = compact
    ? `everpoint-icon-${tone}.svg`
    : `everpoint-horizontal-${tone}.svg`;

  return (
    <Image
      className={`brand-mark ${compact ? "brand-mark--compact" : ""} ${className}`}
      src={`/brand/${file}`}
      alt="Everpoint"
      width={compact ? 132 : 748}
      height={132}
      priority={!compact}
    />
  );
}
import Image from "next/image";
