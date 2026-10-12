import { useEffect, useRef, type ReactNode } from "react";

import { START_COPY } from "./flow-copy";

type StartCopy = {
  readonly kicker: string;
  readonly title: string;
  readonly lead: string;
  readonly metaDescription: string;
  readonly points: readonly string[];
  readonly cta: string;
};

/** Encabezado de pantalla que recibe el foco al aparecer, para que el lector de pantalla anuncie el cambio. */
function FocusHeading({ children, id }: { children: ReactNode; id: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return <h1 className="df-screen__title" id={id} ref={ref} tabIndex={-1}>{children}</h1>;
}

export function StartScreen({ onStart, copy = START_COPY }: { onStart: () => void; copy?: StartCopy }) {
  return (
    <section aria-labelledby="df-start-title" className="df-screen df-start">
      <p className="df-screen__kicker">{copy.kicker}</p>
      <h1 className="df-screen__title df-start__title" id="df-start-title">{copy.title}</h1>
      <p className="df-screen__lead">{copy.lead}</p>
      <ul className="df-start__points">{copy.points.map((point) => <li key={point}>{point}</li>)}</ul>
      <div className="df-screen__actions">
        <button className="button button--primary df-start__cta" onClick={onStart} type="button">{copy.cta}</button>
      </div>
      <p className="df-screen__aside">Puedes leer <a href="/privacidad">cómo tratamos la información</a>.</p>
    </section>
  );
}

export function ResumeScreen({ answered, completed, onContinue, onRestart }: { answered: number; completed: boolean; onContinue: () => void; onRestart: () => void }) {
  return (
    <section aria-labelledby="df-resume-title" className="df-screen df-resume">
      <FocusHeading id="df-resume-title">{completed ? "Ya tienes un diagnóstico completado en este navegador" : "Tienes un diagnóstico sin terminar"}</FocusHeading>
      <p className="df-screen__lead">
        {completed
          ? "Puedes volver a ver tu resultado o empezar uno nuevo."
          : `Respondiste ${answered === 1 ? "1 pregunta" : `${answered} preguntas`}. Puedes seguir donde lo dejaste o empezar de nuevo.`}
      </p>
      <div className="df-screen__actions">
        <button className="button button--primary" onClick={onContinue} type="button">{completed ? "Ver mi resultado" : "Continuar diagnóstico"}</button>
        <button className="button button--secondary" onClick={onRestart} type="button">Empezar de nuevo</button>
      </div>
    </section>
  );
}

export function ReadyScreen({ onShowResult, onReview, terminalReason, anonymousSummary = false }: { onShowResult: () => void; onReview: () => void; terminalReason?: "evidence_sufficient" | "no_useful_questions" | "absolute_hard_cap_reached" | "deepening_required" | null; anonymousSummary?: boolean }) {
  const limited = terminalReason === "no_useful_questions";
  const capped = terminalReason === "absolute_hard_cap_reached";
  return (
    <section aria-labelledby="df-ready-title" className="df-screen df-ready">
      <FocusHeading id="df-ready-title">{limited ? "Ya reunimos una lectura útil de tu situación." : capped ? "Hemos llegado al límite de preguntas de esta sesión." : "Listo. Ya tenemos suficiente información para preparar tu diagnóstico."}</FocusHeading>
      <p className="df-screen__lead">{anonymousSummary ? "Recibirás una lectura breve, el alcance de la evidencia y un primer paso. No necesitas identificarte." : limited ? "Algunas áreas no tenían una pregunta útil adicional; tu resultado explicará ese alcance." : capped ? "Prepararemos el resultado con la evidencia reunida y señalaremos cualquier límite de cobertura." : "Verás cómo está tu presencia digital, qué funciona, qué te frena, por dónde empezar y qué tipo de ayuda podría servirte."}</p>
      <div className="df-screen__actions">
        <button className="button button--primary" onClick={onShowResult} type="button">Ver mi resultado</button>
        <button className="button button--secondary" onClick={onReview} type="button">Revisar mi última respuesta</button>
      </div>
    </section>
  );
}

export function PreparingScreen() {
  return (
    <section aria-busy="true" aria-labelledby="df-preparing-title" className="df-screen df-preparing">
      <FocusHeading id="df-preparing-title">Preparando tu diagnóstico…</FocusHeading>
    </section>
  );
}

export function FlowErrorScreen({ title, message, onRetry, onRestart }: { title: string; message: string; onRetry: () => void; onRestart: () => void }) {
  return (
    <section aria-labelledby="df-error-title" className="df-screen df-error" role="alert">
      <FocusHeading id="df-error-title">{title}</FocusHeading>
      <p className="df-screen__lead">{message}</p>
      <div className="df-screen__actions">
        <button className="button button--primary" onClick={onRetry} type="button">Reintentar</button>
        <button className="button button--secondary" onClick={onRestart} type="button">Empezar de nuevo</button>
      </div>
    </section>
  );
}

/** Confirmación en línea (sin `window.confirm`): reiniciar borra respuestas y progreso de este navegador. */
export function ResetConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div aria-labelledby="df-reset-text" className="df-reset" role="group">
      <p id="df-reset-text" ref={ref} tabIndex={-1}>¿Empezar de nuevo? Se borrarán tus respuestas y tu progreso en este navegador.</p>
      <div className="df-screen__actions">
        <button className="button button--danger" onClick={onConfirm} type="button">Sí, empezar de nuevo</button>
        <button className="button button--secondary" onClick={onCancel} type="button">Cancelar</button>
      </div>
    </div>
  );
}
