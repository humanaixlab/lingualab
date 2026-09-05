import Link from "next/link";
import { useLanguage } from "../components/LanguageProvider";

export default function Intro() {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/student-dashboard">
        {language === "ar" ? "العودة إلى مركز التعلّم" : "Back to Learn"}
      </Link>
      
      <h1 className="text-3xl font-bold mb-4">
        مدخل إلى اللسانيات الحاسوبية
      </h1>

      <p className="text-gray-600 mb-6">
        هذا المقال يشرح كيف تتحول اللغة إلى بيانات يمكن للحاسوب فهمها.
      </p>

      <div className="bg-white p-6 rounded-2xl shadow-sm leading-8">
        <p>
          في اللسانيات الحاسوبية، نقوم بتحويل النصوص إلى أرقام حتى يستطيع الحاسوب تحليلها.
        </p>

        <p className="mt-4">
          مثال بسيط:
        </p>

        <ul className="mt-2 list-disc pr-5">
          <li>النص: أحب البرمجة</li>
          <li>يتم تحويله إلى أرقام (Vector)</li>
        </ul>
      </div>

    </div>
  );
}
