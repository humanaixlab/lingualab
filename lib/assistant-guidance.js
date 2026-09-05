const guidance = {
  home: {
    routes: ["/"],
    ar: [
      ["من أين أبدأ في LinguaLab؟", "ابدأ من هدفك الحالي: خطّط للدراسة في Research، وافحص البيانات في Workspace، واختر التحليل في Analyze، أو طوّر مهاراتك في Learn."],
      ["كيف يدعم LinguaLab مسار البحث؟", "يربط بين فهم البيانات وتصميم الدراسة والتحليل والتفسير والتقرير، مع إبقاء القرار المنهجي والمراجعة النهائية بيد الباحث."],
      ["هل أحتاج إلى بيانات قبل البدء؟", "لا. يمكنك البدء بتصميم سؤال أو تعلّم مفهوم، أما أدوات التحليل فتحتاج إلى نص أو نتائج مناسبة حتى تقدّم دليلًا فعليًا."],
      ["ما الفرق بين Research وAnalyze وBuild وLearn؟", "Research ينظّم المسار، وAnalyze يفحص الأدلة، وBuild يدعم مهام البيانات والبرمجة، وLearn يطوّر المهارات اللازمة لاستخدامها بحثيًا."],
    ],
    en: [
      ["Where should I start in LinguaLab?", "Start from your current goal: plan a study in Research, inspect data in Workspace, choose analysis in Analyze, or develop skills in Learn."],
      ["How does LinguaLab support a research workflow?", "It connects data understanding, study design, analysis, interpretation, and reporting while keeping methodological decisions and final review with the researcher."],
      ["Do I need data before I begin?", "No. You can begin by designing a question or learning a concept; analysis tools need suitable text or results before they can provide actual evidence."],
      ["What is the difference between Research, Analyze, Build, and Learn?", "Research organizes the journey, Analyze examines evidence, Build supports data and coding tasks, and Learn develops the skills needed to use them in research."],
    ],
  },
  research: {
    routes: ["/ar-tools"],
    ar: [
      ["كيف أختار مرحلتي التالية في البحث؟", "حدّد ما أنجزته بالفعل: فهم البيانات، أو تصميم الدراسة، أو التحليل، أو التفسير؛ ثم انتقل إلى أول مرحلة ما زالت تحتاج إلى دليل أو قرار."],
      ["ما الفرق بين Research Advisor وResearch Interpreter؟", "المستشار البحثي يدعم السؤال والمنهج وتصميم الدراسة، بينما مفسر النتائج يقرأ نتائج تحليل موجودة ويربطها بسؤال البحث وحدوده."],
      ["متى أنتقل إلى Research Report؟", "انتقل بعد توفر نتائج أو توصيات فعلية تريد تنظيمها وتوثيقها، ولا تستخدم التقرير بديلًا عن استكمال التحليل أو التحقق من الأدلة."],
      ["كيف أستفيد من سياق الدراسة الحالي؟", "استخدم إجراءات المتابعة داخل المسار حتى تنتقل البيانات الوصفية والنتائج المتاحة إلى الأداة المقصودة دون خلطها بسياق قديم."],
    ],
    en: [
      ["How do I choose my next research stage?", "Identify what is already complete—data understanding, study design, analysis, or interpretation—then continue to the first stage that still needs evidence or a decision."],
      ["What is the difference between Research Advisor and Research Interpreter?", "The Advisor supports questions, methods, and study design; the Interpreter examines existing analysis results and relates them to the question and limitations."],
      ["When should I move to Research Report?", "Continue when you have actual results or recommendations to organize and document; a report should not replace completing the analysis or checking the evidence."],
      ["How can I use the current study context?", "Use continuation actions in the research path so available metadata and results reach the intended tool without being confused with stale context."],
    ],
  },
  workspace: {
    routes: ["/workspace"],
    ar: [
      ["ما الخطوة التالية المناسبة لبياناتي؟", "ابدأ بفحص بنية البيانات وجودتها، ثم حدّد سؤالك البحثي واختر التحليل الذي يقدّم دليلًا مناسبًا للإجابة عنه."],
      ["كيف أختار المسار البحثي؟", "ابدأ بنوع السؤال: الاستعمال المتكرر يقود إلى لسانيات المدونات، والفئات المعروفة إلى تصنيف النصوص، والبنية النحوية إلى مسار الصرف والنحو."],
      ["ما التحليل المناسب لسؤالي؟", "اربط الأداة بالدليل المطلوب: التكرار للكلمات الشائعة، والسياقات للاستعمال، والمتتاليات للتراكيب، وأقسام الكلام للأنماط النحوية."],
      ["كيف أحافظ على سياق مشروعي؟", "استخدم إجراءات المتابعة المرتبطة بالمشروع؛ فهي تمرّر السياق الآمن إلى الأداة التالية دون نقل بيانات خام غير لازمة."],
    ],
    en: [
      ["What is the right next step for my data?", "Start by reviewing the dataset structure and quality, then define your research question and choose an analysis that can provide relevant evidence."],
      ["How do I choose a research path?", "Start from the question type: recurring usage suggests Corpus Linguistics, known labels suggest Text Classification, and grammatical structure suggests Morphology & Syntax."],
      ["Which analysis fits my question?", "Match the tool to the evidence: frequency for common words, contexts for usage, N-grams for sequences, and POS for grammatical patterns."],
      ["How do I preserve my project context?", "Use project continuation actions; they pass safe context to the next tool without transferring unnecessary raw data."],
    ],
  },
  copilot: {
    routes: [],
    ar: [
      ["لماذا اقترح هذا النوع من الدراسة؟", "يربط الاقتراح بين هدفك وبنية البيانات والنتيجة التي يمكن الدفاع عنها، مع توضيح القيود التي تمنع المبالغة في الاستنتاج."],
      ["ما المقصود بـ Baseline؟", "خط الأساس (Baseline) نموذج أو نتيجة أولية بسيطة تستخدم مرجعًا للمقارنة قبل تجربة بدائل أكثر تعقيدًا."],
      ["ما المقاييس المناسبة للتقييم؟", "اختر المقاييس بحسب المهمة وتوازن الفئات؛ في التصنيف مثلًا راجع الدقة والاسترجاع وMacro-F1 ومصفوفة الالتباس."],
      ["كيف أنتقل من التصميم إلى التنفيذ؟", "راجع السؤال والعينة والمتغيرات وخطة التقييم، ثم انتقل بإجراء صريح إلى التحليل المناسب وابدأ بخط أساس قابل للتفسير."],
    ],
    en: [
      ["Why was this study type suggested?", "The suggestion connects your goal, data structure, and defensible outcome while stating limitations that constrain the conclusion."],
      ["What does Baseline mean?", "A Baseline is a simple initial model or result used as a reference before testing more complex alternatives."],
      ["Which evaluation metrics should I use?", "Choose metrics for the task and class balance; for classification, review precision, recall, Macro-F1, and the Confusion Matrix."],
      ["How do I move from design to implementation?", "Review the question, sample, variables, and evaluation plan, then explicitly continue to the relevant analysis and begin with an interpretable baseline."],
    ],
  },
  analyze: {
    routes: ["/tools/analyze"],
    ar: [
      ["أي أداة تحليل تناسب سؤالي البحثي؟", "اختر الأداة بحسب نوع الدليل المطلوب: التكرارات، أو السياقات، أو المتتاليات اللفظية، أو توزيع أقسام الكلام، ثم فسّر النتيجة في ضوء سؤالك."],
      ["ما الفرق بين Frequency وContexts وN-grams وPOS؟", "Frequency يحصي الكلمات، وContexts يعرض استعمالها المحيط، وN-grams يكشف المتتاليات المتكررة، وPOS يصف توزيع الفئات النحوية."],
      ["متى أستخدم مفسر النتائج؟", "استخدمه بعد ظهور نتائج فعلية عندما تحتاج إلى ربط الأنماط بسؤال البحث، مع مراجعة التفسير وعدم اعتباره استنتاجًا نهائيًا."],
      ["كيف أنتقل من التحليل إلى التقرير؟", "أكمل التحليل أولًا، ثم استخدم إجراء إنشاء التقرير المرتبط بالنتيجة حتى ينتقل سياق التحليل الحالي إلى التقرير."],
    ],
    en: [
      ["Which analysis tool fits my research question?", "Choose by the evidence you need: frequencies, contexts, recurring sequences, or POS distributions, then interpret the result against your question."],
      ["What is the difference between Frequency, Contexts, N-grams, and POS?", "Frequency counts words, Contexts shows surrounding use, N-grams finds recurring sequences, and POS describes grammatical-category distributions."],
      ["When should I use the Research Interpreter?", "Use it after obtaining real results when you need to connect patterns to your research question, while treating its interpretation as guidance rather than a final conclusion."],
      ["How do I move from analysis to a report?", "Complete the analysis, then use its Generate Report action so the current result context is carried into the report."],
    ],
  },
  frequency: {
    routes: ["/tools/frequency"],
    ar: [
      ["ماذا يعني ارتفاع تكرار كلمة؟", "يعني أن الكلمة ظهرت كثيرًا في النص، لكنه لا يثبت وحده أهميتها الدلالية أو البحثية دون فحص السياق وحجم المدونة."],
      ["هل التكرار وحده يكفي لتفسير أهمية الكلمة؟", "لا. ينبغي ربط التكرار بالسياقات والتوزيع بين النصوص والسؤال البحثي، وقد تكون بعض الكلمات شائعة لأسباب وظيفية فقط."],
      ["ما الفرق بين التكرار الخام والتكرار المعياري؟", "التكرار الخام هو عدد مرات الظهور، أما المعياري فينسب العدد إلى حجم النص، مما يجعل المقارنة بين نصوص مختلفة الحجم أكثر عدلًا."],
      ["كيف أستخدم النتائج في البحث؟", "حدّد الكلمات البارزة، وافحص سياقاتها، وقارن توزيعها بين العينات، ثم اربط النمط بأدلة أخرى قبل صياغة الاستنتاج."],
    ],
    en: [
      ["What does a high word frequency mean?", "It means the word occurs often in the text, but frequency alone does not establish semantic or research importance without context and corpus size."],
      ["Is frequency alone enough to explain a word's importance?", "No. Relate frequency to contexts, distribution across texts, and the research question; some words may be common for functional reasons."],
      ["What is the difference between raw and normalized frequency?", "Raw frequency is the occurrence count; normalized frequency adjusts that count for text size, enabling fairer comparisons across differently sized texts."],
      ["How can I use these results in research?", "Identify prominent words, inspect their contexts, compare distributions across samples, and combine the pattern with other evidence before drawing conclusions."],
    ],
  },
  contexts: {
    routes: ["/tools/concordance"],
    ar: [
      ["ما المقصود بتحليل السياقات؟", "هو عرض الكلمة أو العبارة المستهدفة داخل مقاطعها المحيطة لدراسة الاستعمال والمعنى والأنماط المصاحبة."],
      ["كيف أفسر ظهور الكلمة في سياقات مختلفة؟", "صنّف السياقات بحسب المعنى أو الوظيفة أو الكلمات المصاحبة، ثم افحص تكرار كل نمط والاستثناءات قبل التعميم."],
      ["ما الفرق بين Concordance وFrequency؟", "Frequency يوضح عدد مرات الظهور، بينما Concordance يعرض مواضع الظهور وسياقها لتفسير كيفية استعمال الكلمة."],
      ["كيف أستخرج نمطًا لغويًا من السياقات؟", "ابحث عن عناصر تتكرر حول الكلمة، وصنّفها بمعيار واضح، ثم تحقّق من النمط عبر أمثلة متعددة لا مثال منفرد."],
    ],
    en: [
      ["What is context analysis?", "It displays a target word or phrase within its surrounding passages to examine usage, meaning, and recurring associations."],
      ["How do I interpret a word appearing in different contexts?", "Classify contexts by meaning, function, or accompanying words, then examine each pattern's frequency and exceptions before generalizing."],
      ["What is the difference between Concordance and Frequency?", "Frequency shows how often a word appears; Concordance shows where it appears and the surrounding context needed to interpret its use."],
      ["How do I identify a linguistic pattern from contexts?", "Look for recurring elements around the target, classify them using a clear criterion, and verify the pattern across several examples."],
    ],
  },
  ngrams: {
    routes: ["/tools/ngrams"],
    ar: [
      ["ما الفرق بين Bigrams وTrigrams؟", "الثنائيات (Bigrams) متتاليات من كلمتين، أما الثلاثيات (Trigrams) فتتكون من ثلاث كلمات متجاورة."],
      ["متى أستخدم الثنائيات ومتى الثلاثيات؟", "استخدم الثنائيات لاستكشاف الارتباطات الأقصر والأوسع، والثلاثيات عندما تحتاج إلى عبارات أكثر تحديدًا وبنية أوضح."],
      ["ماذا يعني تكرار متتالية لفظية؟", "يشير إلى تكرار اجتماع الكلمات بالترتيب نفسه، وقد يكشف عبارة ثابتة أو موضوعًا أو نمطًا أسلوبيًا يحتاج إلى فحص سياقي."],
      ["كيف أفسر N-grams بحثيًا؟", "قارن المتتاليات البارزة بين العينات، وافحص سياقاتها، ثم اربطها بالظاهرة المدروسة بدل تفسير العدد منفردًا."],
    ],
    en: [
      ["What is the difference between Bigrams and Trigrams?", "Bigrams are two-word sequences, while Trigrams contain three adjacent words."],
      ["When should I use Bigrams or Trigrams?", "Use Bigrams for broader, shorter associations and Trigrams when you need more specific phrases with clearer structure."],
      ["What does a recurring word sequence mean?", "It shows that words repeatedly occur in the same order and may indicate a fixed phrase, topic, or stylistic pattern that needs contextual review."],
      ["How do I interpret N-grams in research?", "Compare prominent sequences across samples, inspect their contexts, and connect them to the phenomenon rather than interpreting counts alone."],
    ],
  },
  pos: {
    routes: ["/tools/pos"],
    ar: [
      ["ما معنى POS؟", "هو اختصار لأقسام الكلام (Part-of-Speech)، أي تصنيف الكلمات نحويًا مثل الاسم والفعل والصفة."],
      ["ما الفائدة البحثية من تحليل أقسام الكلام؟", "يساعد على وصف البنية النحوية والأسلوب، ومقارنة استعمال الفئات بين نصوص أو أنواع خطاب مختلفة."],
      ["كيف أفسر توزيع الفئات النحوية؟", "اربط ارتفاع فئة أو انخفاضها بنوع النص ووظيفته، وقارنها بعينة مناسبة قبل نسبة الفرق إلى ظاهرة لغوية."],
      ["كيف أستخدم POS في مقارنة النصوص؟", "وحّد طريقة الوسم وحجم المقارنة، ثم قارن النسب المعيارية للفئات وراجع أمثلة فعلية من كل نص."],
    ],
    en: [
      ["What does POS mean?", "POS stands for Part-of-Speech: the grammatical classification of words, such as nouns, verbs, and adjectives."],
      ["What is the research value of POS analysis?", "It helps describe grammatical structure and style and compare category use across texts or discourse types."],
      ["How do I interpret grammatical-category distributions?", "Relate higher or lower proportions to text type and function, and compare against an appropriate sample before attributing differences to a linguistic phenomenon."],
      ["How can I use POS to compare texts?", "Keep tagging and comparison size consistent, compare normalized category proportions, and inspect real examples from each text."],
    ],
  },
  advisor: {
    routes: ["/research-advisor"],
    ar: [
      ["كيف أختار المنهج المناسب؟", "ابدأ بسؤال البحث ونوع الدليل المطلوب، ثم اختر المنهج الذي يربط البيانات وإجراءات التحليل بالاستنتاج الممكن بصورة واضحة."],
      ["ما الفرق بين Classification وCorpus Exploration؟", "التصنيف (Classification) يسند أمثلة إلى فئات محددة، أما استكشاف المدونة (Corpus Exploration) فيبحث عن أنماط دون اشتراط هدف تصنيفي."],
      ["كيف أحدد المتغيرات ووحدات التحليل؟", "عرّف ما ستقيسه بدقة، وحدّد هل الوحدة كلمة أو جملة أو وثيقة أو مشاركًا، واجعل الاختيار متسقًا مع سؤال البحث."],
      ["ما أهم القيود المنهجية؟", "راجع تمثيل العينة وجودة الوسوم وحجم البيانات وافتراضات الأداة وحدود التعميم، واذكر أثرها المحتمل في النتائج."],
    ],
    en: [
      ["How do I choose an appropriate method?", "Start with the research question and required evidence, then choose a method that clearly connects the data and analysis procedure to the possible conclusion."],
      ["What is the difference between Classification and Corpus Exploration?", "Classification assigns examples to defined categories; Corpus Exploration looks for patterns without requiring a classification target."],
      ["How do I define variables and units of analysis?", "Define exactly what you will measure and whether the unit is a word, sentence, document, or participant, keeping it aligned with the research question."],
      ["What are the main methodological limitations?", "Review sample representation, label quality, dataset size, tool assumptions, and limits on generalization, and state their likely effect on the findings."],
    ],
  },
  interpreter: {
    routes: [],
    ar: [
      ["ماذا يفعل مفسر النتائج؟", "يربط النتائج المتاحة بسؤال البحث ويقترح قراءة منهجية لها، لكنه لا يستبدل مراجعة الباحث للأدلة والسياق."],
      ["هل التفسير استنتاج نهائي؟", "لا. هو تفسير مساعد ينبغي التحقق منه مقابل البيانات والمنهج والأدبيات والبدائل التفسيرية."],
      ["كيف أتحقق من صحة تفسير AI؟", "راجع كل ادعاء مقابل النتيجة الأصلية، وابحث عن أمثلة مضادة، وقارن التفسير بالأدبيات وحدود تصميم الدراسة."],
      ["كيف أحول التفسير إلى فقرة بحثية؟", "ابدأ بالنتيجة الفعلية، ثم فسّر دلالتها بحذر، واربطها بسؤال البحث، واختم بالحدود أو الحاجة إلى دليل إضافي."],
    ],
    en: [
      ["What does the Research Interpreter do?", "It connects available results to the research question and suggests a methodological reading, but it does not replace the researcher's review of evidence and context."],
      ["Is the interpretation a final conclusion?", "No. It is supporting guidance that should be checked against the data, method, literature, and alternative explanations."],
      ["How do I verify an AI interpretation?", "Check every claim against the original result, seek counterexamples, and compare the interpretation with the literature and study-design limitations."],
      ["How do I turn an interpretation into a research paragraph?", "Begin with the actual finding, explain its significance cautiously, connect it to the research question, and end with limitations or the need for further evidence."],
    ],
  },
  report: {
    routes: ["/research-report"],
    ar: [
      ["كيف أقرأ الرسوم؟", "ابدأ بعنوان الرسم ومحاوره ومقياسه، ثم حدّد النمط الأبرز وقارنه بالقيم الفعلية قبل تفسير دلالته البحثية."],
      ["ما الفرق بين Summary وInterpretation؟", "الملخص (Summary) يصف أبرز النتائج، أما التفسير (Interpretation) فيناقش معناها وعلاقتها بسؤال البحث وحدودها."],
      ["ما معنى Macro-F1 أو Confusion Matrix؟", "درجة F1 الكلية (Macro-F1) توازن بين الدقة والاسترجاع عبر الفئات بالتساوي، ومصفوفة الالتباس توضح مواضع الصواب والخطأ بين الفئات."],
      ["كيف أختار بين Standard وVisual وDiagram؟", "استخدم Standard للتقرير المتكامل، وVisual للعرض السريع القائم على المؤشرات والرسوم، وDiagram عندما تتوفر مراحل أو بنية فعلية للمسار."],
    ],
    en: [
      ["How do I read the charts?", "Start with the title, axes, and scale, then identify the main pattern and check it against the actual values before interpreting its research significance."],
      ["What is the difference between Summary and Interpretation?", "The Summary describes the main findings; the Interpretation discusses their meaning, relationship to the research question, and limitations."],
      ["What do Macro-F1 and Confusion Matrix mean?", "Macro-F1 balances precision and recall equally across classes, while a Confusion Matrix shows correct and incorrect predictions between classes."],
      ["How do I choose Standard, Visual, or Diagram?", "Use Standard for a complete report, Visual for a quick metrics-and-charts view, and Diagram when real workflow stages or structure are available."],
    ],
  },
  prompt: {
    routes: ["/tools/prompt"],
    ar: [
      ["كيف أكتب Prompt بحثيًا جيدًا؟", "حدّد الهدف والسياق والمدخلات والمخرج المتوقع والقيود ومعيار الجودة بصياغة واضحة قابلة للمراجعة."],
      ["ما الفرق بين المهمة والسياق والتعليمات؟", "المهمة تحدد المطلوب، والسياق يوضح الخلفية والبيانات، والتعليمات تضبط طريقة التنفيذ وشكل النتيجة."],
      ["كيف أجعل الطلب أكثر دقة؟", "استخدم مصطلحات محددة، واذكر النطاق والاستثناءات وشكل المخرج، وتجنب الأهداف العامة التي لا يمكن التحقق منها."],
      ["متى أستخدم أمثلة داخل Prompt؟", "استخدم مثالًا عندما يصعب وصف التنسيق أو مستوى التفصيل، مع توضيح أنه نموذج لا حقيقة ينبغي نسخها."],
    ],
    en: [
      ["How do I write a strong research prompt?", "State the goal, context, inputs, expected output, constraints, and quality criterion in clear, reviewable terms."],
      ["What is the difference between task, context, and instructions?", "The task defines what to do, context supplies background and data, and instructions control the method and output format."],
      ["How can I make the request more precise?", "Use specific terms, state scope and exclusions, define the output format, and avoid broad goals that cannot be checked."],
      ["When should I include examples in a prompt?", "Use an example when format or detail is difficult to describe, and make clear that it is a model rather than a fact to copy."],
    ],
  },
  code: {
    routes: ["/tools/code"],
    ar: [
      ["ما الخوارزمية الأنسب لهذه المهمة؟", "يعتمد الاختيار على نوع المهمة والهدف وحجم البيانات وطبيعة المتغيرات؛ ابدأ بخط أساس بسيط ثم قارن البدائل بمعيار مناسب."],
      ["ما الفرق بين Logistic Regression وNaive Bayes؟", "الانحدار اللوجستي (Logistic Regression) يتعلم حدودًا تمييزية بين الفئات، بينما Naive Bayes نموذج احتمالي بسيط يفترض استقلال السمات شرطيًا."],
      ["ماذا يعني Train/Test split؟", "هو تقسيم البيانات إلى جزء لتدريب النموذج وجزء منفصل لتقييم أدائه على أمثلة لم يرها أثناء التدريب."],
      ["كيف أتحقق من ملاءمة الكود للبيانات؟", "راجع أسماء الأعمدة وأنواعها والقيم المفقودة وحجم العينة، ثم اختبر الكود تدريجيًا وتحقق من المخرجات ومقاييس التقييم."],
    ],
    en: [
      ["Which algorithm is best for this task?", "The choice depends on the task, objective, dataset size, and variable types; start with a simple baseline and compare alternatives using an appropriate metric."],
      ["What is the difference between Logistic Regression and Naive Bayes?", "Logistic Regression learns discriminative boundaries between classes, while Naive Bayes is a simple probabilistic model that assumes conditional feature independence."],
      ["What does Train/Test split mean?", "It divides data into one portion for training and a separate portion for evaluating performance on examples the model did not see during training."],
      ["How do I check whether the code fits my data?", "Review column names, types, missing values, and sample size, then test the code incrementally and verify outputs and evaluation metrics."],
    ],
  },
  spreadsheet: {
    routes: ["/tools/excel"],
    ar: [
      ["كيف أحدد عمود النص وعمود التصنيف؟", "اختر عمودًا يحتوي النص المراد تحليله، وعمودًا آخر يمثل الفئة المستهدفة إذا كانت المهمة تصنيفًا خاضعًا للإشراف."],
      ["ما معنى Missing Values؟", "هي خلايا لا تحتوي قيمة صالحة. افحص نسبتها وموقعها قبل تحديد الحذف أو التعويض أو إبقاء السجل."],
      ["كيف أعرف أن البيانات جاهزة للتحليل؟", "تحقق من وضوح العناوين واتساق الأنواع والقيم المفقودة والتكرارات وكفاية الصفوف وملاءمة الأعمدة لسؤال البحث."],
      ["ما الخطوة التالية بعد فحص الجدول؟", "حدّد هدف التحليل، ووثّق مشكلات الجودة، ثم انتقل إلى أداة التحليل أو أنشئ مهمة برمجية اعتمادًا على البنية الآمنة المتاحة."],
    ],
    en: [
      ["How do I identify the text and label columns?", "Choose a column containing the text to analyze and another representing the target class when the task is supervised classification."],
      ["What are Missing Values?", "They are cells without a valid value. Examine their proportion and location before deciding to remove, impute, or retain a record."],
      ["How do I know whether the data is ready for analysis?", "Check header clarity, type consistency, missing values, duplicates, row sufficiency, and whether the columns fit the research question."],
      ["What is the next step after inspecting the spreadsheet?", "Define the analysis goal, document quality issues, then continue to an analysis tool or create a coding task from the available safe structure."],
    ],
  },
  colab: {
    routes: ["/tools/colab"],
    ar: [
      ["كيف أشغّل الكود في Colab؟", "افتح دفتر Colab، والصق الكود بعد مراجعته، وثبّت المكتبات اللازمة، ثم شغّل الخلايا بالتسلسل."],
      ["أين أرفع البيانات؟", "ارفع الملف داخل جلسة Colab أو اربط Google Drive بإذن صريح، ثم حدّث مسار الملف في الكود."],
      ["ماذا أفعل عند ظهور خطأ؟", "اقرأ آخر رسالة خطأ، وحدّد الخلية والسطر، وتحقق من المكتبات ومسار الملف وأسماء الأعمدة قبل تعديل الكود."],
      ["كيف أحفظ النتائج؟", "احفظ الجداول أو الرسوم في ملفات داخل الجلسة ثم نزّلها أو احفظها في Drive، مع توثيق إعدادات التحليل."],
    ],
    en: [
      ["How do I run code in Colab?", "Open a Colab notebook, paste the code after reviewing it, install required libraries, and run cells in sequence."],
      ["Where do I upload the data?", "Upload the file to the Colab session or connect Google Drive with explicit permission, then update the file path in the code."],
      ["What should I do when an error appears?", "Read the final error message, identify the cell and line, and check libraries, file paths, and column names before changing the code."],
      ["How do I save the results?", "Save tables or charts as files in the session, then download them or store them in Drive while documenting the analysis settings."],
    ],
  },
  learn: {
    routes: ["/student-dashboard", "/intro", "/projects"],
    ar: [
      ["ما المسار المناسب لمستواي؟", "ابدأ بالمفاهيم الأساسية إذا كنت جديدًا، وانتقل إلى التطبيق عندما تستطيع تفسير المدخلات والمخرجات وحدود الأداة."],
      ["ما المفاهيم التي أحتاجها قبل التحليل؟", "تحتاج إلى فهم سؤال البحث والعينة ووحدة التحليل وجودة البيانات، ثم المفاهيم الخاصة بالأداة التي ستستخدمها."],
      ["ما الفرق بين تعلم الأداة واستخدامها بحثيًا؟", "تعلم الأداة يشرح تشغيلها، أما استخدامها بحثيًا فيتطلب تبرير الاختيار والتحقق من النتائج وربطها بالسؤال والمنهج."],
      ["ماذا أتعلم بعد هذه الوحدة؟", "اختر الوحدة التي تعالج المهارة التالية في مسارك: إعداد البيانات، أو التحليل، أو التفسير، أو كتابة النتائج."],
    ],
    en: [
      ["Which learning path suits my level?", "Start with foundations if you are new, and move to application when you can explain the tool's inputs, outputs, and limitations."],
      ["What concepts do I need before analysis?", "Understand the research question, sample, unit of analysis, and data quality, followed by the concepts specific to your chosen tool."],
      ["What is the difference between learning a tool and using it in research?", "Learning a tool explains operation; research use requires justifying the choice, validating results, and connecting them to the question and method."],
      ["What should I learn after this unit?", "Choose the unit addressing the next skill in your path: data preparation, analysis, interpretation, or reporting."],
    ],
  },
};

