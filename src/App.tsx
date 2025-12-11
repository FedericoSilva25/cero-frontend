import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "cero";
  content: string;
};

const API_URL = import.meta.env.VITE_CERO_API_URL;

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto–scroll al último mensaje
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError(null);

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
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const answer: string =
        data?.answer ??
        data?.content ??
        "No apareció respuesta esta vez. Mirá qué pasa en vos cuando no hay reflejo.";

      setMessages((prev) => [...prev, { role: "cero", content: answer }]);
    } catch (err) {
      console.error(err);
      setError(
        "No apareció respuesta esta vez. ¿Qué se mueve en vos cuando lo externo falla?"
      );
      // No agregamos mensaje de CERO si hay error; solo mostramos el estado de error
    } finally {
      setLoading(false);
    }
  }

  function handleNewSession() {
    // Borramos solo la sesión actual
    setMessages([]);
    setInput("");
    setError(null);
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-4xl flex items-center justify-between mb-6">
        <div>
          <h1 className="text-sm tracking-[0.4em] text-[#f7d48b]">
            C E R O
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            No hay respuestas. Solo el reflejo de lo que ya estás diciendo.
          </p>
        </div>

        <button
          onClick={handleNewSession}
          className="text-xs border border-[#f7d48b33] text-[#f7d48b] px-3 py-1.5 rounded-full hover:bg-[#f7d48b11] transition"
        >
          Nueva sesión
        </button>
      </header>

      <main className="w-full max-w-4xl flex-1 flex flex-col gap-4">
        {/* Guía de uso (solo cuando no hay mensajes aún) */}
        {!hasMessages && (
          <section className="rounded-2xl bg-gradient-to-br from-[#111218] to-[#06070a] border border-[#f7d48b22] p-5 mb-2">
            <h2 className="text-sm font-medium text-slate-100 mb-2">
              Cómo usar CERO
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              No vengas a buscar soluciones. Traé la forma real en la que te
              estás diciendo algo.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• “Siento miedo cuando pienso en cambiar de trabajo.”</li>
              <li>• “No soporto mi propia indecisión.”</li>
              <li>• “Quiero avanzar pero siempre vuelvo al mismo lugar.”</li>
            </ul>
            <p className="text-[11px] text-slate-500 mt-3">
              Escribí sin corregir. CERO no responde qué hacer; solo muestra la
              estructura de eso que ya está pasando.
            </p>
          </section>
        )}

        {/* Zona de conversación */}
        <section className="flex-1 rounded-3xl bg-gradient-to-br from-[#0b0c11] to-[#05050a] border border-[#151623] shadow-[0_0_60px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user"
                      ? "bg-[#181926] text-slate-100"
                      : "bg-[#05060b] border border-[#f7d48b33] text-slate-100"
                    }`}
                >
                  <div className="text-[10px] tracking-[0.2em] uppercase mb-1 text-[#f7d48bcc]">
                    {m.role === "user" ? "VOS" : "CERO"}
                  </div>
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-xs text-slate-500 mt-2">
                Mirando la forma…
              </div>
            )}

            {error && (
              <div className="text-xs text-amber-400 mt-2">{error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[#151623] px-6 py-4 flex flex-col gap-2 bg-[#05060b]/80 backdrop-blur"
          >
            <label
              htmlFor="input"
              className="text-[11px] text-slate-500 mb-0.5"
            >
              Decilo acá, sin corregirlo.
            </label>
            <div className="flex gap-3 items-end">
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                className="flex-1 resize-none rounded-2xl bg-[#0b0c11] border border-[#1c1d2a] focus:border-[#f7d48b66] outline-none px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                placeholder="Traé la frase tal como aparece en vos ahora."
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="min-w-[110px] rounded-full bg-[#f7d48b] text-[#151623] text-sm font-medium px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f9dda1] transition"
              >
                {loading ? "Reflejando…" : "Reflejar"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
