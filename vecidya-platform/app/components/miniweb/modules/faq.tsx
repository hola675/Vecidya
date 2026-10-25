import type { BusinessFaqItem } from "../../../features/miniweb/content";

export function FaqModule({ items }: { items: readonly BusinessFaqItem[] }) {
  const visibleItems = items.filter((item) => item.isActive && item.question.trim() && item.answer.trim());
  if (!visibleItems.length) return null;
  return (
    <section aria-label="Preguntas frecuentes" className="miniweb-faq">
      <h2>Preguntas frecuentes</h2>
      <dl>
        {visibleItems.map((item, index) => (
          <div className="miniweb-faq__item" key={`${item.sortOrder}-${index}`}>
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
