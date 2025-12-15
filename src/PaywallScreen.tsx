import { useState } from "react";

interface PaywallProps {
    onSubscribe: () => void;
}

export default function PaywallScreen({ onSubscribe }: PaywallProps) {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = () => {
        setLoading(true);
        // Simulación de delay de red/proceso de pago
        setTimeout(() => {
            onSubscribe();
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="cero-app">
            <div className="shell" style={{ maxWidth: "480px", textAlign: "center", justifyContent: "center", minHeight: "80vh" }}>

                <div className="panel" style={{ padding: "40px 24px", display: "flex", flexDirection: "column", gap: "32px" }}>

                    <div className="brand">
                        <h1 style={{ fontSize: "16px", color: "var(--gold)", letterSpacing: "0.2em", marginBottom: "8px" }}>
                            ESTO NO ES UNA APP DE AYUDA
                        </h1>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "var(--text)", fontSize: "15px", lineHeight: "1.6" }}>
                        <p>
                            CERO no responde preguntas prácticas.<br />
                            No da consejos.<br />
                            No explica lo que te pasa.
                        </p>
                        <p>
                            No vas a sentir contención.<br />
                            No vas a recibir claridad inmediata.
                        </p>
                        <p style={{ color: "var(--muted)" }}>
                            Si estás buscando alivio, guía o respuestas, no continúes.
                        </p>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <h3 style={{ margin: 0, fontSize: "14px", color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Advertencia
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
                            Acá no hay progreso, historial ni acompañamiento.<br />
                            Solo reflejo.
                        </p>
                        <p style={{ fontSize: "14px", color: "var(--text)", margin: 0, fontStyle: "italic" }}>
                            Si algo se mueve, es porque ya estaba en vos.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                            <p style={{ margin: "0 0 4px 0" }}>El acceso es por suscripción mensual.</p>
                            <p style={{ margin: "0 0 4px 0" }}>No hay prueba gratis.</p>
                            <p style={{ margin: 0 }}>No hay versiones premium.</p>
                        </div>

                        <p style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>
                            Entrás bajo tu propia responsabilidad.
                        </p>

                        <button
                            onClick={handleSubscribe}
                            className="btn primary"
                            style={{ width: "100%", padding: "16px", fontSize: "16px", marginTop: "8px" }}
                            disabled={loading}
                        >
                            {loading ? "Procesando..." : "Entrar a CERO"}
                        </button>

                        <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "8px" }}>
                            USD 7.99 / mes · Cancelás cuando quieras
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
