import PlatformShell, { PlatformCards } from "../../components/PlatformShell";
import { TRUST_CARDS } from "../../lib/platform-content";

export default function TrustPage() {
  return (
    <PlatformShell
      eyebrow={{ en: "TRUST", ar: "الثقة" }}
      title={{ en: "Responsible research support", ar: "دعم بحثي مسؤول" }}
      description={{ en: "A short account of how LinguaLab presents AI support, scientific responsibility, capability boundaries, citations, and limitations.", ar: "عرض موجز لكيفية تقديم LinguaLab لدعم الذكاء الاصطناعي والمسؤولية العلمية وحدود الإمكانات والاستشهادات والقيود." }}
    >
      <PlatformCards cards={TRUST_CARDS} />
    </PlatformShell>
  );
}
