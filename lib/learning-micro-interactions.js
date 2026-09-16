const bi = (en, ar) => Object.freeze({ en, ar });

const option = (en, ar, correct, feedbackEn, feedbackAr) => Object.freeze({
  label: bi(en, ar),
  correct,
  feedback: bi(feedbackEn, feedbackAr),
});

export const LEARNING_MICRO_INTERACTIONS = Object.freeze({
  "text-analysis": Object.freeze([
    Object.freeze({
      id: "computer-view",
      type: "reveal",
      title: bi("Inspect how the computer sees a sentence", "افحص كيف يرى الحاسوب الجملة"),
      prompt: bi("Follow one Arabic sentence from its written form to observable computational units.", "تتبّع جملة عربية من صورتها المكتوبة إلى وحدات حاسوبية قابلة للملاحظة."),
      steps: [
        { label: bi("Full text", "النص الكامل"), value: bi("زار خالد جامعة الملك سعود في الرياض.", "زار خالد جامعة الملك سعود في الرياض.") },
        { label: bi("Sentence", "الجملة"), value: bi("One sentence bounded here by a full stop.", "جملة واحدة تحدّها هنا علامة النقطة.") },
        { label: bi("Surface tokens", "الكلمات / Tokens"), value: bi("زار · خالد · جامعة · الملك · سعود · في · الرياض", "زار · خالد · جامعة · الملك · سعود · في · الرياض") },
        { label: bi("Countable units", "وحدات قابلة للعد"), value: bi("7 surface tokens under this simple punctuation-and-space rule.", "7 رموز سطحية وفق قاعدة الفصل البسيطة بالمسافات وعلامة الترقيم هنا.") },
        { label: bi("Observable patterns", "أنماط قابلة للملاحظة"), value: bi("Positions, counts, and short sequences can now be inspected; meaning has not been inferred automatically.", "يمكن الآن فحص المواقع والأعداد والتتابعات القصيرة؛ ولم يُستنتج المعنى آليًا.") },
      ],
      note: bi("This is one declared representation, not a universal Arabic tokenization. Normalization and attached particles can change the units.", "هذا تمثيل واحد معلن، وليس تجزئة ثابتة لكل العربية؛ فقد تغيّر قرارات التطبيع واللواصق الوحدات الناتجة."),
    }),
    Object.freeze({
      id: "unit-choice",
      type: "choice-set",
      title: bi("Choose the useful unit of analysis", "اختر وحدة التحليل المفيدة"),
      prompt: bi("The useful unit changes with the research question. Try both scenarios.", "تتغير الوحدة المفيدة بتغيّر السؤال البحثي. جرّب الحالتين."),
      scenarios: [
        {
          question: bi("I want to find the most frequent words in a collection of comments. Which unit is most useful at this step?", "أريد معرفة أكثر الكلمات تكرارًا في مجموعة من التعليقات. ما وحدة التحليل الأكثر فائدة في هذه الخطوة؟"),
          options: [
            option("Document", "الوثيقة", false, "A document may organize the collection, but the elements being counted here are lexical units.", "قد تنظّم الوثيقة المجموعة، لكن العناصر المراد عدّها هنا وحدات معجمية."),
            option("Sentence", "الجملة", false, "A sentence is useful for local context, but this question asks for word counts.", "تفيد الجملة في السياق المحلي، لكن هذا السؤال يطلب عدّ الكلمات."),
            option("Word / token", "الكلمة / Token", true, "Appropriate: the question asks to count recurring lexical units, so surface tokens are a useful declared unit.", "اختيار مناسب؛ لأن السؤال يطلب عدّ الوحدات المعجمية، فتكون الكلمة/الرمز السطحي وحدة مفيدة ومعلنة."),
            option("Character", "الحرف", false, "Characters answer spelling or character-distribution questions, not this lexical-frequency question.", "تفيد الحروف في أسئلة الرسم أو توزيع المحارف، لا في سؤال التكرار المعجمي هنا."),
          ],
        },
        {
          question: bi("I want to assign one topic label to each news article. Which unit carries the label?", "أريد إسناد تصنيف موضوعي واحد إلى كل مقالة إخبارية. ما الوحدة التي تحمل التصنيف؟"),
          options: [
            option("Document", "الوثيقة", true, "Appropriate: each complete article is the item receiving one topic label.", "اختيار مناسب؛ فكل مقالة كاملة هي العنصر الذي يتلقى تصنيفًا موضوعيًا واحدًا."),
            option("Sentence", "الجملة", false, "Sentence-level classification is possible for another question, but the stated label belongs to the whole article.", "يمكن تصنيف الجمل في سؤال آخر، لكن التصنيف المذكور هنا يعود إلى المقالة كاملة."),
            option("Word / token", "الكلمة / Token", false, "Individual words contribute evidence, but they are not the labeled item in this scenario.", "قد تقدم الكلمات أدلة، لكنها ليست العنصر المصنّف في هذه الحالة."),
            option("Character", "الحرف", false, "Characters are too fine-grained for the requested article-level label.", "الحروف وحدة أدق من مستوى التصنيف المطلوب للمقالة."),
          ],
        },
      ],
    }),
    Object.freeze({
      id: "frequency-prediction",
      type: "prediction",
      title: bi("Predict, then inspect frequency", "توقّع ثم افحص التكرار"),
      prompt: bi("In «البحث يحتاج إلى دليل، والدليل يدعم البحث», which meaningful surface word will have the highest count after removing punctuation and normalizing only the attached و in والدليل?", "في «البحث يحتاج إلى دليل، والدليل يدعم البحث»، ما الكلمة السطحية ذات أعلى تكرار بعد إزالة الترقيم وتطبيع الواو الملحقة في «والدليل» فقط؟"),
      options: [bi("البحث", "البحث"), bi("دليل / الدليل", "دليل / الدليل"), bi("يحتاج", "يحتاج")],
      correctIndex: 0,
      result: bi("البحث = 2 · الدليل = 2 only if دليل and الدليل are additionally normalized as one lexical form; under the declared rule here, البحث alone has count 2.", "البحث = 2. أما «دليل» و«الدليل» فلا تصبحان وحدة واحدة إلا بقرار تطبيع إضافي؛ ووفق القاعدة المعلنة هنا ينفرد «البحث» بالعدد 2."),
      explanation: bi("The count depends on declared preparation choices. Frequency records an observable recurrence; it does not by itself explain importance, intent, or causation.", "يعتمد العد على قرارات الإعداد المعلنة. يسجل التكرار ملاحظة قابلة للرصد، لكنه لا يفسّر وحده الأهمية أو القصد أو السببية."),
    }),
    Object.freeze({
      id: "analysis-family",
      type: "choice-set",
      title: bi("Select the analysis family", "اختر عائلة التحليل"),
      prompt: bi("Match each goal to a method family. This selects a deeper task; it does not execute it.", "طابق كل هدف مع عائلة المنهج المناسبة. هذا اختيار لمهمة أعمق، وليس تنفيذًا لها."),
      scenarios: [
        { question: bi("Which words are most common?", "ما الكلمات الأكثر شيوعًا؟"), options: [option("Frequency", "التكرار", true, "Frequency directly observes recurring units.", "يرصد التكرار الوحدات المتكررة مباشرة."), option("Named Entity Recognition", "استخراج الكيانات المسماة", false, "NER identifies named people, places, or organizations rather than general word frequency.", "يحدد استخراج الكيانات الأشخاص والأماكن والمؤسسات المسماة، لا شيوع الكلمات عمومًا."), option("Sentiment classification", "تصنيف المشاعر", false, "Sentiment assigns evaluative labels and requires a separately defined task.", "يسند تصنيف المشاعر فئات تقويمية ويحتاج إلى مهمة مستقلة محددة.")] },
        { question: bi("Which people and places are mentioned?", "ما أسماء الأشخاص والأماكن المذكورة؟"), options: [option("Frequency", "التكرار", false, "Counts do not determine whether a form is a person or a place.", "لا تحدد الأعداد ما إذا كانت الصيغة شخصًا أو مكانًا."), option("Named Entity Recognition", "استخراج الكيانات المسماة", true, "NER is designed to identify and categorize named mentions, with suitable annotation and evaluation.", "صُمم استخراج الكيانات لتحديد الإشارات المسماة وتصنيفها، مع وسم وتقييم مناسبين."), option("Dependency analysis", "تحليل الاعتماد النحوي", false, "Dependency analysis studies syntactic relations, not named-entity categories.", "يدرس تحليل الاعتماد العلاقات النحوية، لا فئات الكيانات المسماة.")] },
        { question: bi("Are the comments positive or negative?", "هل التعليقات إيجابية أم سلبية؟"), options: [option("Sentiment classification", "تصنيف المشاعر", true, "This is a predefined-label classification task and needs suitable labeled evidence and evaluation.", "هذه مهمة تصنيف إلى فئات محددة مسبقًا، وتحتاج إلى أدلة موسومة وتقييم مناسبين."), option("Frequency", "التكرار", false, "Frequent words may inform inspection but do not establish sentiment labels.", "قد تساعد الكلمات المتكررة في الفحص، لكنها لا تثبت تصنيفات المشاعر."), option("Named Entity Recognition", "استخراج الكيانات المسماة", false, "Named entities answer a different extraction question.", "يجيب استخراج الكيانات عن سؤال استخراجي مختلف.")] },
        { question: bi("What syntactic relations connect the words?", "ما العلاقات النحوية التي تربط الكلمات؟"), options: [option("Dependency analysis", "تحليل الاعتماد النحوي", true, "Dependency analysis represents syntactic relations between tokens, subject to an annotation scheme.", "يمثل تحليل الاعتماد العلاقات النحوية بين الرموز وفق مخطط وسم محدد."), option("Sentiment classification", "تصنيف المشاعر", false, "Sentiment does not describe syntactic dependencies.", "لا يصف تصنيف المشاعر علاقات الاعتماد النحوي."), option("Frequency", "التكرار", false, "Counts observe recurrence, not grammatical relations.", "ترصد الأعداد التكرار، لا العلاقات النحوية.")] },
      ],
    }),
  ]),

  "prompt-practice": Object.freeze([
    Object.freeze({
      id: "weak-prompt",
      type: "multi-select",
      title: bi("Inspect a weak instruction", "افحص تعليمة ضعيفة"),
      prompt: bi("Weak instruction: «حلل هذا النص.» What is missing? Select all useful diagnoses before revealing the improved version.", "التعليمة الضعيفة: «حلل هذا النص.» ما الذي ينقصها؟ اختر كل التشخيصات المفيدة قبل كشف الصياغة المحسّنة."),
      options: [
        option("A specific task", "مهمة محددة", true, "The verb “analyze” does not identify the observable operation.", "لا يحدد فعل «حلّل» العملية القابلة للملاحظة."),
        option("Input or evidence boundary", "حدود المدخل أو الدليل", true, "The instruction does not say what text or evidence may be used.", "لا تحدد التعليمة النص أو الدليل الذي يجوز استخدامه."),
        option("Expected output", "شكل المخرج المتوقع", true, "A reviewable structure or output is not stated.", "لم يُذكر شكل مخرج أو بنية قابلة للمراجعة."),
        option("More decorative adjectives", "مزيد من الصفات الإنشائية", false, "Decorative wording does not make the task operationally clearer.", "لا تجعل الصياغة الإنشائية المهمة أوضح من الناحية الإجرائية."),
      ],
      success: bi("Improved: «حدّد ثلاثة مصطلحات متكررة في الفقرة العربية المقدمة، واستشهد بصيغتها الأصلية، واشرح قيدًا واحدًا، ولا تضف حقائق خارجية.» It states the task, evidence boundary, output, and constraint.", "الصياغة المحسّنة: «حدّد ثلاثة مصطلحات متكررة في الفقرة العربية المقدمة، واستشهد بصيغتها الأصلية، واشرح قيدًا واحدًا، ولا تضف حقائق خارجية.» فهي تحدد المهمة وحدود الدليل والمخرج والقيد."),
    }),
    Object.freeze({
      id: "instruction-components",
      type: "multi-select",
      title: bi("Build the instruction components", "ابنِ مكوّنات التعليمة"),
      prompt: bi("For a beginner explanation of one Arabic root-and-pattern example, which components improve clarity? Multiple valid formulations remain possible.", "لشرح مثال واحد على الجذر والوزن لمتعلم مبتدئ، ما المكوّنات التي تحسن الوضوح؟ تظل صيغ متعددة صحيحة ممكنة."),
      options: [
        option("Goal: explain the root–pattern relation", "الهدف: شرح علاقة الجذر بالوزن", true, "This names one bounded concept.", "يحدد هذا مفهومًا واحدًا منضبطًا."),
        option("Context: beginner learner", "السياق: متعلم مبتدئ", true, "Audience context calibrates terminology and detail.", "يساعد سياق الجمهور في ضبط المصطلحات والتفصيل."),
        option("Input: one supplied Arabic example", "المدخل: مثال عربي واحد مقدم", true, "A supplied example establishes the evidence boundary.", "يحدد المثال المقدم حدود الدليل."),
        option("Output: three short steps and one caution", "المخرج: ثلاث خطوات قصيرة وتنبيه واحد", true, "A checkable output structure makes review easier.", "تجعل بنية المخرج القابلة للفحص المراجعة أسهل."),
        option("Invent an authoritative source", "اختلاق مصدر موثوق", false, "A prompt must not request fabricated evidence.", "يجب ألا تطلب التعليمة اختلاق دليل أو مصدر."),
      ],
      success: bi("These components can be ordered in more than one legitimate way. Their value comes from defining purpose, context, evidence, and a reviewable result—not from enforcing one universal formula.", "يمكن ترتيب هذه المكوّنات بأكثر من طريقة مشروعة. وتأتي قيمتها من تحديد الغرض والسياق والدليل والنتيجة القابلة للمراجعة، لا من فرض قالب عالمي واحد."),
    }),
    Object.freeze({
      id: "compare-prompts",
      type: "choice-set",
      title: bi("Which prompt is clearer—and why?", "أي التعليمات أوضح؟ ولماذا؟"),
      prompt: bi("Clarity is not the same as length. Choose the most operational version.", "الوضوح لا يساوي الطول. اختر الصياغة الأكثر قابلية للتنفيذ والمراجعة."),
      scenarios: [{
        question: bi("You need a source-grounded summary of one supplied paragraph.", "تحتاج إلى تلخيص مستند إلى فقرة واحدة مقدمة."),
        options: [
          option("Summarize this beautifully and comprehensively.", "لخّص هذا النص بصورة جميلة وشاملة.", false, "It leaves the evidence boundary and output expectations ambiguous.", "تترك حدود الدليل وتوقعات المخرج غامضة."),
          option("In three bullets, summarize only the supplied paragraph and mark any claim that cannot be supported from it.", "لخّص الفقرة المقدمة فقط في ثلاث نقاط، وميّز أي ادعاء لا يمكن دعمه منها.", true, "This version is bounded, specific, and reviewable without being needlessly long.", "هذه الصياغة منضبطة ومحددة وقابلة للمراجعة من دون إطالة غير لازمة."),
          option("Write a very long expert analysis with every possible detail.", "اكتب تحليلًا خبيرًا طويلًا جدًا يتضمن كل تفصيل ممكن.", false, "Length does not supply the missing evidence boundary or a checkable goal.", "لا يعوض الطول غياب حدود الدليل أو الهدف القابل للفحص."),
        ],
      }],
    }),
    Object.freeze({
      id: "improve-prompt",
      type: "choice-set",
      title: bi("Improve one weak instruction", "حسّن تعليمة ضعيفة"),
      prompt: bi("Improve «اشرح الصرف العربي» through two bounded decisions. This is guided practice, not prompt generation.", "حسّن «اشرح الصرف العربي» عبر قرارين منضبطين. هذا تدريب موجّه وليس توليدًا للتعليمات."),
      scenarios: [
        { question: bi("First, narrow the task.", "أولًا: اضبط نطاق المهمة."), options: [option("Explain one root–pattern relation using the supplied word", "اشرح علاقة واحدة بين الجذر والوزن باستخدام الكلمة المقدمة", true, "This turns a broad field into one teachable task.", "تحوّل هذه الصياغة المجال الواسع إلى مهمة تعليمية واحدة."), option("Explain all Arabic morphology", "اشرح الصرف العربي كله", false, "The scope is still too broad to review meaningfully.", "ما يزال النطاق واسعًا إلى درجة تعيق المراجعة المفيدة.")] },
        { question: bi("Then, make the output reviewable.", "ثم اجعل المخرج قابلًا للمراجعة."), options: [option("Use three steps, cite the supplied form, and state one limitation", "استخدم ثلاث خطوات، واستشهد بالصيغة المقدمة، واذكر قيدًا واحدًا", true, "The output now has evidence, structure, and an explicit caution.", "أصبح للمخرج دليل وبنية وتنبيه صريح."), option("Be creative", "كن مبدعًا", false, "This preference does not define evidence or a checkable output.", "لا تحدد هذه الرغبة دليلًا أو مخرجًا قابلًا للفحص.")] },
      ],
    }),
  ]),

  "code-learning": Object.freeze([
    Object.freeze({
      id: "rule-to-code",
      type: "reveal",
      title: bi("Trace a rule into code", "تتبّع القاعدة حتى الشفرة"),
      prompt: bi("Reveal the same small requirement at four representation levels.", "اكشف المتطلب الصغير نفسه عبر أربعة مستويات من التمثيل."),
      steps: [
        { label: bi("Plain-language rule", "المتطلب بلغة طبيعية"), value: bi("If the text value is empty, do not process it.", "إذا كانت القيمة النصية فارغة، فلا تعالجها.") },
        { label: bi("Logical condition", "الشرط المنطقي"), value: bi("IF text is empty THEN skip", "إذا كان النص فارغًا ← تجاوز المعالجة"), code: true },
        { label: bi("Pseudocode", "الشفرة الكاذبة"), value: bi("IF NOT text:\n    SKIP", "IF NOT text:\n    SKIP"), code: true },
        { label: bi("Python", "Python"), value: bi("if not text:\n    continue", "if not text:\n    continue"), code: true },
      ],
      note: bi("The Python condition tests whether a value is empty. It does not interpret Arabic grammar.", "يختبر شرط Python فراغ القيمة؛ ولا يفسر النحو العربي."),
    }),
    Object.freeze({
      id: "predict-output",
      type: "prediction",
      title: bi("Predict the output", "توقّع المخرج"),
      prompt: bi("What value does this expression return under whitespace splitting?", "ما القيمة التي يعيدها هذا التعبير عند الفصل بالمسافات؟"),
      codeSample: "len('لغة عربية'.split())",
      options: [bi("2", "2"), bi("8", "8"), bi("The grammatical number of words", "العدد النحوي للكلمات")],
      correctIndex: 0,
      result: bi("Result: 2", "الناتج: 2"),
      explanation: bi("`split()` applies a surface string operation here. It does not segment attached Arabic clitics or understand linguistic wordhood.", "تنفّذ `split()` هنا عملية سطحية على السلسلة النصية؛ ولا تفصل اللواصق العربية ولا تفهم مفهوم الكلمة لغويًا."),
      code: true,
    }),
    Object.freeze({
      id: "explain-code",
      type: "code-explorer",
      title: bi("Explain the code line by line", "فسّر الشفرة سطرًا سطرًا"),
      prompt: bi("Select a line to connect its code operation with the corresponding data concept.", "اختر سطرًا لربط عمليته البرمجية بمفهوم البيانات المقابل."),
      lines: [
        { code: "text = 'لغة عربية'", explanation: bi("Stores a Unicode text string. This is data storage, not linguistic analysis.", "يخزّن سلسلة نصية بترميز Unicode. هذه عملية تخزين بيانات وليست تحليلًا لغويًا.") },
        { code: "tokens = text.split()", explanation: bi("Splits on whitespace into surface tokens. The declared rule is simple and may not fit every Arabic task.", "يفصل النص بالمسافات إلى رموز سطحية. القاعدة المعلنة بسيطة وقد لا تناسب كل مهمة عربية.") },
        { code: "count = len(tokens)", explanation: bi("Counts the resulting list items; it does not decide whether they are linguistically correct words.", "يعدّ عناصر القائمة الناتجة؛ ولا يقرر ما إذا كانت كلمات صحيحة من منظور لغوي.") },
      ],
    }),
    Object.freeze({
      id: "missing-pipeline-step",
      type: "choice-set",
      title: bi("Find the missing pipeline step", "اعثر على الخطوة الناقصة"),
      prompt: bi("Choose the operation that makes each tiny pipeline explicit.", "اختر العملية التي تجعل كل خط معالجة صغير واضحًا."),
      scenarios: [
        { question: bi("Arabic text → ? → count tokens → result", "نص عربي ← ؟ ← عدّ الرموز ← النتيجة"), options: [option("Tokenization", "التجزئة / Tokenization", true, "The count needs a declared sequence of tokens first.", "يحتاج العد أولًا إلى تتابع رموز وفق قاعدة معلنة."), option("Sentiment prediction", "توقع المشاعر", false, "Sentiment is a different modeled task, not the missing preparation step.", "المشاعر مهمة نمذجة مختلفة، وليست خطوة الإعداد الناقصة.")] },
        { question: bi("Text containing أ/إ variants → ? → compare normalized forms", "نص يحتوي صيغتي أ/إ ← ؟ ← مقارنة الصيغ المطبّعة"), options: [option("A declared normalization rule", "قاعدة تطبيع معلنة", true, "Normalization may align selected orthographic variants, but the chosen rule must be documented.", "قد يوحّد التطبيع تنويعات رسمية مختارة، لكن يجب توثيق القاعدة المستخدمة."), option("Python automatically understands equivalence", "يفهم Python التكافؤ تلقائيًا", false, "Python compares encoded strings unless an explicit transformation is implemented.", "يقارن Python السلاسل المرمّزة ما لم تُنفّذ عملية تحويل صريحة.")] },
      ],
    }),
    Object.freeze({
      id: "placeholder-awareness",
      type: "choice-set",
      title: bi("Identify a placeholder", "ميّز الدالة النائبة"),
      prompt: bi("Never assume a plausible function name is already implemented.", "لا تفترض أن اسم الدالة المعقول يعني أنها منفّذة فعلًا."),
      scenarios: [{
        question: bi("What is this function unless the lesson defines or imports it?", "ما طبيعة هذه الدالة ما لم يعرّفها الدرس أو يستوردها؟"),
        codeSample: "result = analyze_morphology(text)",
        options: [option("A placeholder or external dependency that must be implemented or documented", "دالة نائبة أو تبعية خارجية يجب تنفيذها أو توثيقها", true, "Correct: Python does not natively provide Arabic morphological interpretation under this name.", "صحيح؛ لا يقدم Python تفسيرًا صرفيًا عربيًا أصيلًا بهذا الاسم."), option("A built-in Python Arabic grammar engine", "محرك نحو عربي مدمج في Python", false, "Python has no native Arabic grammar engine under this function name.", "لا يحتوي Python محرك نحو عربيًا أصيلًا بهذا الاسم.")] },
      ],
    }),
  ]),

  "data-learning": Object.freeze([
    Object.freeze({
      id: "mini-table",
      type: "table-inspection",
      title: bi("Inspect a tiny research table", "افحص جدولًا بحثيًا صغيرًا"),
      prompt: bi("Select every issue that is actually supported by the rows. Repeated labels alone are not duplicate records.", "اختر كل مشكلة تدعمها الصفوف فعلًا. تكرار التصنيف وحده لا يعني تكرار السجلات."),
      columns: [bi("id", "المعرّف"), bi("text", "النص"), bi("label", "التصنيف"), bi("date", "التاريخ")],
      rows: [
        ["1", "الخدمة واضحة", "إيجابي", "2026-01-02"],
        ["2", "", "سلبي", "2026-01-03"],
        ["3", "التطبيق مفيد", "إيجابي", "2026-01-04"],
        ["3", "التطبيق مفيد", "إيجابي", "2026-01-04"],
        ["5", "الدعم بطيء", "negative", "2026-01-05"],
      ],
      options: [
        option("Row 2 has missing text", "النص مفقود في الصف 2", true, "The text field is empty, so this row cannot support text analysis until reviewed.", "حقل النص فارغ؛ لذلك لا يدعم الصف تحليل النص قبل مراجعته."),
        option("Rows 3 and 4 are exact duplicates", "الصفان 3 و4 متكرران تمامًا", true, "All displayed fields match, so the duplicate should be marked for review.", "تتطابق جميع الحقول المعروضة، لذلك ينبغي تعليم التكرار للمراجعة."),
        option("The label `negative` is inconsistent with the Arabic label scheme", "التصنيف `negative` غير متسق مع نظام التصنيفات العربية", true, "The category may be valid, but its representation is inconsistent and needs normalization or confirmation.", "قد تكون الفئة صحيحة، لكن تمثيلها غير متسق ويحتاج إلى توحيد أو تحقق."),
        option("Every repeated `إيجابي` label is a duplicate", "كل تكرار لتصنيف «إيجابي» سجل مكرر", false, "Different records can legitimately share the same label.", "يمكن لسجلات مختلفة أن تشترك بصورة مشروعة في التصنيف نفسه."),
      ],
      success: bi("Educational cleaning would mark the empty text and exact duplicate for review, then standardize the confirmed label representation. It would not silently invent missing text or delete legitimate repeated labels.", "ينبغي في التنظيف التعليمي تعليم النص الفارغ والتكرار التام للمراجعة، ثم توحيد تمثيل التصنيف بعد التحقق. ولا يجوز اختلاق نص مفقود أو حذف تكرارات مشروعة للتصنيف.")
    }),
    Object.freeze({
      id: "issue-types",
      type: "choice-set",
      title: bi("Classify data-quality cases", "صنّف حالات جودة البيانات"),
      prompt: bi("Distinguish absence, duplication, legitimate repetition, and inconsistent representation.", "ميّز الغياب والتكرار والتكرار المشروع وعدم اتساق التمثيل."),
      scenarios: [
        { question: bi("A text cell is empty.", "خلية النص فارغة."), options: [option("Missing value", "قيمة مفقودة", true, "No text value is present in the required field.", "لا توجد قيمة نصية في الحقل المطلوب."), option("Duplicate record", "سجل مكرر", false, "Duplication requires comparison with another record.", "يتطلب التكرار مقارنة بسجل آخر.")] },
        { question: bi("Two rows match in every relevant displayed field.", "صفان متطابقان في كل حقل معروض ذي صلة."), options: [option("Exact duplicate", "تكرار تام", true, "The full relevant record is repeated.", "تكرر السجل الكامل ذي الصلة."), option("Valid repeated value", "قيمة متكررة مشروعة", false, "A repeated single value may be valid, but here the full rows match.", "قد يكون تكرار قيمة واحدة مشروعًا، لكن الصفين كاملين متطابقان هنا.")] },
        { question: bi("Different texts both have the label `إيجابي`.", "نصان مختلفان يحملان التصنيف «إيجابي»."), options: [option("Valid repeated label", "تصنيف متكرر مشروع", true, "Several observations may share one category without being duplicate records.", "قد تشترك ملاحظات متعددة في فئة واحدة من دون أن تكون سجلات مكررة."), option("Exact duplicate", "تكرار تام", false, "A shared label alone does not make records identical.", "لا يجعل التصنيف المشترك السجلات متطابقة.")] },
        { question: bi("The same class appears as `سلبي` and `negative`.", "تظهر الفئة نفسها بصيغتي «سلبي» و`negative`."), options: [option("Inconsistent category representation", "تمثيل غير متسق للفئة", true, "The values need confirmation and a documented normalization decision.", "تحتاج القيم إلى تحقق وقرار تطبيع موثق."), option("Missing value", "قيمة مفقودة", false, "Both cells contain values; the problem is consistency.", "تحتوي الخليتان قيمًا؛ والمشكلة في الاتساق.")] },
      ],
    }),
    Object.freeze({
      id: "column-roles",
      type: "choice-set",
      title: bi("Identify text and label columns", "حدّد عمودي النص والتصنيف"),
      prompt: bi("Column names suggest roles, but the researcher must still inspect their contents.", "تقترح أسماء الأعمدة أدوارًا، لكن على الباحث فحص محتواها أيضًا."),
      scenarios: [
        { question: bi("Which column contains the material to analyze?", "أي عمود يحتوي المادة المراد تحليلها؟"), options: [option("text", "النص", true, "The `text` field contains the linguistic input.", "يحتوي حقل «النص» المدخل اللغوي."), option("id", "المعرّف", false, "An identifier tracks rows and should not silently become text evidence.", "يتتبع المعرّف الصفوف، ولا ينبغي أن يصبح دليلًا نصيًا ضمنيًا."), option("date", "التاريخ", false, "Date is metadata unless the research design explicitly uses it.", "التاريخ بيانات وصفية ما لم يستخدمه التصميم البحثي صراحة.")] },
        { question: bi("Which column can hold the human target for classification?", "أي عمود يمكن أن يحمل الهدف البشري في مهمة التصنيف؟"), options: [option("label", "التصنيف", true, "The label can represent the reviewed target category.", "يمكن أن يمثل عمود التصنيف الفئة الهدف التي راجعها البشر."), option("text", "النص", false, "Text is the input evidence, not automatically the target.", "النص هو دليل المدخل، وليس الهدف تلقائيًا."), option("id", "المعرّف", false, "Identifiers distinguish observations; they are not class labels by default.", "تميّز المعرّفات الملاحظات، وليست تصنيفات افتراضيًا.")] },
      ],
    }),
    Object.freeze({
      id: "readiness",
      type: "choice-set",
      title: bi("Make a readiness decision", "اتخذ قرار الجاهزية"),
      prompt: bi("Readiness is a reasoned state, not just yes or no.", "الجاهزية حالة معلّلة، وليست نعم أو لا فقط."),
      scenarios: [{
        question: bi("A dataset has one empty text, an exact duplicate, and inconsistent label forms. What is the best current status?", "تحتوي البيانات نصًا فارغًا وتكرارًا تامًا وصيغ تصنيف غير متسقة. ما أفضل وصف لحالتها الآن؟"),
        options: [
          option("Needs cleaning and label review", "تحتاج إلى تنظيف ومراجعة التصنيفات", true, "The issues are observable and actionable, but the data should not proceed silently as ready.", "المشكلات قابلة للرصد والمعالجة، لكن لا ينبغي تمرير البيانات ضمنيًا بوصفها جاهزة."),
          option("Ready without review", "جاهزة من دون مراجعة", false, "Known quality issues still affect usable rows and target consistency.", "ما تزال مشكلات الجودة المعروفة تؤثر في الصفوف القابلة للاستخدام واتساق الهدف."),
          option("Unusable forever", "غير صالحة نهائيًا", false, "The observed issues may be repairable after documented review.", "قد تكون المشكلات المرصودة قابلة للإصلاح بعد مراجعة موثقة."),
          option("Insufficient information", "المعلومات غير كافية", false, "There is enough evidence to identify a current cleaning-and-review need, even though final suitability needs more context.", "توجد أدلة كافية لتحديد الحاجة الحالية إلى التنظيف والمراجعة، مع بقاء الملاءمة النهائية محتاجة إلى سياق إضافي."),
        ],
      }],
    }),
  ]),
});

export const LEARNING_INTERACTION_PLACEMENTS = Object.freeze({
  "text-analysis": Object.freeze({
    0: ["computer-view"],
    2: ["unit-choice"],
    4: ["frequency-prediction"],
    6: ["analysis-family"],
  }),
  "prompt-practice": Object.freeze({
    0: ["weak-prompt"],
    1: ["instruction-components"],
    2: ["compare-prompts"],
    3: ["improve-prompt"],
  }),
  "code-learning": Object.freeze({
    0: ["rule-to-code"],
    1: ["predict-output", "explain-code"],
    2: ["missing-pipeline-step"],
    3: ["placeholder-awareness"],
  }),
  "data-learning": Object.freeze({
    0: ["mini-table"],
    1: ["column-roles"],
    2: ["issue-types"],
    3: ["readiness"],
  }),
});

export function microInteractionsForLesson(lessonId, afterConcept) {
  const interactions = LEARNING_MICRO_INTERACTIONS[lessonId] || [];
  if (!Number.isInteger(afterConcept)) return interactions;
  const ids = LEARNING_INTERACTION_PLACEMENTS[lessonId]?.[afterConcept] || [];
  return interactions.filter((interaction) => ids.includes(interaction.id));
}
