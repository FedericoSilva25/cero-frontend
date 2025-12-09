import { useState } from "react";
import type { FormEvent } from "react";
import "./styles.css";

type Turn = {
  id: number;
  user: string;
  cero: string;
};

const API_URL =
  import.meta.env.VITE_CERO_API_URL ?? "http://localhost:4000/reflect";

function App() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Error en la respuesta");
      }

      const data = await res.json();
      const reply: string =
        typeof data.reply === "string" && data.reply.trim().length > 0
          ? data.reply.trim()
          : "Error de conexión.";

      setTurns((prev) => [
        ...prev,
        {
          id: Date.now(),
          user: text,
          cero: reply,
        },
      ]);

      setInput("");
    } catch (err) {
      console.error(err);
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    setTurns([]);
    setInput("");
    setError(null);
  };

  return (
    <div className="cero-root">
      <main className="cero-shell">
        <header className="cero-header">
          <div>
            <h1 className="cero-title">CERO</h1>
            <p className="cero-subtitle">
              No hay respuestas. Solo el reflejo de lo que ya estás diciendo.
            </p>
          </div>
          <button
            type="button"
            className="cero-reset"
            onClick={handleNewSession}
            disabled={loading || turns.length === 0}
          >
            Nueva sesión
          </button>
        </header>

        <section className="cero-card">
          <div className="cero-log">
            {turns.length === 0 && (
              <p className="cero-placeholder">
                Escribí lo que está pasando adentro tuyo. CERO solo va a
                devolver la forma que ya tiene eso.
              </p>
            )}

            {turns.map((turn) => (
              <div key={turn.id} className="cero-turn">
                <div className="cero-bubble cero-bubble-user">
                  <span className="cero-label">Vos</span>
                  <p>{turn.user}</p>
                </div>
                <div className="cero-bubble cero-bubble-cero">
                  <span className="cero-label">CERO</span>
                  <p>{turn.cero}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="cero-bubble cero-bubble-cero">
                <span className="cero-label">CERO</span>
                <div className="cero-loading"></div>
              </div>
            )}
          </div>

          <form className="cero-form" onSubmit={handleSubmit}>
            <textarea
              className="cero-input"
              placeholder="Decilo acá, sin corregirlo."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
            />
            <div className="cero-form-footer">
              {error && <span className="cero-error">{error}</span>}
              <button
                type="submit"
                className="cero-submit"
                disabled={loading || !input.trim()}
              >
                {loading ? "Reflejando..." : "Reflejar"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
