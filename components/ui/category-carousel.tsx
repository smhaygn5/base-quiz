"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/app/i18n/context";

export type CategoryCarouselItem = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  image: string;
  description: string;
  questionCount: number;
};

type CategoryCarouselProps = {
  items: CategoryCarouselItem[];
  onStart: (categoryId: string) => void;
  onBack: () => void;
};

function signedDistance(index: number, active: number, length: number) {
  let distance = index - active;
  if (distance > length / 2) distance -= length;
  if (distance < -length / 2) distance += length;
  return distance;
}

export function CategoryCarousel({ items, onStart, onBack }: CategoryCarouselProps) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);

  if (items.length === 0) return null;

  const activeItem = items[active];
  const showNext = () => setActive((current) => (current + 1) % items.length);
  const showPrevious = () => setActive((current) => (current - 1 + items.length) % items.length);

  return (
    <section
      className="category-carousel-shell"
      aria-labelledby="category-carousel-title"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") showPrevious();
        if (event.key === "ArrowRight") showNext();
      }}
    >
      <div className="category-stack-wrap" aria-live="polite">
        <div className="category-stack">
          {items.map((item, index) => {
            const distance = signedDistance(index, active, items.length);
            const depth = Math.abs(distance);
            const isActive = index === active;
            const isVisible = depth <= 2;

            return (
              <div
                key={item.id}
                className={`category-image-card${isActive ? " is-active" : ""}`}
                aria-hidden={!isActive}
                style={{
                  zIndex: isActive ? 10 : 8 - depth,
                  opacity: isActive ? 1 : isVisible ? 0.72 - depth * 0.1 : 0,
                  transform: `translate3d(${distance * 30}px, ${depth * 15}px, 0) rotate(${distance * 5.5}deg) scale(${1 - depth * 0.035})`,
                  filter: isActive ? "none" : "saturate(0.72) brightness(0.76)",
                }}
              >
                <Image
                  src={item.image}
                  alt={isActive ? t("category.imageAlt", { category: item.name }) : ""}
                  fill
                  sizes="(max-width: 760px) 86vw, 430px"
                  priority={index === 0}
                  draggable={false}
                  className="category-image"
                />
                {isActive && (
                  <div className="category-image-badge" style={{ borderColor: item.color }}>
                    <span style={{ color: item.color }}>{item.emoji}</span>
                    {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="category-details">
        <div key={activeItem.id} className="category-details-enter">
          <p className="category-kicker">{t("category.pick")}</p>
          <h1 id="category-carousel-title" className="category-name">
            {activeItem.name}
          </h1>
          <p className="category-meta" style={{ color: activeItem.color }}>
            {t("category.meta", { count: activeItem.questionCount })}
          </p>
          <p className="category-description">{activeItem.description}</p>
          <button
            type="button"
            className="category-start-button"
            onClick={() => onStart(activeItem.id)}
          >
            {t("category.start", { category: activeItem.name })} <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="category-controls">
          <button type="button" onClick={showPrevious} aria-label={t("category.previous")}>
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" onClick={showNext} aria-label={t("category.next")}>
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="category-back-button" onClick={onBack}>
            {t("common.back")}
          </button>
        </div>
      </div>
    </section>
  );
}