const routeIndex = Object.entries(guidance).reduce((index, [id, entry]) => {
  entry.routes.forEach((route) => { index[route] = id; });
  return index;
}, {});

const researchPathGuidance = {
  "corpus-linguistics": {
    ar: [
      ["هل يناسب مسار لسانيات المدونات سؤالي؟", "يناسب الأسئلة التي تبحث في التكرار والاستعمال والسياق والأنماط المتكررة داخل مجموعة نصوص."],
      ["متى أستخدم Frequency بدل Concordance؟", "استخدم Frequency لمعرفة حجم الحضور العددي، وConcordance لفحص كيفية استعمال الكلمة داخل سياقاتها الفعلية."],
      ["ما فائدة N-grams؟", "تكشف N-grams المتتاليات اللفظية المتكررة التي قد تشير إلى عبارات ثابتة أو أنماط أسلوبية تحتاج إلى تفسير سياقي."],
      ["كيف أقارن بين مدونتين؟", "وحّد طريقة الإعداد ومعيار العد، واستخدم تكرارًا معياريًا، ثم افحص الفروق في السياق قبل تفسيرها."],
    ],
    en: [
      ["Does Corpus Linguistics fit my question?", "It fits questions about frequency, usage, context, and recurring patterns within a collection of texts."],
      ["When should I use Frequency instead of Concordance?", "Use Frequency to measure numerical prominence and Concordance to inspect how a word is used in its actual contexts."],
      ["What are N-grams useful for?", "N-grams reveal recurring word sequences that may indicate fixed expressions or stylistic patterns requiring contextual interpretation."],
      ["How do I compare two corpora?", "Use consistent preparation and counting, normalize frequencies, and inspect contextual differences before interpreting them."],
    ],
  },
  "text-classification": {
    ar: [
      ["هل يناسب تصنيف النصوص سؤالي؟", "يناسب المسار عندما توجد فئات محددة وأمثلة موسومة وتريد اختبار إمكان التنبؤ بالفئة من النص."],
      ["متى أستخدم التصنيف؟", "استخدمه عندما يكون الهدف إسناد نصوص جديدة إلى فئات معروفة، لا عندما يكون الهدف استكشاف الأنماط دون فئات مسبقة."],
      ["ما الفرق بين Naive Bayes وبقية النماذج؟", "Naive Bayes خط أساس احتمالي بسيط وشفاف؛ تُقارن النماذج الأخرى به فقط عندما تتوفر بيانات وتقييم ملائمان."],
      ["ما معنى Evaluation Metrics؟", "هي مقاييس تصف أداء النموذج من جوانب مختلفة؛ اختر منها ما يناسب توازن الفئات وخطأ البحث الذي يهمك."],
    ],
    en: [
      ["Does Text Classification fit my question?", "It fits when defined classes and labeled examples exist and you want to test whether class membership can be predicted from text."],
      ["When should I use classification?", "Use it to assign new texts to known classes, not when the goal is open exploration without predefined labels."],
      ["How does Naive Bayes differ from other models?", "Naive Bayes is a simple, transparent probabilistic baseline; compare other models only when the data and evaluation design support it."],
      ["What do Evaluation Metrics mean?", "They describe different aspects of model performance; choose metrics that fit class balance and the research errors that matter."],
    ],
  },
  "morphology-syntax": {
    ar: [
      ["هل يناسب مسار الصرف والنحو سؤالي؟", "يناسب الأسئلة المتعلقة ببنية الكلمات ووظائفها النحوية والعلاقات التركيبية في النص."],
      ["ماذا يمكن أن يخبرني POS عن النص؟", "يصف توزيع أقسام الكلام، ويمكن أن يساعد في مقارنة الأسلوب والبنية النحوية بين النصوص."],
      ["ما الفرق بين التحليل الصرفي والنحوي؟", "التحليل الصرفي يدرس بنية الكلمة وسماتها، أما النحوي فيدرس وظائف الكلمات والعلاقات بينها في الجملة."],
      ["ما التقرير المتوقع من هذا المسار؟", "عند توفر نتائج فعلية، يمكن تنظيم توزيع الفئات النحوية والأنماط البارزة وحدود التحليل في تقرير."],
    ],
    en: [
      ["Does Morphology & Syntax fit my question?", "It fits questions about word structure, grammatical functions, and syntactic relations in text."],
      ["What can POS tell me about a text?", "It describes parts-of-speech distributions and can support comparisons of style and grammatical structure."],
      ["How do morphology and syntax differ?", "Morphology examines word structure and features; syntax examines word functions and relations within sentences."],
      ["What report can this path produce?", "When actual results exist, a report can organize grammatical distributions, prominent patterns, and analysis limitations."],
    ],
  },
  semantics: {
    ar: [
      ["ما الذي يدرسه مسار الدلالة؟", "يدرس المعنى والعلاقات بين المفاهيم وكيف يتغير المعنى باختلاف النص والسياق."],
      ["ما نوع البيانات التي أحتاجها؟", "تحتاج إلى نصوص مختارة وفق سؤال دلالي واضح ومعيار مقارنة يمكن تبريره."],
      ["ما الأدوات المتاحة الآن؟", "لا توجد أداة دلالية متخصصة في LinguaLab حاليًا؛ القدرات المعروضة تحت «قريبًا» ليست قابلة للتشغيل."],
      ["ما الخطوة التالية المناسبة؟", "صغ سؤال المعنى وحدد النصوص ووحدة المقارنة، ثم راقب القدرات القادمة دون تشغيل أداة غير موجودة."],
    ],
    en: [
      ["What does the Semantics path study?", "It studies meaning, relationships between concepts, and how meaning varies across text and context."],
      ["What data do I need?", "You need texts selected for a clear semantic question and a defensible comparison criterion."],
      ["Which tools are available now?", "LinguaLab has no dedicated semantics tool yet; capabilities marked Coming next are not runnable."],
      ["What is an appropriate next step?", "Define the meaning-focused question, texts, and comparison unit, then monitor upcoming capabilities without launching a nonexistent tool."],
    ],
  },
  "discourse-pragmatics": {
    ar: [
      ["ما الذي يدرسه مسار الخطاب والتداولية؟", "يدرس بناء المعنى والموقف والتأطير وعلاقة النص بسياق الاستعمال والجمهور."],
      ["ما نوع البيانات التي أحتاجها؟", "تحتاج إلى نصوص كاملة مع معلومات موثوقة عن النوع والمتحدث أو الموقف عند صلتها بالسؤال."],
      ["ما الأدوات المتاحة الآن؟", "لا توجد أداة متخصصة لهذا المسار حاليًا؛ عناصر «قريبًا» توضح اتجاه التطوير فقط."],
      ["ما الخطوة التالية المناسبة؟", "حدّد الظاهرة الخطابية وسياقها ووحدة التحليل قبل انتظار أداة متخصصة."],
    ],
    en: [
      ["What does Discourse & Pragmatics study?", "It studies meaning, stance, framing, and the relationship between text, usage context, and audience."],
      ["What data do I need?", "You need complete texts with reliable genre, speaker, or situational metadata when relevant to the question."],
      ["Which tools are available now?", "No dedicated tool is currently available for this path; Coming next items describe direction only."],
      ["What is an appropriate next step?", "Define the discourse phenomenon, its context, and the unit of analysis before using a future specialized tool."],
    ],
  },
  "information-extraction": {
    ar: [
      ["ما الذي يدرسه مسار استخراج المعلومات؟", "يحوّل عناصر محددة في النص، مثل الكيانات أو المصطلحات، إلى بيانات منظمة قابلة للمراجعة."],
      ["ما نوع البيانات التي أحتاجها؟", "تحتاج إلى نصوص وتعريف واضح لما تريد استخراجه ومعيار للتحقق من صحة الاستخراج."],
      ["ما الأدوات المتاحة الآن؟", "لا توجد أداة استخراج متخصصة حاليًا؛ لا يمكن تشغيل القدرات المدرجة تحت «قريبًا»."],
      ["ما الخطوة التالية المناسبة؟", "عرّف فئات الاستخراج وأمثلة الترميز ومعيار التقييم استعدادًا لقدرة متخصصة لاحقًا."],
    ],
    en: [
      ["What does Information Extraction study?", "It converts defined elements in text, such as entities or terms, into structured, reviewable data."],
      ["What data do I need?", "You need texts, a clear definition of what to extract, and a criterion for checking extraction accuracy."],
      ["Which tools are available now?", "No dedicated extraction tool is currently available; Coming next capabilities cannot be launched."],
      ["What is an appropriate next step?", "Define extraction categories, annotation examples, and an evaluation criterion in preparation for a future specialized capability."],
    ],
  },
  "language-technology": {
    ar: [
      ["هل يناسب مسار تقنيات اللغة وتجارب NLP مهمتي؟", "يناسب إعداد البيانات وبناء شفرة قابلة للمراجعة وتشغيل تجربة لغوية قابلة لإعادة الإنتاج."],
      ["متى أستخدم Spreadsheet Explorer؟", "استخدمه لفهم بنية الجدول وأسماء الأعمدة وحجمه قبل صياغة مهمة برمجية، دون نقل محتوى الخلايا."],
      ["كيف أنتقل من البيانات إلى الكود؟", "راجع بنية البيانات، وحدد المهمة والمخرج المتوقع، ثم أنشئ الشفرة وراجعها قبل التشغيل."],
      ["متى أحتاج Colab؟", "استخدم Colab بعد مراجعة الشفرة عندما تحتاج إلى بيئة دفتر لتشغيل التجربة وتوثيق خطواتها."],
    ],
    en: [
      ["Does Language Technology & NLP Experiments fit my task?", "It fits data preparation, reviewable code construction, and reproducible language-technology experiments."],
      ["When should I use Spreadsheet Explorer?", "Use it to inspect spreadsheet structure, headers, and size before defining a coding task, without transferring cell contents."],
      ["How do I move from data to code?", "Review the data structure, define the task and expected output, then generate and review code before execution."],
      ["When do I need Colab?", "Use Colab after reviewing the code when you need a notebook environment to run and document the experiment."],
    ],
  },
};

