import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

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
        body: JSON.stringify({ text: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const reply = data?.reply;

      if (typeof reply !== "string" || reply.trim().length === 0) {
        throw new Error("Backend reply inválido");
      }

      setMessages((prev) => [...prev, { role: "cero", content: reply }]);
    } catch (err) {
      console.error("CERO fetch error:", err);
      setError("Error de conexión con el backend. Reintentá.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewSession() {
    setMessages([]);
    setInput("");
    setError(null);
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="cero-app">
      <div className="shell">
        <header className="header">
          <div className="brand">
            <h1>C E R O</h1>
            <p>No hay respuestas. Solo el reflejo de lo que ya estás diciendo.</p>
          </div>

          <button className="btn" onClick={handleNewSession}>
            Nueva sesión
          </button>
        </header>

        {!hasMessages && (
          <div className="panel help">
            <h2>Cómo usar CERO</h2>
            <p>
              No vengas a buscar soluciones. Traé la forma real en la que te
              estás diciendo algo.
            </p>
            <ul>
              <li>“Siento miedo cuando pienso en cambiar de trabajo.”</li>
              <li>“No soporto mi propia indecisión.”</li>
              <li>“Quiero avanzar pero siempre vuelvo al mismo lugar.”</li>
            </ul>
            <p className="small">
              Escribí sin corregir. CERO no responde qué hacer; solo muestra la
              estructura de lo que ya está pasando.
            </p>
          </div>
        )}

        <div className="chat">
          {messages.map((m, idx) => (
            <div key={idx} className={`row ${m.role}`}>
              <div className="bubble">{m.content}</div>
            </div>
          ))}

          {loading && (
            <div className="row cero">
              <div className="bubble" style={{ opacity: 0.7 }}>
                Mirando la forma...
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

          <div ref={bottomRef} />
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Decilo acá, sin corregir."
            rows={1}
          />
          <button
            className="btn primary"
            type="submit"
            disabled={loading || !input.trim()}
          >
            {loading ? "..." : "Reflejar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
