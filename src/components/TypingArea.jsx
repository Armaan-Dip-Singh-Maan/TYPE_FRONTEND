import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function calcWPM(correctChars, elapsedMs) {
  if (!elapsedMs || elapsedMs <= 0) return 0;
  const words = correctChars / 5;
  const minutes = elapsedMs / 60000;
  return Math.max(0, Math.round(words / minutes));
}
function calcAccuracy(correctChars, totalTyped) {
  if (!totalTyped) return 100;
  return Math.max(0, Math.min(100, Math.round((correctChars / totalTyped) * 100)));
}

export default function TypingArea({
  passage,
  durationSec = 60,
  startAt = null,
  disabledUntilStart = false,
  onProgress = () => {},
  onFinish = () => {}
}) {
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const timerRef = useRef(null);
  const finishedRef = useRef(false);

  const chars = useMemo(() => passage.split(""), [passage]);

  const correctChars = useMemo(() => {
    let c = 0;
    for (let i = 0; i < input.length && i < chars.length; i++) if (input[i] === chars[i]) c++;
    return c;
  }, [input, chars]);

  const totalTyped = input.length;
  const elapsedMs = useMemo(() => startedAt ? Math.max(0, Date.now() - startedAt) : 0, [startedAt, input, timeLeft]);
  const wpm = calcWPM(correctChars, elapsedMs);
  const accuracy = calcAccuracy(correctChars, totalTyped);

  useEffect(() => {
    if (disabledUntilStart && startAt) {
      const wait = Math.max(0, startAt - Date.now());
      const id = setTimeout(() => setStartedAt(Date.now()), wait);
      return () => clearTimeout(id);
    }
  }, [disabledUntilStart, startAt]);

  useEffect(() => {
    if (!startedAt) return;
    timerRef.current && clearInterval(timerRef.current);
    setTimeLeft(durationSec);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remain = durationSec - elapsed;
      setTimeLeft(remain);
      if (remain <= 0) { clearInterval(timerRef.current); finish(); }
    }, 150);
    return () => clearInterval(timerRef.current);
  }, [startedAt, durationSec]);

  useEffect(() => {
    onProgress({ correctChars, totalTyped, elapsedMs, wpm, accuracy });
  }, [correctChars, totalTyped, elapsedMs, wpm, accuracy, onProgress]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    timerRef.current && clearInterval(timerRef.current);
    const ms = startedAt ? Date.now() - startedAt : durationSec * 1000;
    onFinish({ wpm: calcWPM(correctChars, ms), accuracy: calcAccuracy(correctChars, totalTyped), elapsedMs: ms });
  }, [startedAt, durationSec, correctChars, totalTyped, onFinish]);

  const handleChange = (e) => {
    if (!startedAt && !(disabledUntilStart && startAt)) setStartedAt(Date.now());
    const val = e.target.value;
    setInput(val);
    if (val.length >= passage.length) finish();
  };

  const locked = disabledUntilStart && startAt && Date.now() < startAt;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="opacity-70">Time</div>
          <div className="text-xl font-semibold">{Math.max(0, timeLeft)}s</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 grid grid-cols-2 gap-3">
          <div><div className="opacity-70">WPM</div><div className="text-xl font-semibold">{wpm}</div></div>
          <div><div className="opacity-70">Accuracy</div><div className="text-xl font-semibold">{accuracy}%</div></div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 leading-7">
        {chars.map((ch, i) => {
          const typed = input[i];
          let cls = "char";
          if (typed != null) cls += typed === ch ? " correct" : " wrong";
          return <span key={i} className={cls}>{ch}</span>;
        })}
      </div>

      <textarea
        className="w-full min-h-[140px] rounded-xl border border-border bg-transparent p-3 outline-none focus:ring-2 focus:ring-primary"
        value={input}
        onChange={handleChange}
        placeholder={locked ? "Race will start after the countdown…" : "Start typing here…"}
        disabled={locked}
        autoFocus
      />
    </div>
  );
}
