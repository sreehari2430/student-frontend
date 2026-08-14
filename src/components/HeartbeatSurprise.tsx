import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'heartbeat-protocol';
const SYNC_MS = 1600;
const CINEMATIC_MS = 3200;

type Phase = 'gate' | 'cinematic' | 'sync' | 'reveal' | 'celebrate';

type SavedNote = {
  herName: string;
  message: string;
};

type HeartParticle = {
  id: number;
  left: number;
  delay: number;
  size: number;
};

const SPECIAL_NAME = 'Archana';

const DEFAULT_MESSAGE =
  'If I could rewrite the stars, I would still choose the ending where I find you. Archana, you are the softest place my heart has ever known — my quiet joy, my loudest dream, and the love I want to come home to for the rest of my life. I love you, today and in every tomorrow.';

const LEGACY_DEFAULTS = [
  'In every build I write and every bug I fix, you are the feature I never want to ship without. Thank you for being my favorite person in every version of my life.',
  'Archana, every day with you feels like the best commit of my life — no rollbacks, no regrets. You are my calm, my courage, and my favorite forever. I love you.',
];

function loadNote(): SavedNote {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { herName: '', message: DEFAULT_MESSAGE };
    const parsed = JSON.parse(raw) as SavedNote;
    const message =
      !parsed.message || LEGACY_DEFAULTS.includes(parsed.message)
        ? DEFAULT_MESSAGE
        : parsed.message;
    return {
      herName: parsed.herName ?? '',
      message,
    };
  } catch {
    return { herName: '', message: DEFAULT_MESSAGE };
  }
}

