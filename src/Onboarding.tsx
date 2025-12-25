import { useState } from "react";

interface OnboardingProps {
    onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [fading, setFading] = useState(false);

    const handleNext = () => {
        setFading(true);
        setTimeout(() => {
            setStep((prev) => prev + 1);
            setFading(false);
        }, 400); // 400ms fade out
    };

    const handleEnter = () => {
        setFading(true);
        setTimeout(() => {
            onComplete();
        }, 400);
    };

    const handleExit = () => {
        window.location.href = "https://google.com"; // O cerrar pestaña
    };

    const renderContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h1 className="title">CERO</h1>
                        <h2 className="subtitle" style={{ fontSize: '14px', marginTop: '-20px' }}>No hay respuestas. Solo espejo.</h2>
                        <div className="text-block">
                            <p>Esto es una app para hablar conmigo mismo sin atajos.</p>
                            <br />
                            <p>Si me paro frente a un espejo real, interfieren el ego, el pasado, patrones, excusas.</p>
                            <p>Si hablo con un psicólogo, aparecen las mismas trabas, más el método del profesional y mis experiencias previas.</p>
                            <p>Si uso una IA común, puedo sabotear la experiencia: pedir consejos, pedir soluciones, exigir que sea guía espiritual, terapeuta o gurú… y vuelvo a escapar.</p>
                            <br />
                            <p><strong>CERO corta eso.</strong></p>
                            <br />
                            <p>Acá no vengo a resolver.</p>
                            <p>Vengo a ver.</p>
                        </div>
                        <button className="btn primary" onClick={handleNext}>
                            Seguir
                        </button>
                    </>
                );
            case 2:
                return (
                    <>
                        <h2 className="subtitle">Regla CERO</h2>
                        <div className="text-block">
                            <p><strong>CERO no responde preguntas prácticas.</strong></p>
                            <p>Devuelve preguntas que me devuelven a mí.</p>
                        </div>
                        <button className="btn primary" onClick={handleNext}>
                            Entiendo
                        </button>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className="text-block">
                            <p>Si entro, acepto que:</p>
                            <br />
                            <ul className="list-none">
                                <li>no voy a recibir contención,</li>
                                <li>no voy a recibir claridad inmediata,</li>
                                <li>no voy a usar CERO para evitar la verdad.</li>
                            </ul>
                            <br />
                            <p>Si algo se mueve, es porque ya estaba en mí.</p>
                        </div>
                        <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="btn primary" onClick={handleEnter}>
                                Entrar
                            </button>
                            <button className="btn" onClick={handleExit}>
                                No, salir
                            </button>
                            <p className="small" style={{ textAlign: 'center', opacity: 0.5 }}>Accedés bajo tu propia responsabilidad.</p>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="cero-app onboarding">
            <div className={`shell fade-container ${fading ? "out" : "in"}`}>
                <div className="panel center-content">{renderContent()}</div>
            </div>
        </div>
    );
}
