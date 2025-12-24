import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import PaywallScreen from "./PaywallScreen";

type Message = {
  role: "user" | "cero";
  content: string;
};

type SessionState = {
  startedAt: number | null;
  messagesCount: number;
  nextSessionAt: number | null;
};

const API_URL = import.meta.env.VITE_CERO_API_URL;

// Configuración de sesión
const MAX_MESSAGES = 7;
const SESSION_DURATION_MS = 12 * 60 * 1000; // 12 minutos
const COOLDOWN_DURATION_MS = 20 * 60 * 60 * 1000; // 20 horas

function App() {
  // --- ESTADO DE SUSCRIPCIÓN ---
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem("cero_subscription") === "true";
  });

  const handleSubscribe = () => {
    localStorage.setItem("cero_subscription", "true");
    setIsSubscribed(true);
  };

  // --- ESTADO DE SESIÓN ---
  const [session, setSession] = useState<SessionState>(() => {
    const saved = localStorage.getItem("cero_session");
    return saved
      ? JSON.parse(saved)
      : { startedAt: null, messagesCount: 0, nextSessionAt: null };
  });

  // Force re-render cada segundo para el timer
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateSession = (newState: Partial<SessionState>) => {
    setSession((prev) => {
      const updated = { ...prev, ...newState };
      localStorage.setItem("cero_session", JSON.stringify(updated));
      return updated;
    });
  };

  // --- ESTADO DEL CHAT ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, error]);

  // --- LÓGICA DE SESIÓN ---
  const now = Date.now();

  // Verificar si estamos en cooldown
  const isCooldown = session.nextSessionAt !== null && now < session.nextSessionAt;

  // Si terminó el cooldown, limpiar estado
  useEffect(() => {
    if (session.nextSessionAt !== null && now >= session.nextSessionAt) {
      updateSession({ startedAt: null, messagesCount: 0, nextSessionAt: null });
    }
  }, [now, session.nextSessionAt]);

  // Verificar límites activos
  const timeElapsed = session.startedAt ? now - session.startedAt : 0;
  const timeLeft = Math.max(0, SESSION_DURATION_MS - timeElapsed);
  const isTimeUp = session.startedAt !== null && timeLeft === 0;
  const isMessageLimitReached = session.messagesCount >= MAX_MESSAGES;

  // Bloqueo efectivo
  const isBlocked = isCooldown || isTimeUp || isMessageLimitReached;

  // Cerrar sesión si se alcanzaron límites (y no estaba ya cerrada/en cooldown)
  useEffect(() => {
    if (!isCooldown && (isTimeUp || isMessageLimitReached)) {
      // Activar cooldown
      updateSession({
        nextSessionAt: now + COOLDOWN_DURATION_MS,
        startedAt: null, // Limpiamos inicio para que no siga contando tiempo
        messagesCount: 0 // Reseteamos contador visual (o podríamos dejarlo para mostrar stats finales)
      });
    }
  }, [isCooldown, isTimeUp, isMessageLimitReached]);

  // Formateo de tiempo restante
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Formateo de tiempo para próxima sesión
  const formatNextSession = (timestamp: number) => {
    const diff = timestamp - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // --- CONSTANTES DE TEXTO (LIBRO DEFINITIVO) ---
  const COPY = {
    placeholder: "Escribí.",
    send: "Entrar",
    loading: "…",
    error: "No hubo devolución.",
    sessionClosed: "Sesión cerrada.",
  };

  // --- HANDLERS ---

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Bloqueo preventivo en UI
    if (isBlocked) return;

    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Iniciar sesión si es el primer mensaje
    if (!session.startedAt) {
      updateSession({ startedAt: Date.now(), messagesCount: 0 });
    }

    setError(null);

    // Actualizar contador de mensajes
    updateSession({ messagesCount: session.messagesCount + 1 });

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyRaw = data?.reply;

      // Si el backend devuelve algo que no es string, eso sí es error técnico.
      if (typeof replyRaw !== "string") {
        throw new Error("Backend reply inválido (no string)");
      }

      // Libro: silencio/corte válido.
      // Si viene vacío, lo convertimos a "—" (corte renderizable).
      const reply = replyRaw.trim().length === 0 ? "—" : replyRaw;

      setMessages((prev) => [...prev, { role: "cero", content: reply }]);
    } catch (err) {
      console.error("CERO fetch error:", err);
      setError(COPY.error);
    } finally {
      setLoading(false);
    }
  }

  function handleNewSession() {
    // "Nueva sesión" solo limpia el chat visual, NO resetea los límites de la sesión lógica
    setMessages([]);
    setInput("");
    setError(null);
  }

  // --- RENDER ---

  if (!isSubscribed) {
    return <PaywallScreen onSubscribe={handleSubscribe} />;
  }

  const hasMessages = messages.length > 0;
  const messagesLeft = MAX_MESSAGES - session.messagesCount;

  return (
    <div className="cero-app">
      <div className="shell">
        <header className="header">
          <div className="brand">
            <h1>C E R O</h1>
            <p>No hay respuestas. Solo el reflejo de lo que ya estás diciendo.</p>
          </div>

          <button className="btn" onClick={handleNewSession}>
            Limpiar chat
          </button>
        </header>

        {!hasMessages && !isBlocked && (
          <div className="panel">
            <p className="small" style={{ margin: 0 }}>
              Escribí. Sin buscar utilidad.
            </p>
          </div>
        )}

        <div className="chat">
          {messages.map((m, idx) => {
            const isSilence = m.role === "cero" && m.content.trim() === "—";

            return (
              <div key={idx} className={`row ${m.role}`}>
                <div className={`bubble ${isSilence ? "silence" : ""}`}>
                  {m.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="row cero">
              <div className="bubble" style={{ opacity: 0.7 }}>
                {COPY.loading}
              </div>
            </div>
          )}

          {error && (
            <div className="row cero">
              <div className="bubble" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                {error}
              </div>
            </div>
          )}

          {/* Mensajes de bloqueo / fin de sesión */}
          {isBlocked && (
            <div className="row cero">
              <div className="bubble" style={{ borderColor: "var(--gold)", color: "var(--gold)", background: "rgba(214,168,74,0.05)" }}>
                {isCooldown ? (
                  <>
                    {COPY.sessionClosed}<br />
                    Próxima sesión en: {formatNextSession(session.nextSessionAt!)}
                  </>
                ) : (
                  "Cerrando sesión..."
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Composer con contadores */}
        <form className="composer" onSubmit={handleSubmit} style={{ position: "relative" }}>

          {/* Overlay de bloqueo */}
          {isBlocked && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(11, 11, 15, 0.8)",
              backdropFilter: "blur(2px)",
              zIndex: 10,
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontSize: "13px",
              textAlign: "center",
              padding: "0 20px"
            }}>
              {isCooldown
                ? COPY.sessionClosed
                : "Sesión finalizada."}
            </div>
          )}

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            {/* Contadores (solo visibles si hay sesión activa y no está bloqueado) */}
            {session.startedAt && !isBlocked && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
                color: "var(--muted)",
                padding: "0 4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                <span>Mensajes restantes: {messagesLeft}</span>
                <span>Tiempo: {formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Aviso de último mensaje */}
            {messagesLeft === 1 && !isBlocked && (
              <div style={{ fontSize: "11px", color: "var(--gold)", padding: "0 4px" }}>
                Queda un mensaje.
              </div>
            )}

            <textarea
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isBlocked ? "" : COPY.placeholder}
              rows={1}
              disabled={isBlocked}
            />
          </div>

          <button
            className="btn primary"
            type="submit"
            disabled={loading || !input.trim() || isBlocked}
            style={{ alignSelf: "flex-end" }}
          >
            {loading ? COPY.loading : COPY.send}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