function isArchana(name: string) {
  return name.trim().toLowerCase() === SPECIAL_NAME.toLowerCase();
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Props = {
  onClose: () => void;
  initialName?: string;
};

function HeartbeatSurprise({ onClose, initialName }: Props) {
  const saved = useMemo(() => loadNote(), []);
  const entryName = initialName?.trim() ?? '';
  const startsUnlocked = entryName.length > 0;
  const [phase, setPhase] = useState<Phase>(startsUnlocked ? 'cinematic' : 'gate');
  const [herName, setHerName] = useState(
    startsUnlocked && isArchana(entryName) ? SPECIAL_NAME : entryName
  );
  const [draftName, setDraftName] = useState('');
  const [message, setMessage] = useState(saved.message);
  const [typed, setTyped] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftMessage, setDraftMessage] = useState(saved.message);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [pulseCount, setPulseCount] = useState(0);
  const [statusLine, setStatusLine] = useState('Acquiring signal…');
  const [shownLetters, setShownLetters] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);
  const [holding, setHolding] = useState(false);

  const holdRaf = useRef<number | null>(null);
  const holdStarted = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (holdRaf.current) cancelAnimationFrame(holdRaf.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'cinematic') return;

    const reduced = prefersReducedMotion();
    const special = isArchana(herName);
    setStatusLine(special ? 'My heart found you…' : 'Acquiring signal…');
    setShownLetters(0);
    burstHearts(special ? 42 : 28);

    if (reduced) {
      setShownLetters(herName.length);
      setStatusLine(special ? 'Archana, it’s always been you' : 'Identity confirmed');
      const t = window.setTimeout(() => setPhase('sync'), 400);
      return () => window.clearTimeout(t);
    }

    let letter = 0;
    const letterTimer = window.setInterval(() => {
      letter += 1;
      setShownLetters(letter);
      if (letter >= herName.length) window.clearInterval(letterTimer);
    }, Math.max(40, 420 / Math.max(herName.length, 1)));

    const statusTimer = window.setTimeout(() => {
      setStatusLine(special ? 'Archana, my forever love' : 'Identity confirmed');
      burstHearts(special ? 36 : 20);
    }, 1200);

    const nextTimer = window.setTimeout(() => setPhase('sync'), special ? CINEMATIC_MS + 600 : CINEMATIC_MS);

    return () => {
      window.clearInterval(letterTimer);
      window.clearTimeout(statusTimer);
      window.clearTimeout(nextTimer);
    };
  }, [phase, herName]);

  useEffect(() => {
    if (phase !== 'reveal' || editing) return;

    const fullText = `My dearest ${herName},\n\n${message}`;
    setTyped('');
    setTypingDone(false);

    if (prefersReducedMotion()) {
      setTyped(fullText);
      setTypingDone(true);
      return;
    }

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) {
        window.clearInterval(id);
        setTypingDone(true);
      }
    }, 26);

    return () => window.clearInterval(id);
  }, [phase, message, editing, herName]);

  function persist(next: SavedNote) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function unlock() {
    const name = draftName.trim();
    if (!name) return;
    const displayName = isArchana(name) ? SPECIAL_NAME : name;
    setHerName(displayName);
    persist({ herName: displayName, message });
    setPhase('cinematic');
  }

  function saveEdits() {
    const next = {
      herName: herName.trim() || draftName.trim(),
      message: draftMessage.trim() || DEFAULT_MESSAGE,
    };
    setHerName(next.herName);
    setMessage(next.message);
    persist(next);
    setEditing(false);
    setPhase('gate');
  }

  function burstHearts(count = 18) {
    const batch = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      left: 6 + Math.random() * 88,
      delay: Math.random() * 0.45,
      size: 10 + Math.random() * 18,
    }));
    setHearts((prev) => [...prev, ...batch]);
    window.setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !batch.some((b) => b.id === h.id)));
    }, 2400);
  }

  function stopHold(reset: boolean) {
    setHolding(false);
    holdStarted.current = null;
    if (holdRaf.current) {
      cancelAnimationFrame(holdRaf.current);
      holdRaf.current = null;
    }
    if (reset) setSyncProgress(0);
  }

  function completeSync() {
    stopHold(false);
    setSyncProgress(100);
    burstHearts(36);
    setStatusLine('Hearts synchronized');
    window.setTimeout(() => setPhase('reveal'), prefersReducedMotion() ? 200 : 700);
  }

  function startHold() {
    if (phase !== 'sync' || syncProgress >= 100) return;

    if (prefersReducedMotion()) {
      completeSync();
      return;
    }

    setHolding(true);
    holdStarted.current = performance.now();

    const tick = (now: number) => {
      if (!holdStarted.current) return;
      const elapsed = now - holdStarted.current;
      const next = Math.min(100, (elapsed / SYNC_MS) * 100);
      setSyncProgress(next);
      if (next >= 100) {
        completeSync();
        return;
      }
      holdRaf.current = requestAnimationFrame(tick);
    };

    holdRaf.current = requestAnimationFrame(tick);
  }

  function sendPulse() {
    setPulseCount((c) => c + 1);
    burstHearts(16);
  }

  function celebrateForever() {
    setPhase('celebrate');
    burstHearts(isArchana(herName) ? 64 : 48);
    window.setTimeout(() => burstHearts(40), 400);
    if (isArchana(herName)) {
      window.setTimeout(() => burstHearts(28), 900);
    }
  }

  const stageClass = [
    'heartbeat-stage',
    phase === 'cinematic' && 'is-cinematic',
    phase === 'sync' && 'is-syncing',
    (phase === 'celebrate' || holding) && 'is-celebrating',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="heartbeat-overlay" onClick={onClose}>
      <div
        className={stageClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="heartbeat-title"
      >
        <div className="heartbeat-particles" aria-hidden="true">
          {hearts.map((h) => (
            <span
              key={h.id}
              className="heartbeat-particle"
              style={{
                left: `${h.left}%`,
                animationDelay: `${h.delay}s`,
                width: h.size,
                height: h.size,
              }}
            />
          ))}
        </div>

        <div className="heartbeat-frame">
          <p className="heartbeat-kicker">Classified // Heartbeat Protocol</p>

          {phase === 'gate' && (
            <>
              <h2 id="heartbeat-title">Who is this signal for?</h2>
              <p className="heartbeat-sub">
                Type your name to unlock a note written just for you.
              </p>
              <label className="heartbeat-label">
                Your name
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Type your name"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && unlock()}
                />
              </label>
              <div className="modal-actions">
                <button className="ghost-btn" onClick={onClose}>
                  Close
                </button>
                <button className="heartbeat-btn" onClick={unlock} disabled={!draftName.trim()}>
                  Begin
                </button>
              </div>
              <button
                className="heartbeat-close"
                onClick={() => {
                  setDraftMessage(message);
                  setHerName(saved.herName || 'her');
                  setEditing(true);
                  setPhase('reveal');
                }}
              >
                Edit note (for you)
              </button>
            </>
          )}

          {phase === 'cinematic' && (
            <>
              <p className="heartbeat-status">{statusLine}</p>
              <div className="heartbeat-core heartbeat-core--large" aria-hidden="true">
                <span className="heartbeat-ring" />
                <span className="heartbeat-ring heartbeat-ring--delay" />
                <span className="heartbeat-heart" />
              </div>
              <h2 id="heartbeat-title" className="heartbeat-name-display">
                {herName.slice(0, shownLetters).split('').map((ch, i) => (
                  <span key={`${ch}-${i}`} className="heartbeat-letter">
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                ))}
                <span className="heartbeat-caret" aria-hidden="true" />
              </h2>
              <p className="heartbeat-sub">Locking onto your signal…</p>
            </>
          )}

          {phase === 'sync' && (
            <>
              <h2 id="heartbeat-title">Sync with {herName}</h2>
              <p className="heartbeat-sub">
                {isArchana(herName)
                  ? 'Hold the heart, Archana — let our hearts meet.'
                  : 'Hold the heart until your signals become one.'}
              </p>

              <button
                type="button"
                className={`heartbeat-sync ${holding ? 'is-holding' : ''}`}
                aria-label="Hold to sync"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  startHold();
                }}
                onPointerUp={() => stopHold(syncProgress < 100)}
                onPointerCancel={() => stopHold(true)}
                onLostPointerCapture={() => stopHold(syncProgress < 100)}
              >
                <svg className="heartbeat-sync-ring" viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="heartbeat-sync-track" cx="50" cy="50" r="44" />
                  <circle
                    className="heartbeat-sync-value"
                    cx="50"
                    cy="50"
                    r="44"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 44}`,
                      strokeDashoffset: `${2 * Math.PI * 44 * (1 - syncProgress / 100)}`,
                    }}
                  />
                </svg>
                <span className="heartbeat-core heartbeat-core--sync" aria-hidden="true">
                  <span className={`heartbeat-heart ${holding ? 'is-fast' : ''}`} />
                </span>
              </button>

              <p className="heartbeat-sync-label">
                {Math.round(syncProgress)}% synchronized
              </p>
              <p className="heartbeat-hint">Keep holding — don’t let go</p>
            </>
          )}

          {(phase === 'reveal' || phase === 'celebrate') && (
            <>
              <div className="heartbeat-core" aria-hidden="true">
                <span className="heartbeat-ring" />
                <span className="heartbeat-ring heartbeat-ring--delay" />
                <span className="heartbeat-heart" />
              </div>

              <h2 id="heartbeat-title">For {herName}</h2>
              <p className="heartbeat-sub">
                {isArchana(herName)
                  ? 'With all my heart, only for you.'
                  : 'A little transmission from someone who loves you.'}
              </p>

              {editing ? (
                <>
                  <label className="heartbeat-label">
                    Display name (optional)
                    <input value={herName} onChange={(e) => setHerName(e.target.value)} />
                  </label>
                  <label className="heartbeat-label">
                    Your note
                    <textarea
                      value={draftMessage}
                      onChange={(e) => setDraftMessage(e.target.value)}
                      rows={5}
                    />
                  </label>
                  <div className="modal-actions">
                    <button
                      className="ghost-btn"
                      onClick={() => {
                        setEditing(false);
                        setPhase('gate');
                      }}
                    >
                      Cancel
                    </button>
                    <button className="heartbeat-btn" onClick={saveEdits}>
                      Save note
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="heartbeat-message">
                    {typed}
                    {!typingDone && <span className="heartbeat-caret" aria-hidden="true" />}
                  </p>

                  <div className="heartbeat-stats">
                    <div>
                      <span className="heartbeat-stat-label">Signal strength</span>
                      <strong>∞</strong>
                    </div>
                    <div>
                      <span className="heartbeat-stat-label">Pulses sent</span>
                      <strong>{pulseCount}</strong>
                    </div>
                  </div>

                  {phase === 'celebrate' ? (
                    <p className="heartbeat-locked">
                      {isArchana(herName)
                        ? 'Archana, my heart is yours — always, endlessly, forever.'
                        : `Signal locked to ${herName} — forever.`}
                    </p>
                  ) : (
                    typingDone && (
                      <p className="heartbeat-prompt">
                        {isArchana(herName)
                          ? 'Archana, will you keep my heart forever?'
                          : 'Keep this signal forever?'}
                      </p>
                    )
                  )}

                  <div className="modal-actions heartbeat-actions">
                    <button className="ghost-btn" onClick={sendPulse}>
                      Send a pulse
                    </button>
                    {typingDone && phase !== 'celebrate' && (
                      <button className="heartbeat-btn" onClick={celebrateForever}>
                        Yes
                      </button>
                    )}
                    {phase === 'celebrate' && (
                      <button className="heartbeat-btn" onClick={onClose}>
                        Keep it
                      </button>
                    )}
                  </div>

                  <button
                    className="heartbeat-close"
                    onClick={() => {
                      setDraftMessage(message);
                      setEditing(true);
                    }}
                  >
                    Edit note
                  </button>
                  {phase !== 'celebrate' && (
                    <button className="heartbeat-close" onClick={onClose}>
                      Return to console
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeartbeatSurprise;
