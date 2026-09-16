import PlatformShell, { PlatformCards } from "../../components/PlatformShell";
import { SUPPORT_CARDS } from "../../lib/platform-content";

export default function SupportPage() {
  return (
    <PlatformShell
      eyebrow={{ en: "SUPPORT", ar: "الدعم" }}
      title={{ en: "How can we help?", ar: "كيف يمكننا المساعدة؟" }}
      description={{ en: "Choose the category that best describes your feedback. These cards provide guidance only and do not submit data.", ar: "اختر الفئة التي تصف ملاحظتك بدقة. هذه البطاقات إرشادية فقط ولا ترسل أي بيانات." }}
    >
      <PlatformCards cards={SUPPORT_CARDS} />
    </PlatformShell>
  );
}
