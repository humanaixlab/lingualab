import PlatformShell, { PlatformCards } from "../../components/PlatformShell";
import { RELEASE_CARDS } from "../../lib/platform-content";

export default function ReleaseNotesPage() {
  return (
    <PlatformShell
      eyebrow={{ en: "RELEASE NOTES", ar: "ملاحظات الإصدار" }}
      title={{ en: "First release", ar: "الإصدار الأول" }}
      description={{ en: "A concise summary of the platform scope and organization prepared for the first release.", ar: "ملخص موجز لنطاق المنصة وتنظيمها استعدادًا للإصدار الأول." }}
    >
      <PlatformCards cards={RELEASE_CARDS} compact />
    </PlatformShell>
  );
}
