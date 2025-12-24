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
                        <h1 className="title">Esto no es una app de ayuda.</h1>
                        <div className="text-block">
                            <p>CERO no aconseja.</p>
                            <p>No explica lo que te pasa.</p>
                            <p>No te dice qué hacer.</p>
                            <br />
                            <p>No vas a encontrar alivio, claridad ni guía.</p>
                            <br />
                            <p>Si eso es lo que estás buscando, no continúes.</p>
                        </div>
                        <button className="btn primary" onClick={handleNext}>
                            Seguir
                        </button>
                    </>
                );
            case 2:
                return (
                    <>
                        <div className="text-block">
                            <p>CERO es un espacio para hablar con uno mismo</p>
                            <p>sin intermediarios.</p>
                            <br />
                            <p>No hay terapeutas.</p>
                            <p>No hay espiritualidad.</p>
                            <p>No hay inteligencia que piense por vos.</p>
                            <br />
                            <p>Solo preguntas que no te dejan escapar.</p>
                        </div>
                        <button className="btn primary" onClick={handleNext}>
                            Seguir
                        </button>
                    </>
                );
            case 3:
                return (
                    <>
                        <h2 className="subtitle">Regla CERO</h2>
                        <div className="text-block">
                            <p>En CERO no se permite delegar la propia conciencia.</p>
                            <br />
                            <p>Nada de lo que ocurra acá sirve para:</p>
                            <ul className="list-none">
                                <li>– recibir consejos</li>
                                <li>– buscar guía</li>
                                <li>– obtener validación</li>
                                <li>– explicar lo que sentís</li>
                                <li>– evitar una decisión personal</li>
                            </ul>
                            <br />
                            <p>Si algo tranquiliza, ordena o explica, queda afuera.</p>
                        </div>
                        <button className="btn primary" onClick={handleNext}>
                            Entiendo
                        </button>
                    </>
                );
            case 4:
                return (
                    <>
                        <div className="text-block">
                            <p>Al entrar aceptás no usar este espacio</p>
                            <p>para sentirte mejor.</p>
                            <br />
                            <p>Aceptás no pedir que alguien más cargue con el peso.</p>
                            <br />
                            <p>Si algo incomoda, no se suaviza.</p>
                            <p>Si algo confunde, no se aclara.</p>
                            <br />
                            <p>Nada se empuja.</p>
                            <p>Nada se arregla.</p>
                        </div>
                        <button className="btn primary" onClick={handleNext}>
                            Acepto entrar
                        </button>
                    </>
                );
            case 5:
                return (
                    <>
                        <div className="text-block">
                            <p>No hay garantías.</p>
                            <p>No hay progreso.</p>
                            <p>No hay contención.</p>
                            <br />
                            <p>Podés irte ahora.</p>
                            <p>O podés entrar.</p>
                        </div>
                        <div className="actions">
                            <button className="btn primary" onClick={handleEnter}>
                                Entrar a CERO
                            </button>
                            <button className="btn text-only" onClick={handleExit}>
                                Salir
                            </button>
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