const technicalTerms = Object.freeze({
  analyze: ["TF-IDF", "Baseline"],
  ngrams: ["N-grams", "Bigrams", "Trigrams"],
  pos: ["POS"],
  advisor: ["Classification", "Corpus Exploration"],
  report: ["Macro-F1", "Confusion Matrix"],
  code: ["Logistic Regression", "Naive Bayes", "Train/Test split"],
  "text-classification": ["Naive Bayes", "Evaluation Metrics"],
});

function applyLevel(answer, level, locale) {
  if (level === "advanced") {
    return locale === "ar"
      ? `${answer} تحقّق من الافتراضات وحدود العينة، واستخدم مقارنة أو مقياسًا مناسبًا عند الصلة. الخطوة المتقدمة التالية: قارن النتيجة بخط أساس أو عينة أخرى.`
      : `${answer} Check assumptions and sample limitations, and use an appropriate comparison or metric where relevant. Advanced next step: compare the result with a baseline or another sample.`;
  }
  return locale === "ar"
    ? `ببساطة: ${answer} مثال قصير: طبّق الفكرة على عينة صغيرة واضحة. الخطوة التالية: راجع نتيجة واحدة قبل الانتقال.`
    : `In simple terms: ${answer} Short example: apply the idea to one small, clear sample. Next step: review one result before continuing.`;
}

export function getAssistantGuidance(pathname, language, options = {}) {
  const baseContextId = options.mode === "copilot" ? "copilot" : routeIndex[pathname];
  const pathEntry = researchPathGuidance[options.pathId];
  const contextId = pathEntry ? `${baseContextId || "research"}:${options.pathId}` : baseContextId;
  if (!contextId) return null;
  const locale = language === "ar" ? "ar" : "en";
  const level = options.level === "advanced" ? "advanced" : "beginner";
  const source = pathEntry ? pathEntry[locale] : guidance[baseContextId][locale];
  return {
    contextId,
    level,
    pathId: pathEntry ? options.pathId : null,
    technicalTerms: technicalTerms[options.pathId] || technicalTerms[baseContextId] || [],
    suggestions: source.map(([question, answer], index) => ({
      id: `${contextId}-${index + 1}`,
      question,
      answer: applyLevel(answer, level, locale),
    })),
  };
}

export const ASSISTANT_ROUTES = Object.freeze(Object.keys(routeIndex));
export const ASSISTANT_RESEARCH_PATHS = Object.freeze(Object.keys(researchPathGuidance));
