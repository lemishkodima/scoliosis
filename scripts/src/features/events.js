import { qs } from "../core/dom.js";

function createEventCard(event) {
  const card = document.createElement("article");
  card.className = "event-card";

  if (event.image) {
    const media = document.createElement("figure");
    media.className = "event-card-media";

    const image = document.createElement("img");
    image.src = event.image;
    image.alt = event.imageAlt || event.title || "Подія Асоціації сколіозу України";
    image.loading = "lazy";
    image.decoding = "async";

    media.append(image);
    card.append(media);
  }

  const body = document.createElement("div");
  body.className = "event-card-body";

  const meta = document.createElement("p");
  meta.className = "event-card-date";
  meta.textContent = event.date || "Дата уточнюється";

  const title = document.createElement("h2");
  title.textContent = event.title || "Подія Асоціації";

  const description = document.createElement("p");
  description.className = "event-card-description";
  description.textContent = event.description || "";

  body.append(meta, title);
  if (description.textContent) body.append(description);

  if (event.registrationUrl) {
    const link = document.createElement("a");
    link.className = "primary-button event-card-link";
    link.href = event.registrationUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Зареєструватися";
    body.append(link);
  }

  card.append(body);
  return card;
}

export function initEventsPage() {
  const list = qs("[data-events-list]");
  const empty = qs("[data-events-empty]");

  if (!list) {
    return {
      getState: () => ({ mounted: false }),
    };
  }

  fetch("data/events.json", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : []))
    .then((events) => {
      if (!Array.isArray(events) || events.length === 0) {
        empty?.removeAttribute("hidden");
        return;
      }

      list.replaceChildren(...events.map(createEventCard));
      empty?.setAttribute("hidden", "");
    })
    .catch(() => {
      empty?.removeAttribute("hidden");
    });

  return {
    getState: () => ({ mounted: true }),
  };
}
