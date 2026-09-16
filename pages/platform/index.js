import PlatformShell, { PlatformCards } from "../../components/PlatformShell";
import { PLATFORM_SECTIONS } from "../../lib/platform-content";

export default function PlatformPage() {
  return (
    <PlatformShell
      eyebrow={{ en: "PLATFORM CENTER", ar: "مركز المنصة" }}
      title={{ en: "Platform", ar: "المنصة" }}
      description={{ en: "One place for LinguaLab information, documentation, scientific references, trust, support, and release notes.", ar: "مكان واحد لمعلومات LinguaLab وتوثيقها ومراجعها العلمية والثقة والدعم وملاحظات الإصدار." }}
    >
      <PlatformCards cards={PLATFORM_SECTIONS} />
    </PlatformShell>
  );
}
