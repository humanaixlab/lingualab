import { LEARNING_PATH_SECTION, researchPathHref } from "./research-path-context.js";

const bi = (en, ar) => Object.freeze({ en, ar });

export const LEARNING_LESSONS = Object.freeze([
  Object.freeze({
    id: "text-analysis",
    cardKey: "text",
    eyebrow: bi("TEXT ANALYSIS FOUNDATIONS", "أساسيات تحليل النص"),
    title: bi("How a computer begins to analyze Arabic text", "كيف يبدأ الحاسوب تحليل النص العربي"),
    overview: bi(
      "Learn what computational text analysis observes before choosing a deeper NLP task. This lesson explains units, tokens, frequency, patterns, and method selection without running an analysis.",
      "تعلّم ما الذي يلاحظه التحليل الحاسوبي قبل اختيار مهمة أعمق في معالجة اللغة. يشرح الدرس الوحدات والرموز والتكرار والأنماط واختيار المنهج، من دون تنفيذ التحليل داخل مركز التعلّم."
    ),
    outcomes: [
      bi("Explain how a computer represents text as countable units.", "تفسير كيفية تمثيل الحاسوب للنص بوصفه وحدات قابلة للعد."),
      bi("Distinguish a document, sentence, token, and character as possible units of analysis.", "التمييز بين الوثيقة والجملة والرمز والكلمة والحرف بوصفها وحدات تحليل محتملة."),
      bi("Use the research question—not the available tool—to choose the next analysis.", "اختيار التحليل التالي وفق السؤال البحثي، لا وفق الأداة المتاحة."),
    ],
    concepts: [
      { title: bi("What computational text analysis means", "ماذا يعني تحليل النص حاسوبيًا؟"), text: bi("A computer does not begin with an interpretation. It receives encoded characters, applies explicit preparation rules, divides the text into selected units, and calculates observable properties such as counts, positions, and repeated sequences.", "لا يبدأ الحاسوب بتفسير المعنى؛ بل يستقبل حروفًا مرمّزة، ويطبّق قواعد إعداد واضحة، ويقسّم النص إلى وحدات مختارة، ثم يحسب خصائص قابلة للملاحظة مثل العدد والموقع والتتابعات المتكررة.") },
      { title: bi("How the computer sees Arabic", "كيف يرى الحاسوب النص العربي؟"), text: bi("Arabic text arrives as a sequence of characters. Letter forms, diacritics, punctuation, spaces, and attached particles affect whether surface forms are treated as the same or different. Any normalization or segmentation rule must therefore be stated and reviewed.", "يصل النص العربي إلى الحاسوب بوصفه سلسلة من الحروف. وتؤثر أشكال الحروف والتشكيل وعلامات الترقيم والمسافات واللواصق في عدّ الصيغ متشابهة أو مختلفة؛ لذلك يجب التصريح بقواعد التطبيع والتجزئة ومراجعتها.") },
      { title: bi("Choose the unit of analysis", "حدّد وحدة التحليل"), text: bi("The unit may be a whole document, a sentence, a surface token, a segmented word, or a character. The correct unit depends on the question: document labels suit classification, sentences suit local patterns, and tokens suit lexical frequency.", "قد تكون الوحدة وثيقة كاملة أو جملة أو رمزًا سطحيًا أو كلمة مجزأة أو حرفًا. تتحدد الوحدة بحسب السؤال: تصنيفات الوثائق تناسب التصنيف، والجمل تناسب الأنماط المحلية، والرموز تناسب التكرار المعجمي.") },
      { title: bi("Tokens and simple structure", "الرموز والبنية النصية البسيطة"), text: bi("Tokenization turns a text into a sequence that can be counted. A simple whitespace split is only a starting point in Arabic because a conjunction such as و may remain attached to the following word.", "تحوّل التجزئة النص إلى تتابع يمكن عدّه. ويُعد الفصل بالمسافات نقطة بداية فقط في العربية؛ لأن حرف العطف «و» قد يبقى ملتصقًا بالكلمة التالية.") },
      { title: bi("Frequencies and patterns", "التكرارات والأنماط"), text: bi("Frequency shows what recurs; concordance shows where it recurs; n-grams show which short sequences recur together. These are observations about the submitted text, not explanations of intent, quality, or causation.", "يبيّن التكرار ما يتكرر، وتبيّن السياقات مواضع تكراره، وتبيّن المتتاليات اللفظية التتابعات القصيرة المتكررة معًا. هذه ملاحظات عن النص المقدّم وليست تفسيرًا للقصد أو الجودة أو السببية.") },
      { title: bi("Observation is not a deeper NLP task", "الملاحظة ليست مهمة NLP أعمق"), text: bi("A text profile can reveal size and recurring forms. Sentiment classification, entity extraction, semantic grouping, and discourse interpretation require a separate task definition, suitable data, and evaluation evidence.", "قد يكشف الوصف النصي الحجم والصيغ المتكررة. أما تصنيف المشاعر واستخراج الكيانات والتجميع الدلالي وتفسير الخطاب فتحتاج إلى تعريف مستقل للمهمة وبيانات مناسبة وأدلة تقييم.") },
      { title: bi("Choose analysis from the question", "اختر التحليل انطلاقًا من السؤال"), text: bi("Ask what evidence would answer the question. Use frequency for recurrence, concordance for contextual use, n-grams for recurring phrases, classification for predefined labels, and extraction for named items or relations.", "اسأل أولًا: ما الدليل الذي يجيب عن السؤال؟ استخدم التكرار للرصد الكمي، والسياقات للاستعمال المحيط، والمتتاليات للعبارات المتكررة، والتصنيف للفئات المحددة مسبقًا، والاستخراج للعناصر أو العلاقات المسماة.") },
    ],
    example: {
      title: bi("Worked Arabic example", "مثال عربي محلول"),
      sample: bi("اللغة واضحة. اللغة مفيدة.", "اللغة واضحة. اللغة مفيدة."),
      steps: [
        bi("Question: Which lexical item repeats in this two-sentence sample?", "السؤال: ما المفردة المتكررة في هذه العينة المكوّنة من جملتين؟"),
        bi("Unit: surface tokens after separating punctuation.", "الوحدة: الرموز السطحية بعد فصل علامات الترقيم."),
        bi("Tokens: اللغة · واضحة · اللغة · مفيدة.", "الرموز: اللغة · واضحة · اللغة · مفيدة."),
        bi("Observation: اللغة occurs twice; واضحة and مفيدة occur once each.", "الملاحظة: تكررت «اللغة» مرتين، وظهرت «واضحة» و«مفيدة» مرة واحدة لكل منهما."),
        bi("Limit: frequency alone does not prove sentiment or explain why the description is positive.", "القيد: لا يثبت التكرار وحده المشاعر ولا يفسّر سبب إيجابية الوصف."),
      ],
    },
    exercise: {
      title: bi("Guided learner exercise", "تمرين موجّه للمتعلّم"),
      prompt: bi("Use the sample: «يقرأ الباحث النص. يراجع الباحث النتائج.»", "استخدم العينة: «يقرأ الباحث النص. يراجع الباحث النتائج.»"),
      steps: [
        bi("State whether your unit is the sentence or the token.", "حدّد هل وحدة التحليل هي الجملة أم الرمز."),
        bi("List the surface tokens after removing the full stops.", "اكتب الرموز السطحية بعد إزالة النقطتين."),
        bi("Count الباحث and record only what the count demonstrates.", "احسب تكرار «الباحث»، وسجّل ما يثبته العدد فقط."),
        bi("If your question concerns the actions around الباحث, choose concordance rather than frequency alone.", "إذا كان سؤالك عن الأفعال المحيطة بـ«الباحث»، فاختر تحليل السياقات بدل الاكتفاء بالتكرار."),
      ],
    },
    check: {
      question: bi("What should determine the next analysis after an initial text profile?", "ما الذي ينبغي أن يحدد التحليل التالي بعد الوصف النصي الأولي؟"),
      options: [
        bi("The research question and the evidence it requires", "السؤال البحثي ونوع الدليل الذي يتطلبه"),
        bi("Whichever tool appears first", "الأداة التي تظهر أولًا"),
        bi("The most complex available AI model", "أعقد نموذج ذكاء اصطناعي متاح"),
      ],
      correctIndex: 0,
      correct: bi("Correct. The question, unit, data, and required evidence determine the method.", "صحيح. يحدد السؤال والوحدة والبيانات والدليل المطلوب المنهج المناسب."),
      incorrect: bi("Review the method-selection section: tools follow the research question, not the reverse.", "راجع قسم اختيار التحليل: تتبع الأداة السؤال البحثي، وليس العكس."),
    },
    application: {
      tool: bi("Analyze", "Analyze"),
      label: bi("Apply now in Analyze", "طبّق الآن في Analyze"),
      description: bi("Continue with the Corpus Linguistics learning context. Analyze remains responsible for executing the analysis.", "تابع بسياق تعلّم لسانيات المدونات، مع بقاء تنفيذ التحليل من مسؤولية Analyze."),
    },
  }),
  Object.freeze({
    id: "prompt-practice",
    cardKey: "prompt",
    eyebrow: bi("PROMPT LITERACY", "الثقافة في صياغة التعليمات"),
    title: bi("Write instructions that make the task reviewable", "اكتب تعليمات تجعل المهمة قابلة للمراجعة"),
    overview: bi("Learn the parts of a clear research prompt, compare a vague instruction with a bounded one, and draft a prompt before using Prompt Builder.", "تعلّم عناصر التعليمات البحثية الواضحة، وقارن بين صياغة مبهمة وأخرى منضبطة، ثم اكتب مسودة قبل استخدام أداة بناء التعليمات."),
    outcomes: [bi("Separate the task, context, constraints, and output format.", "افصل بين المهمة والسياق والقيود وشكل المخرج."), bi("Keep evidence and uncertainty visible.", "أبقِ الأدلة وعدم اليقين ظاهرين."), bi("Review a generated prompt before using it.", "راجع التعليمات المولدة قبل استخدامها.")],
    concepts: [
      { title: bi("Name one task", "سمِّ مهمة واحدة"), text: bi("A prompt is clearer when it asks for one observable task, such as summarizing a passage or identifying candidate terms, rather than requesting an entire research project.", "تكون التعليمات أوضح عندما تطلب مهمة واحدة قابلة للملاحظة، مثل تلخيص فقرة أو تحديد مصطلحات مرشحة، بدل طلب مشروع بحثي كامل.") },
      { title: bi("Supply necessary context", "قدّم السياق الضروري"), text: bi("State the language, audience, purpose, and available evidence without adding private or irrelevant data.", "حدّد اللغة والجمهور والغرض والأدلة المتاحة من دون إضافة بيانات خاصة أو غير مرتبطة بالمهمة.") },
      { title: bi("Set boundaries", "ضع القيود"), text: bi("Require the response to distinguish source evidence from inference, avoid invented facts, and acknowledge missing information.", "اطلب من المخرج الفصل بين دليل المصدر والاستنتاج، وتجنّب اختلاق الحقائق، والتصريح بالمعلومات الناقصة.") },
      { title: bi("Define the output", "حدّد شكل المخرج"), text: bi("Specify a concise structure such as headings, a table, or a list so the result can be checked against the request.", "حدّد بنية موجزة مثل عناوين أو جدول أو قائمة حتى يمكن فحص النتيجة مقارنة بالطلب.") },
    ],
    example: { title: bi("Worked prompt example", "مثال محلول للتعليمات"), sample: bi("Vague: Analyze this text.\nBounded: Identify three recurring terms in the supplied Arabic paragraph, cite each exact form, and explain one limitation. Do not add external facts.", "مبهم: حلّل هذا النص.\nمنضبط: حدّد ثلاثة مصطلحات متكررة في الفقرة العربية المقدمة، واستشهد بالصيغة الأصلية لكل مصطلح، واشرح قيدًا واحدًا. لا تضف حقائق خارجية."), steps: [bi("The task is explicit.", "المهمة صريحة."), bi("The evidence must come from the supplied text.", "يجب أن يأتي الدليل من النص المقدم."), bi("The output and limitation are reviewable.", "المخرج والقيد قابلان للمراجعة.")] },
    exercise: { title: bi("Guided learner exercise", "تمرين موجّه للمتعلّم"), prompt: bi("Rewrite «Explain Arabic morphology» as a bounded learning prompt.", "أعد صياغة «اشرح الصرف العربي» بوصفها تعليمات تعليمية منضبطة."), steps: [bi("Choose one concept, such as the root and pattern relationship.", "اختر مفهومًا واحدًا مثل العلاقة بين الجذر والوزن."), bi("Name the learner level and the supplied example.", "حدّد مستوى المتعلّم والمثال المقدم."), bi("Request a short structure and one limitation.", "اطلب بنية قصيرة وقيدًا واحدًا."), bi("Check that the instruction does not ask the model to invent a source.", "تحقق من أن التعليمات لا تطلب من النموذج اختلاق مصدر.")] },
    check: { question: bi("Which element makes a generated prompt easier to verify?", "أي عنصر يجعل التعليمات المولدة أسهل في التحقق؟"), options: [bi("A defined task, evidence boundary, and output format", "مهمة محددة وحدود للأدلة وشكل واضح للمخرج"), bi("Adding several unrelated goals", "إضافة عدة أهداف غير مترابطة"), bi("Leaving the expected output unspecified", "ترك شكل المخرج بلا تحديد")], correctIndex: 0, correct: bi("Correct. Clear boundaries make both the instruction and its result reviewable.", "صحيح. تجعل الحدود الواضحة التعليمات ونتيجتها قابلتين للمراجعة."), incorrect: bi("Review the lesson: a prompt needs a defined task, evidence boundary, and output format.", "راجع الدرس: تحتاج التعليمات إلى مهمة محددة وحدود للأدلة وشكل للمخرج.") },
    application: { tool: bi("Prompt Builder", "أداة بناء التعليمات"), label: bi("Practice now in Prompt Builder", "طبّق الآن في أداة بناء التعليمات"), description: bi("Use the production tool to create and edit the prompt. The lesson does not generate it.", "استخدم الأداة الإنتاجية لإنشاء التعليمات وتعديلها؛ فالدرس لا يولّدها.") },
  }),
  Object.freeze({
    id: "code-learning",
    cardKey: "code",
    eyebrow: bi("APPLIED NLP", "معالجة اللغة التطبيقية"),
    title: bi("Turn a defined NLP task into inspectable code steps", "حوّل مهمة NLP محددة إلى خطوات برمجية قابلة للفحص"),
    overview: bi("Learn how inputs, processing steps, outputs, and test cases form a small NLP program before asking Code Builder for starter implementation.", "تعلّم كيف تكوّن المدخلات وخطوات المعالجة والمخرجات وحالات الاختبار برنامجًا صغيرًا لمعالجة اللغة قبل طلب شفرة بداية من أداة بناء الكود."),
    outcomes: [bi("Separate the linguistic question from its implementation steps.", "افصل السؤال اللغوي عن خطوات تنفيذه."), bi("Trace one input through a simple deterministic pipeline.", "تتبّع مدخلًا واحدًا عبر خط معالجة حتمي بسيط."), bi("Recognize that generated starter code still requires review and testing.", "أدرك أن شفرة البداية المولدة تحتاج إلى المراجعة والاختبار.")],
    concepts: [
      { title: bi("Define input and output", "حدّد المدخل والمخرج"), text: bi("Code needs a concrete input shape and an expected output. “Process Arabic” is not enough; “count surface tokens in one UTF-8 string” is testable.", "تحتاج الشفرة إلى شكل محدد للمدخل ومخرج متوقع. لا تكفي عبارة «عالج العربية»، بينما يمكن اختبار «احسب الرموز السطحية في سلسلة UTF-8 واحدة».") },
      { title: bi("Write the pipeline", "اكتب خط المعالجة"), text: bi("A small pipeline may validate input, normalize only approved forms, tokenize, compute a result, and return it. Each step should have one responsibility.", "قد يتحقق خط صغير من المدخل، ويطبّع الصيغ المعتمدة فقط، ويجزّئ النص، ويحسب النتيجة، ثم يعيدها. يجب أن تكون لكل خطوة مسؤولية واحدة.") },
      { title: bi("Use examples as tests", "استخدم الأمثلة اختبارات"), text: bi("A known input and expected output reveal whether the implementation follows the intended rule, especially around punctuation and Arabic clitics.", "يكشف المدخل المعروف والمخرج المتوقع مدى التزام التنفيذ بالقاعدة المقصودة، وخصوصًا عند علامات الترقيم واللواصق العربية.") },
      { title: bi("Keep ownership clear", "حافظ على وضوح المسؤولية"), text: bi("This lesson explains the structure. Code Builder owns starter implementation; NLP Builder owns linguistic-to-computational design when the linguistic rule is not yet defined.", "يشرح هذا الدرس البنية فقط. تملك أداة بناء الكود تنفيذ شفرة البداية، بينما يملك NLP Builder تحويل المعرفة اللغوية إلى تصميم حاسوبي عندما لا تكون القاعدة اللغوية محددة بعد.") },
    ],
    example: { title: bi("Worked code trace", "مثال محلول لتتبّع الشفرة"), sample: bi("Input: «لغة عربية» → split on whitespace → [«لغة», «عربية»] → token count: 2", "المدخل: «لغة عربية» ← الفصل بالمسافة ← [«لغة»، «عربية»] ← عدد الرموز: 2"), steps: [bi("The input type is a text string.", "نوع المدخل سلسلة نصية."), bi("The processing rule is explicit and deliberately simple.", "قاعدة المعالجة صريحة وبسيطة عمدًا."), bi("The expected value 2 becomes a test case.", "تصبح القيمة المتوقعة 2 حالة اختبار.")] },
    exercise: { title: bi("Guided learner exercise", "تمرين موجّه للمتعلّم"), prompt: bi("Design—not execute—a pipeline that counts sentences separated by full stops.", "صمّم—من دون تنفيذ—خط معالجة يعدّ الجمل المفصولة بنقاط."), steps: [bi("Specify the accepted input.", "حدّد المدخل المقبول."), bi("Describe how empty segments are removed.", "صف كيفية حذف المقاطع الفارغة."), bi("Write one expected input/output pair.", "اكتب زوجًا واحدًا من المدخل والمخرج المتوقع."), bi("Name one Arabic punctuation limitation to test.", "اذكر قيدًا واحدًا متعلقًا بعلامات الترقيم العربية يجب اختباره.")] },
    check: { question: bi("When should you go to NLP Builder instead of Code Builder?", "متى ينبغي الانتقال إلى NLP Builder بدل أداة بناء الكود؟"), options: [bi("When the linguistic rule still needs to be turned into a computational design", "عندما تحتاج القاعدة اللغوية إلى تحويلها أولًا إلى تصميم حاسوبي"), bi("Whenever code needs a variable name", "كلما احتاجت الشفرة إلى اسم متغير"), bi("After every successful code test", "بعد كل اختبار ناجح للشفرة")], correctIndex: 0, correct: bi("Correct. NLP Builder defines the computational design; Code Builder implements a defined task.", "صحيح. يحدد NLP Builder التصميم الحاسوبي، وتنفّذ أداة بناء الكود المهمة المحددة."), incorrect: bi("Review the ownership section: undefined linguistic design belongs in NLP Builder.", "راجع قسم المسؤوليات: التصميم اللغوي الحاسوبي غير المحدد من اختصاص NLP Builder.") },
    application: { tool: bi("Code Builder", "أداة بناء الكود"), label: bi("Apply now in Code Builder", "طبّق الآن في أداة بناء الكود"), description: bi("Take a defined computational task to the production implementation tool.", "انقل مهمة حاسوبية محددة إلى أداة التنفيذ الإنتاجية.") },
  }),
  Object.freeze({
    id: "data-learning",
    cardKey: "data",
    eyebrow: bi("RESEARCH DATA", "البيانات البحثية"),
    title: bi("Read a dataset before choosing an analysis", "اقرأ مجموعة البيانات قبل اختيار التحليل"),
    overview: bi("Learn how rows, columns, missing values, duplicates, text fields, and labels affect whether a dataset is ready for a research task.", "تعلّم كيف تؤثر الصفوف والأعمدة والقيم المفقودة والتكرارات وحقول النص والتصنيفات في جاهزية مجموعة البيانات لمهمة بحثية."),
    outcomes: [bi("Identify observational units and variable roles.", "حدّد وحدات الملاحظة وأدوار المتغيرات."), bi("Recognize basic quality signals before analysis.", "تعرّف إلى إشارات الجودة الأساسية قبل التحليل."), bi("Separate data inspection from actual modeling or interpretation.", "افصل فحص البيانات عن النمذجة أو التفسير الفعلي.")],
    concepts: [
      { title: bi("Rows and observational units", "الصفوف ووحدات الملاحظة"), text: bi("Each row should represent a stated unit, such as one document, sentence, or response. Mixing units makes counts and evaluation difficult to interpret.", "ينبغي أن يمثل كل صف وحدة معلنة مثل وثيقة أو جملة أو استجابة واحدة. يجعل خلط الوحدات الأعداد والتقييم صعبي التفسير.") },
      { title: bi("Columns and roles", "الأعمدة وأدوارها"), text: bi("A text column contains the material to process. A label column may contain a human category. Identifiers and metadata should not silently become model features.", "يحتوي عمود النص المادة المراد معالجتها، وقد يحتوي عمود التصنيف فئة بشرية. ولا ينبغي أن تتحول المعرّفات والبيانات الوصفية ضمنيًا إلى سمات للنموذج.") },
      { title: bi("Quality checks", "فحوص الجودة"), text: bi("Inspect missing values, exact duplicates, inconsistent labels, encoding, language coverage, and class balance before selecting a workflow.", "افحص القيم المفقودة والتكرارات التامة وعدم اتساق التصنيفات والترميز والتغطية اللغوية وتوازن الفئات قبل اختيار مسار العمل.") },
      { title: bi("Inspection is not execution", "الفحص ليس تنفيذًا"), text: bi("Describing columns and quality does not train a model or establish a finding. The appropriate production tool performs the selected analysis after the researcher reviews the data.", "لا يؤدي وصف الأعمدة والجودة إلى تدريب نموذج أو إثبات نتيجة. تنفذ الأداة الإنتاجية المناسبة التحليل المختار بعد مراجعة الباحث للبيانات.") },
    ],
    example: { title: bi("Worked dataset example", "مثال محلول لمجموعة بيانات"), sample: bi("Three columns: id · text · label; one row has empty text; two rows share the same id.", "ثلاثة أعمدة: المعرّف · النص · التصنيف؛ يحتوي صف على نص فارغ، ويتشارك صفان المعرّف نفسه."), steps: [bi("Unit: one labeled text per row.", "الوحدة: نص واحد مصنّف في كل صف."), bi("The empty text cannot support text analysis until reviewed.", "لا يدعم النص الفارغ تحليل النص قبل مراجعته."), bi("Repeated identifiers require investigation; they do not automatically prove duplicate texts.", "تحتاج المعرّفات المتكررة إلى فحص، ولا تثبت تلقائيًا تكرار النصوص."), bi("Label distribution should be inspected before classification.", "ينبغي فحص توزيع التصنيفات قبل التصنيف.")] },
    exercise: { title: bi("Guided learner exercise", "تمرين موجّه للمتعلّم"), prompt: bi("Imagine a table with text, label, date, and source columns.", "تخيّل جدولًا يحتوي أعمدة النص والتصنيف والتاريخ والمصدر."), steps: [bi("Name the observational unit.", "سمِّ وحدة الملاحظة."), bi("Choose which column is the text input and which is the human target.", "حدّد عمود النص المدخل وعمود الهدف البشري."), bi("List two quality checks before classification.", "اكتب فحصين للجودة قبل التصنيف."), bi("State which metadata must be reviewed before using it as a feature.", "حدّد البيانات الوصفية التي يجب مراجعتها قبل استخدامها سمةً.")] },
    check: { question: bi("What is the safest first step after receiving a new research spreadsheet?", "ما الخطوة الأولى الأكثر أمانًا بعد استلام جدول بيانات بحثي جديد؟"), options: [bi("Inspect units, columns, missing values, duplicates, and labels", "فحص الوحدات والأعمدة والقيم المفقودة والتكرارات والتصنيفات"), bi("Train the most complex model immediately", "تدريب أعقد نموذج فورًا"), bi("Treat every column as a valid feature", "اعتبار كل عمود سمة صالحة")], correctIndex: 0, correct: bi("Correct. Data structure and quality must be understood before execution.", "صحيح. يجب فهم بنية البيانات وجودتها قبل التنفيذ."), incorrect: bi("Review the quality section: inspect the dataset before selecting or running a method.", "راجع قسم الجودة: افحص مجموعة البيانات قبل اختيار المنهج أو تشغيله.") },
    application: { tool: bi("Spreadsheet Explorer", "مستكشف الجداول"), label: bi("Apply now in Spreadsheet Explorer", "طبّق الآن في مستكشف الجداول"), description: bi("Inspect an actual structured file in the production tool. The lesson does not upload or process data.", "افحص ملفًا منظمًا فعليًا في الأداة الإنتاجية؛ فالدرس لا يرفع البيانات ولا يعالجها.") },
  }),
]);

export const LEARNING_LESSON_IDS = Object.freeze(LEARNING_LESSONS.map((lesson) => lesson.id));

export function learningLessonForId(id) {
  return LEARNING_LESSONS.find((lesson) => lesson.id === id) || null;
}

export function learningLessonRoute(id) {
  return `/learning-center/${id}`;
}

export function learningApplicationHref(id) {
  if (id === "text-analysis") {
    return `${researchPathHref("/tools/analyze", "corpus-linguistics", LEARNING_PATH_SECTION)}&learningLesson=text-analysis#quick-analysis`;
  }
  const destinations = {
    "prompt-practice": "/tools/prompt",
    "code-learning": "/tools/code",
    "data-learning": "/tools/excel",
  };
  return destinations[id] ? `${destinations[id]}?from=learn&lesson=${id}` : "/learning-center";
}
