'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Material = {
  id: string;
  title: string | null;
  raw_text: string;
  created_at: string;
};

type MCQ = {
  id: string;
  topic: TopicKey;
  question: string;
  choices: string[]; // A-D
  answerIndex: number; // 0-3
};

type TopicKey = 'price_controls' | 'quota_tariff' | 'shifts';

const TOPICS: Array<{ key: TopicKey; label: string }> = [
  { key: 'price_controls', label: 'Price Ceilings & Floors (Shortage/Surplus)' },
  { key: 'quota_tariff', label: 'Quotas vs Tariffs (Wedge, DWL, Supply)' },
  { key: 'shifts', label: 'Supply & Demand Shifts (Price/Quantity changes)' },
];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestion(topic: TopicKey, q: string, choices: string[], answerIndex: number): MCQ {
  return {
    id: crypto.randomUUID(),
    topic,
    question: q,
    choices,
    answerIndex,
  };
}

/**
 * OFFLINE TOPIC BANKS (15 each)
 */
function getQuestionBank(topic: TopicKey): MCQ[] {
  if (topic === 'price_controls') {
    return [
      makeQuestion(
        'price_controls',
        'Fill in the blank: A binding price ceiling creates a ____.',
        ['shortage', 'surplus', 'equilibrium', 'higher producer surplus'],
        0
      ),
      makeQuestion(
        'price_controls',
        'Fill in the blank: A binding price floor creates a ____.',
        ['surplus', 'shortage', 'equilibrium', 'no change in quantity'],
        0
      ),
      makeQuestion(
        'price_controls',
        'Fill in the blank: A price ceiling is set ____ the equilibrium price.',
        ['below', 'above', 'equal to', 'independent of'],
        0
      ),
      makeQuestion(
        'price_controls',
        'Fill in the blank: A price floor is set ____ the equilibrium price.',
        ['above', 'below', 'equal to', 'independent of'],
        0
      ),
      makeQuestion(
        'price_controls',
        'Under a binding price ceiling, quantity demanded is ____ quantity supplied.',
        ['greater than', 'less than', 'equal to', 'unrelated to'],
        0
      ),
      makeQuestion(
        'price_controls',
        'Under a binding price floor, quantity supplied is ____ quantity demanded.',
        ['greater than', 'less than', 'equal to', 'unrelated to'],
        0
      ),
      makeQuestion(
        'price_controls',
        'Both price ceilings and price floors typically cause:',
        ['deadweight loss', 'perfect efficiency', 'higher total surplus', 'no market distortion'],
        0
      ),
      makeQuestion(
        'price_controls',
        'With a binding price ceiling, the quantity actually traded (relative to equilibrium) usually:',
        ['decreases', 'increases', 'stays the same', 'becomes infinite'],
        0
      ),
      makeQuestion(
        'price_controls',
        'With a binding price floor, the quantity actually traded (relative to equilibrium) usually:',
        ['decreases', 'increases', 'stays the same', 'becomes infinite'],
        0
      ),
      makeQuestion(
        'price_controls',
        'A common example of a price ceiling is:',
        ['rent control', 'minimum wage', 'a tariff', 'a quota'],
        0
      ),
      makeQuestion(
        'price_controls',
        'A common example of a price floor is:',
        ['minimum wage', 'rent control', 'a subsidy', 'a sales tax'],
        0
      ),
      makeQuestion(
        'price_controls',
        'If a price ceiling is NOT binding (set above equilibrium), then:',
        ['it has no effect on the market outcome', 'it creates a shortage', 'it creates a surplus', 'it shifts demand left'],
        0
      ),
      makeQuestion(
        'price_controls',
        'A binding price ceiling can lead to non-price rationing (like waiting in line) because:',
        ['the price cannot rise to clear the market', 'supply increases automatically', 'demand decreases automatically', 'it eliminates scarcity'],
        0
      ),
      makeQuestion(
        'price_controls',
        'When a price floor is binding, which is most likely true?',
        ['some goods go unsold', 'a shortage occurs', 'quantity traded increases above equilibrium', 'demand shifts right'],
        0
      ),
      makeQuestion(
        'price_controls',
        'If the government sets a binding price floor, the market price is typically:',
        ['at the floor (or above), not below it', 'below the floor', 'always equal to equilibrium', 'zero'],
        0
      ),
    ];
  }

  if (topic === 'quota_tariff') {
    return [
      makeQuestion(
        'quota_tariff',
        'A quota is a legal limit on ____.',
        ['the quantity traded', 'the price', 'consumer income', 'firm profits'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'A quota typically results in:',
        ['deadweight loss', 'perfect efficiency', 'more total surplus', 'no change in equilibrium'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'A quota creates a wedge between:',
        ['buyers’ price and sellers’ price', 'supply and demand curves', 'two demand curves', 'two supply curves'],
        0
      ),
      makeQuestion('quota_tariff', 'A tariff is best described as a tax on:', ['imports', 'exports', 'all goods', 'only services'], 0),
      makeQuestion(
        'quota_tariff',
        'A tariff on an imported input (e.g., aluminum) tends to shift the domestic supply curve:',
        ['left', 'right', 'does not shift', 'becomes perfectly elastic'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'When supply shifts left, equilibrium price ____ and equilibrium quantity ____.',
        ['rises; falls', 'falls; rises', 'rises; rises', 'falls; falls'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'A binding quota (restricting supply) usually makes the market price:',
        ['higher', 'lower', 'unchanged', 'zero'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'Who benefits from a binding quota depends on who receives the:',
        ['quota rents', 'consumer surplus', 'tax refunds', 'imports'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'Compared to a tariff, a quota is more likely to create:',
        ['quota rents', 'government tax revenue', 'a subsidy', 'perfect competition'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'Deadweight loss from a quota comes from:',
        ['trades that no longer happen', 'higher quality products', 'lower costs', 'more efficient markets'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'A quota that restricts imports tends to:',
        ['raise domestic price and reduce quantity', 'lower domestic price and increase quantity', 'leave price unchanged', 'eliminate deadweight loss'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'A tariff on imports typically creates government:',
        ['revenue', 'quota rents', 'a surplus in every market', 'perfect competition'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'Compared to a quota, a tariff is more likely to generate:',
        ['tax revenue for the government', 'quota rents for license holders', 'no deadweight loss', 'a binding price ceiling'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'If a tariff raises costs for producers, the supply curve shifts ____ and equilibrium price ____.',
        ['left; rises', 'right; rises', 'left; falls', 'right; falls'],
        0
      ),
      makeQuestion(
        'quota_tariff',
        'The deadweight loss from a tariff comes from:',
        ['mutually beneficial trades that no longer occur', 'extra trades that occur', 'lower prices for consumers', 'higher production efficiency'],
        0
      ),
    ];
  }

  return [
    makeQuestion('shifts', 'If demand increases (shifts right) and supply is unchanged, equilibrium price ____ and quantity ____.', ['rises; rises', 'falls; falls', 'rises; falls', 'falls; rises'], 0),
    makeQuestion('shifts', 'If demand decreases (shifts left) and supply is unchanged, equilibrium price ____ and quantity ____.', ['falls; falls', 'rises; rises', 'rises; falls', 'falls; rises'], 0),
    makeQuestion('shifts', 'If supply increases (shifts right) and demand is unchanged, equilibrium price ____ and quantity ____.', ['falls; rises', 'rises; falls', 'rises; rises', 'falls; falls'], 0),
    makeQuestion('shifts', 'If supply decreases (shifts left) and demand is unchanged, equilibrium price ____ and quantity ____.', ['rises; falls', 'falls; rises', 'rises; rises', 'falls; falls'], 0),
    makeQuestion('shifts', 'A tariff on an important input is most likely to cause:', ['supply to shift left', 'demand to shift right', 'supply to shift right', 'demand to shift left'], 0),
    makeQuestion('shifts', 'If a city wins a championship and demand for merch rises, the demand curve shifts:', ['right', 'left', 'up the curve only', 'down the curve only'], 0),
    makeQuestion('shifts', 'A movement ALONG a demand curve is caused by:', ['a change in price of the good', 'a change in income', 'a change in tastes', 'a change in population'], 0),
    makeQuestion('shifts', 'A shift of the demand curve can be caused by:', ['a change in income', 'a change in the good’s price', 'a change in the good’s quantity supplied', 'a price ceiling'], 0),
    makeQuestion('shifts', 'An increase in production costs will shift supply:', ['left', 'right', 'not at all', 'along the curve only'], 0),
    makeQuestion('shifts', 'If both demand and supply increase, equilibrium quantity ____ and equilibrium price is:', ['higher; ambiguous', 'lower; ambiguous', 'higher; definitely lower', 'lower; definitely higher'], 0),
    makeQuestion('shifts', 'If demand increases and supply decreases, equilibrium price is ____ and equilibrium quantity is ____.', ['higher; ambiguous', 'lower; ambiguous', 'higher; higher', 'lower; lower'], 0),
    makeQuestion('shifts', 'If demand decreases and supply increases, equilibrium price is ____ and equilibrium quantity is ____.', ['lower; ambiguous', 'higher; ambiguous', 'higher; higher', 'lower; lower'], 0),
    makeQuestion('shifts', 'A new technology that reduces production costs shifts supply:', ['right', 'left', 'up the curve only', 'down the curve only'], 0),
    makeQuestion('shifts', 'An increase in consumer income (for a normal good) shifts demand:', ['right', 'left', 'along the curve only', 'does not change demand'], 0),
    makeQuestion('shifts', 'A decrease in the price of a complement shifts demand for this good:', ['right', 'left', 'along the curve only', 'does not change demand'], 0),
  ];
}

function generateQuiz(topic: TopicKey, numQuestions: number): MCQ[] {
  const bank = getQuestionBank(topic);
  return shuffle(bank).slice(0, Math.min(numQuestions, bank.length));
}

/**
 * ✅ PDF text extraction helper
 * ✅ CHANGED: uses LOCAL worker from /public to avoid CDN "fake worker" failures.
 *
 * IMPORTANT: You must copy:
 * node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs
 * to:
 * public/pdf.worker.min.mjs
 */
async function extractTextFromPdf(file: File) {
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // ✅ FORCE LOCAL WORKER (NO CDN)
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;

  const pages: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = (content.items as any[])
      .map((it) => (typeof it?.str === 'string' ? it.str : ''))
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n\n');
}

export default function MaterialsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [topic, setTopic] = useState<TopicKey>('price_controls');
  const [numQuestions, setNumQuestions] = useState(10);

  const [quizItems, setQuizItems] = useState<MCQ[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showAnswers, setShowAnswers] = useState(false);

  const [examMode, setExamMode] = useState(false);
  const [examActive, setExamActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [durationMin, setDurationMin] = useState(20);
  const [timeLeftSec, setTimeLeftSec] = useState(0);

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (!examActive) return;

    const t = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setSubmitted(true);
          setExamActive(false);
          setShowAnswers(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [examActive]);

  async function fetchMaterials() {
    const { data, error } = await supabase
      .from('materials')
      .select('id,title,raw_text,created_at')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch materials error:', error.message);
      return;
    }

    setMaterials(data ?? []);
  }

  async function addMaterial() {
    if (!rawText.trim()) return;

    const { error } = await supabase.from('materials').insert({
      course_id: courseId,
      title: title.trim() || null,
      raw_text: rawText.trim(),
    });

    if (error) {
      console.error('Add material error:', error.message);
      return;
    }

    setTitle('');
    setRawText('');
    fetchMaterials();
  }

  async function onPdfSelected(file: File | null) {
    if (!file) return;
    setPdfError(null);

    if (file.type !== 'application/pdf') {
      setPdfError('Please choose a PDF file.');
      return;
    }

    try {
      setPdfLoading(true);
      const text = await extractTextFromPdf(file);

      const cleaned = (text ?? '').trim();
      if (!cleaned) {
        setPdfError('This PDF has no selectable text (likely scanned). Upload a text-based PDF, or we can add OCR next.');
        return;
      }

      const header = `\n\n--- PDF IMPORT: ${file.name} ---\n`;
      setRawText((prev) => (prev ? prev + header + cleaned : header.trimStart() + cleaned));
      setTitle((prev) => prev || file.name.replace(/\.pdf$/i, ''));
    } catch (e: any) {
      console.error(e);
      setPdfError('Could not read that PDF. Try a different file.');
    } finally {
      setPdfLoading(false);
    }
  }

  const combinedNotes = useMemo(() => materials.map((m) => m.raw_text).join('\n\n'), [materials]);

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function onGenerate() {
    const quiz = generateQuiz(topic, numQuestions);
    setQuizItems(quiz);
    setAnswers({});
    setShowAnswers(false);
    setSubmitted(false);
    setExamActive(false);
    setTimeLeftSec(0);
  }

  function startExam() {
    const quiz = generateQuiz(topic, numQuestions);
    setQuizItems(quiz);
    setAnswers({});
    setShowAnswers(false);
    setSubmitted(false);
    setExamActive(true);
    setTimeLeftSec(durationMin * 60);
  }

  function submitPractice() {
    setSubmitted(true);
    setShowAnswers(true);
  }

  function submitExam() {
    setSubmitted(true);
    setExamActive(false);
    setShowAnswers(true);
  }

  function resetExam() {
    setExamActive(false);
    setSubmitted(false);
    setShowAnswers(false);
    setTimeLeftSec(0);
    setAnswers({});
  }

  const wrongOnly = useMemo(() => {
    return quizItems.filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.answerIndex);
  }, [quizItems, answers]);

  const wrongOrUnanswered = useMemo(() => {
    return quizItems.filter((q) => answers[q.id] === undefined || answers[q.id] !== q.answerIndex);
  }, [quizItems, answers]);

  function retryQuestions(questions: MCQ[]) {
    if (questions.length === 0) return;
    setQuizItems(shuffle(questions));
    setAnswers({});
    setShowAnswers(false);
    setExamActive(false);
    setSubmitted(false);
    setTimeLeftSec(0);
  }

  const score = useMemo(() => {
    if (quizItems.length === 0) return { correct: 0, total: 0, answered: 0 };
    let correct = 0;
    let answeredCount = 0;

    for (const q of quizItems) {
      if (answers[q.id] !== undefined) {
        answeredCount++;
        if (answers[q.id] === q.answerIndex) correct++;
      }
    }

    return { correct, total: quizItems.length, answered: answeredCount };
  }, [answers, quizItems]);

  const isPerfect = quizItems.length > 0 && score.correct === score.total && score.answered === score.total;
  const topicLabel = TOPICS.find((t) => t.key === topic)?.label ?? 'Topic';

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Course Materials</h1>

        <div className="mb-6 space-y-2">
          <input
            className="w-full border border-gray-700 p-2 rounded bg-black text-white placeholder-gray-400"
            placeholder="Title (optional) e.g., Lecture 1 Notes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="border border-gray-700 rounded p-3 space-y-2 bg-black">
            <div className="text-sm font-semibold">Upload PDF</div>
            <input
              type="file"
              accept="application/pdf"
              className="w-full text-sm"
              disabled={pdfLoading}
              onChange={(e) => onPdfSelected(e.target.files?.[0] ?? null)}
            />
            {pdfLoading && <div className="text-sm text-gray-300">Extracting text from PDF…</div>}
            {pdfError && <div className="text-sm text-red-400">{pdfError}</div>}
            <div className="text-xs text-gray-400">
              Tip: This extracts text into the notes box below. Then click “Save Material”.
            </div>
          </div>

          <textarea
            className="w-full border border-gray-700 p-2 rounded min-h-[160px] bg-black text-white placeholder-gray-400"
            placeholder="Paste your notes / study guide text here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />

          <button onClick={addMaterial} className="bg-white text-black py-2 px-4 rounded">
            Save Material
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-3">Saved</h2>
        <ul className="space-y-3">
          {materials.map((m) => (
            <li key={m.id} className="border border-gray-700 p-3 rounded bg-black">
              <div className="font-semibold">{m.title ?? 'Untitled'}</div>
              <div className="text-sm text-gray-400">{new Date(m.created_at).toLocaleString()}</div>
              <pre className="whitespace-pre-wrap mt-2 text-sm text-gray-200">{m.raw_text}</pre>
            </li>
          ))}
        </ul>

        <div className="mt-8 border border-gray-700 rounded p-4 space-y-3 bg-black">
          <div className="font-semibold">Offline Practice Quiz</div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={examMode}
                onChange={(e) => {
                  const v = e.target.checked;
                  setExamMode(v);
                  setExamActive(false);
                  setSubmitted(false);
                  setShowAnswers(false);
                  setTimeLeftSec(0);
                }}
              />
              Exam Mode
            </label>

            {examMode && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-300">Duration</span>
                <select
                  className="border border-gray-700 p-2 rounded bg-black text-white"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  disabled={examActive}
                >
                  {[5, 10, 15, 20, 30, 45, 60].map((m) => (
                    <option key={m} value={m} className="bg-black text-white">
                      {m} min
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Topic</label>
            <select
              className="w-full border border-gray-700 p-2 rounded bg-black text-white"
              value={topic}
              onChange={(e) => setTopic(e.target.value as TopicKey)}
              disabled={examActive}
            >
              {TOPICS.map((t) => (
                <option key={t.key} value={t.key} className="bg-black text-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Number of questions</label>
            <select
              className="w-full border border-gray-700 p-2 rounded bg-black text-white"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              disabled={examActive}
            >
              {[5, 8, 10, 12, 15].map((n) => (
                <option key={n} value={n} className="bg-black text-white">
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                if (examMode) startExam();
                else onGenerate();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={examActive}
              title={examActive ? 'Finish/submit the exam first' : ''}
            >
              {examMode ? `Start Exam (${topicLabel})` : `Generate (${topicLabel})`}
            </button>

            {quizItems.length > 0 && !examMode && (
              <button
                onClick={submitPractice}
                className="bg-white text-black px-4 py-2 rounded"
                disabled={submitted}
                title={submitted ? 'Already submitted' : 'Submit to reveal score + answers'}
              >
                Submit (Practice)
              </button>
            )}

            {quizItems.length > 0 && !examMode && (
              <button
                onClick={() => setShowAnswers((v) => !v)}
                className="border border-gray-700 px-4 py-2 rounded text-blue-300"
                disabled={!submitted}
                title={!submitted ? 'Submit the practice quiz to reveal answers' : ''}
              >
                {showAnswers ? 'Hide Answers' : 'Show Answers'}
              </button>
            )}

            {quizItems.length > 0 && examMode && (
              <button
                onClick={() => setShowAnswers((v) => !v)}
                className="border border-gray-700 px-4 py-2 rounded text-blue-300"
                disabled={!submitted}
                title={!submitted ? 'Submit the exam to reveal answers' : ''}
              >
                {showAnswers ? 'Hide Answers' : 'Show Answers'}
              </button>
            )}

            {quizItems.length > 0 && (
              <button
                onClick={() => retryQuestions(wrongOnly)}
                className="border border-gray-700 px-4 py-2 rounded text-blue-300"
                disabled={examMode || wrongOnly.length === 0}
                title={
                  examMode
                    ? 'Retry is disabled in Exam Mode'
                    : wrongOnly.length === 0
                    ? 'No wrong answers yet'
                    : 'Retry only wrong answers'
                }
              >
                Retry Wrong Only ({wrongOnly.length})
              </button>
            )}

            {quizItems.length > 0 && (
              <button
                onClick={() => retryQuestions(wrongOrUnanswered)}
                className="border border-gray-700 px-4 py-2 rounded text-blue-300"
                disabled={examMode || wrongOrUnanswered.length === 0}
                title={
                  examMode
                    ? 'Retry is disabled in Exam Mode'
                    : wrongOrUnanswered.length === 0
                    ? 'Nothing to retry'
                    : 'Retry wrong + unanswered'
                }
              >
                Retry Wrong + Unanswered ({wrongOrUnanswered.length})
              </button>
            )}
          </div>

          <div className="hidden">{combinedNotes.length}</div>
        </div>

        {quizItems.length > 0 && (
          <div className="mt-6 space-y-4">
            {submitted && (
              <div className="text-sm text-gray-200">
                Final Score: {score.correct}/{score.total}
              </div>
            )}

            {examMode && examActive && (
              <div className="flex items-center justify-between border border-gray-700 rounded p-3 bg-black">
                <div className="font-semibold text-blue-300">⏳ Time Left: {formatTime(timeLeftSec)}</div>
                <button onClick={submitExam} className="bg-white text-black px-4 py-2 rounded">
                  Submit Exam
                </button>
              </div>
            )}

            {examMode && submitted && (
              <div className="flex items-center justify-between border rounded p-3 bg-black border-green-600">
                <div className="font-semibold text-blue-300">✅ Exam Submitted</div>
                <button onClick={resetExam} className="border border-gray-700 px-4 py-2 rounded text-blue-300">
                  Reset
                </button>
              </div>
            )}

            {submitted && isPerfect ? (
              <div className="border border-green-600 bg-black p-3 rounded text-green-300">
                ✅ Perfect score. You’re locked in.
              </div>
            ) : null}

            {quizItems.map((q, idx) => (
              <div key={q.id} className="border border-gray-700 rounded p-4 bg-black">
                <div className="text-xs text-gray-400 mb-2">
                  Topic: {TOPICS.find((t) => t.key === q.topic)?.label ?? q.topic}
                </div>

                <div className="font-semibold mb-3">
                  {idx + 1}. {q.question}
                </div>

                <div className="space-y-2">
                  {q.choices.map((choice, i) => {
                    const selected = answers[q.id] === i;
                    const correct = q.answerIndex === i;

                    return (
                      <button
                        key={i}
                        disabled={submitted || showAnswers}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                        className={[
                          'w-full text-left border rounded px-3 py-2 transition',
                          !selected && !showAnswers ? 'bg-black text-white hover:bg-gray-800 border-gray-700' : '',
                          selected && !showAnswers ? 'bg-blue-600 border-blue-400 text-white' : '',
                          showAnswers && correct ? 'bg-green-50 border-green-600 text-green-700' : '',
                          showAnswers && selected && !correct ? 'bg-red-50 border-red-600 text-red-700' : '',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                            {choice}
                          </div>

                          {showAnswers && correct && (
                            <span className="text-green-700 font-semibold whitespace-nowrap">✔ Correct</span>
                          )}
                          {showAnswers && selected && !correct && (
                            <span className="text-red-700 font-semibold whitespace-nowrap">❌ Your answer</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showAnswers && (
                  <div className="mt-3 text-sm text-gray-200">
                    Correct Answer: <span className="font-semibold">{String.fromCharCode(65 + q.answerIndex)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}