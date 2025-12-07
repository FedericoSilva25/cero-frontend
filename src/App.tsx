// src/App.tsx

import { useState } from "react";
import "./styles.css";

const API_URL =
  import.meta.env.VITE_CERO_API_URL ?? "http://localhost:4000/reflect";

function App() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setReply(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        setReply("Error de conexión.");
        return;
      }

      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      console.error(err);
      setReply("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewReflection() {
    setText("");
    setReply(null);
  }

  return (
    <div className="cero-root">
      <form className="cero-form" onSubmit={handleSubmit}>
        <input
          className="cero-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        /* SIN placeholder, por diseño */
        />
      </form>

      <div className="cero-response-area">
        {loading && <div className="cero-loading"></div>}

        {!loading && reply && (
          <>
            <div className="cero-reply">{reply}</div>
            <button
              type="button"
              className="cero-button"
              onClick={handleNewReflection}
            >
              Nuevo reflejo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
