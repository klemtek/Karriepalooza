const STORY_PASSWORD = "karrie70";
const STORY_STORAGE_KEY = "karriepalooza-stories";
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
const unlockForm = document.querySelector("#unlockForm");
const unlockStatus = document.querySelector("#unlockStatus");
const storyBoard = document.querySelector("#storyBoard");
const storyPassword = document.querySelector("#storyPassword");
const shirtSize = document.querySelector("#shirtSize");
const shirtChoices = document.querySelectorAll('input[name="T-shirt requested"]');

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
  unlockStatus.textContent = "Unlocked. Enjoy the story board.";
  unlockForm.reset();
  renderStories();
}

function routeFormToHost(form) {
  const recipient = atob(form.dataset.recipient);
  form.action = `${FORM_ENDPOINT}${recipient}`;
}

renderStories();

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
  const story = rsvpForm.elements["Funny Story to post"].value.trim();

  if (name && story) {
    saveStory(name, story);
    if (!storyBoard.classList.contains("locked")) {
      renderStories();
    }
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
