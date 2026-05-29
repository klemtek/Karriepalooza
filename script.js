const STORY_PASSWORD = "karrie70";
const STORY_STORAGE_KEY = "karriepalooza-stories";
const RSVP_STORAGE_KEY = "karriepalooza-rsvps";
const RSVP_DATA_URL = "data/rsvps.json";
const FORM_ENDPOINT = "https://formsubmit.co/";

const seedStories = [
  {
    name: "Jen",
    story: "The time Karrie tried to parallel park a boat still deserves its own documentary.",
  },
  {
    name: "Mike",
    story: "Remember that dance move at weddings? Iconic. Absolutely iconic.",
  },
  {
    name: "Sarah",
    story: "Karrie's one-liners could fill a book. Here's one for the history books.",
  },
];

const rsvpForm = document.querySelector("#rsvpForm");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const contactStatus = document.querySelector("#contactStatus");
const rsvpCc = document.querySelector("#rsvpCc");
const unlockForm = document.querySelector("#unlockForm");
const unlockStatus = document.querySelector("#unlockStatus");
const storyBoard = document.querySelector("#storyBoard");
const storyPassword = document.querySelector("#storyPassword");
const shirtSize = document.querySelector("#shirtSize");
const shirtChoices = document.querySelectorAll('input[name="T-shirt requested"]');
const guestList = document.querySelector("#guestList");
const guestListSummary = document.querySelector("#guestListSummary");
let publishedRsvps = [];

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function getSavedStories() {
  try {
    return JSON.parse(localStorage.getItem(STORY_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveStory(name, story) {
  const savedStories = getSavedStories();
  savedStories.unshift({
    name,
    story,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(savedStories.slice(0, 20)));
}

function getSavedRsvps() {
  try {
    return JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRsvp(record) {
  const savedRsvps = getSavedRsvps();
  savedRsvps.unshift(record);
  localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(savedRsvps.slice(0, 50)));
}

function getRsvpKey(record) {
  return [record.name, record.guests, record.submittedAt].join("|").toLowerCase();
}

function mergeRsvps(records) {
  const seen = new Set();
  return records.filter((record) => {
    const key = getRsvpKey(record);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function renderGuestList() {
  const rsvps = mergeRsvps([...getSavedRsvps(), ...publishedRsvps])
    .filter((record) => record.name)
    .sort((a, b) => String(b.submittedAt || "").localeCompare(String(a.submittedAt || "")));
  const totalGuests = rsvps.reduce((total, record) => total + (Number(record.guests) || 0), 0);

  if (!rsvps.length) {
    guestListSummary.textContent = "No RSVPs yet";
    guestList.innerHTML = '<p class="guest-list-empty">The guest list will appear here after RSVPs come in.</p>';
    return;
  }

  const rsvpWord = rsvps.length === 1 ? "RSVP" : "RSVPs";
  const guestWord = totalGuests === 1 ? "guest" : "guests";
  guestListSummary.textContent = `${rsvps.length} ${rsvpWord} / ${totalGuests} ${guestWord}`;
  guestList.innerHTML = rsvps
    .map(
      (record) => `
        <article class="guest-row" role="listitem">
          <strong>${escapeHtml(record.name)}</strong>
          <span>${Number(record.guests) || 1} attending</span>
        </article>
      `,
    )
    .join("");
}

async function loadPublishedRsvps() {
  try {
    const response = await fetch(RSVP_DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("No published RSVP export yet.");
    }
    const payload = await response.json();
    publishedRsvps = Array.isArray(payload) ? payload : payload.rsvps || [];
  } catch {
    publishedRsvps = [];
  }

  renderGuestList();
}

function getRsvpRecordFromForm() {
  return {
    id: `local-${Date.now()}`,
    name: rsvpForm.elements.Name.value.trim(),
    guests: rsvpForm.elements["Total guests attending"].value.trim(),
    shirtRequested: rsvpForm.elements["T-shirt requested"].value,
    shirtSize: shirtSize.value,
    submittedAt: new Date().toISOString(),
  };
}

function renderStories() {
  const stories = [...getSavedStories(), ...seedStories];
  storyBoard.innerHTML = stories
    .map(
      ({ name, story }) => `
        <article class="story-card">
          <p>&ldquo;${escapeHtml(story)}&rdquo;</p>
          <span>&mdash; ${escapeHtml(name)}</span>
        </article>
      `,
    )
    .join("");
}

function unlockStories() {
  storyBoard.classList.remove("locked");
  sessionStorage.setItem("karriepalooza-board-unlocked", "true");
  unlockStatus.textContent = "Unlocked. Enjoy the guest book.";
  unlockForm.reset();
  renderStories();
}

function routeFormToHost(form) {
  const recipient = atob(form.dataset.recipient);
  form.action = `${FORM_ENDPOINT}${recipient}`;

  if (form === rsvpForm && rsvpCc) {
    rsvpCc.value = atob(rsvpForm.dataset.cc);
  }
}

renderStories();
loadPublishedRsvps();

if (sessionStorage.getItem("karriepalooza-board-unlocked") === "true") {
  unlockStories();
}

function updateShirtSizeState() {
  const wantsShirt = rsvpForm.elements["T-shirt requested"].value === "Yes";
  shirtSize.disabled = !wantsShirt;
  shirtSize.required = wantsShirt;

  if (!wantsShirt) {
    shirtSize.value = "";
  }
}

shirtChoices.forEach((choice) => {
  choice.addEventListener("change", updateShirtSizeState);
});

updateShirtSizeState();

rsvpForm.addEventListener("submit", () => {
  routeFormToHost(rsvpForm);

  const name = rsvpForm.elements.Name.value.trim();
  const story = rsvpForm.elements["Guest Book message"].value.trim();
  const rsvpRecord = getRsvpRecordFromForm();

  if (name && story) {
    saveStory(name, story);
    if (!storyBoard.classList.contains("locked")) {
      renderStories();
    }
  }

  if (rsvpRecord.name) {
    saveRsvp(rsvpRecord);
    renderGuestList();
  }

  formStatus.textContent = "Thanks. Your RSVP is being sent to the host.";

  window.setTimeout(() => {
    formStatus.textContent = "RSVP sent. Thanks for helping keep the surprise alive.";
    rsvpForm.reset();
    updateShirtSizeState();
  }, 1200);
});

contactForm.addEventListener("submit", () => {
  routeFormToHost(contactForm);
  contactStatus.textContent = "Thanks. Your question is being sent to the host.";

  window.setTimeout(() => {
    contactStatus.textContent = "Question sent. Thanks for keeping the surprise smooth.";
    contactForm.reset();
  }, 1200);
});

unlockForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (storyPassword.value.trim() === STORY_PASSWORD) {
    unlockStories();
    return;
  }

  unlockStatus.textContent = "Password did not match. Try again.";
  storyPassword.select();
});
