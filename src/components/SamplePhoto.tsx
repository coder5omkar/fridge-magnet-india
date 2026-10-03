import { buildSampleSvg, type SampleVariant } from "@/lib/sampleArt";

interface SamplePhotoProps {
  uid: string;
  variant?: SampleVariant;
  className?: string;
}

export default function SamplePhoto({
  uid,
  variant = "sunset",
  className,
}: SamplePhotoProps) {
  return (
    <span
      className={["block", className].filter(Boolean).join(" ")}
      role="img"
      aria-label="Sample photo of a scenic landscape"
      dangerouslySetInnerHTML={{ __html: buildSampleSvg(variant, uid) }}
    />
  );
}
