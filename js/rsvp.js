// -----------------------------------------------------------------------
// RSVP guest-list matching + submission to Google Sheets (via Apps Script)
// -----------------------------------------------------------------------

// GUEST LIST — pulled from the "18th Birthday Guest List" Google Sheet.
// "seats" = 1 (themselves) + their allotted additional guest count.
// Guests can type just part of their name — matching checks that every word
// they typed appears somewhere in the full name, in any order.
const GUEST_LIST_RAW = [
  // Immediate Family
  { displayName: "Mama", seats: 4 },
  { displayName: "Papa", seats: 1 },
  { displayName: "Ate Claire", seats: 1 },
  { displayName: "Ate Chette", seats: 1 },
  { displayName: "Lean James Ayap", seats: 1 },
  { displayName: "Ate Shane", seats: 2 },
  { displayName: "Marione Arthur Perez", seats: 2 },

  // Friends
  { displayName: "Kelly Allyson Anyayahan", seats: 1 },
  { displayName: "Aurora Isabel Padrique", seats: 1 },
  { displayName: "Patricia Nicole Ricafort", seats: 1 },
  { displayName: "Prince Mathew Bagon", seats: 1 },
  { displayName: "Julz Vharron Maranan", seats: 1 },
  { displayName: "Antonio Miguel Briones", seats: 1 },
  { displayName: "Rhyle Shannon Aguda", seats: 1 },
  { displayName: "Francesca Miel Panganiban", seats: 1 },
  { displayName: "Daniella Louise Gajo", seats: 1 },
  { displayName: "Stephanie Alba", seats: 1 },
  { displayName: "Reign Elizandra Balitaan", seats: 1 },
  { displayName: "Joaquim Miguel Dolar", seats: 1 },
  { displayName: "John Eric Ronquillo", seats: 1 },
  { displayName: "Peter Wang", seats: 1 },
  { displayName: "Faith Rianne Evangelista", seats: 1 },
  { displayName: "Safrance Catzon", seats: 1 },
  { displayName: "John Angelo Bautista", seats: 1 },
  { displayName: "Apoll Marc Venedict Hernandez", seats: 1 },
  { displayName: "Ashley Beth Brucal", seats: 1 },
  { displayName: "Donric Dale Levita", seats: 1 },
  { displayName: "Edwin Jr. Macuha", seats: 1 },
  { displayName: "Ken Zoleil Maranan", seats: 1 },
  { displayName: "Jahmiella Ishie Godoy", seats: 1 },
  { displayName: "Serkan Wackin Fabian", seats: 1 },
  { displayName: "Earl Jacob Cantos", seats: 1 },
  { displayName: "Rai Margaret Zara", seats: 1 },
  { displayName: "Jann Princess Roldan", seats: 1 },
  { displayName: "Kishalyn Careyl Umali", seats: 1 },
  { displayName: "Jarla Bay Gupit", seats: 1 },
  { displayName: "Kate Justine Magnaye", seats: 1 },
  { displayName: "Kzel Barrion", seats: 3 },
  { displayName: "Chloe Padua", seats: 3 },

  // Close Family
  { displayName: "Tita Gene De Castro", seats: 2 },
  { displayName: "Tita Fhe Natividad", seats: 2 },
  { displayName: "Umpe JD", seats: 2 },
  { displayName: "Tita Donna Dimaandal", seats: 4 },
  { displayName: "Tita Elizabeth Macalalad", seats: 2 },
  { displayName: "Ninang Felly", seats: 1 },
  { displayName: "Ninang Rea", seats: 2 },
  { displayName: "Ninang Arlene Castor", seats: 2 },
  { displayName: "Ninong Paul", seats: 3 },
  { displayName: "Ninang Faith Villena", seats: 2 }
];

// Deployed Google Apps Script Web App URL — submissions post here and land
// as rows in the "RSVP Responses" tab.
const RSVP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykwWKsVC6Ri6cwYhg49LB7lizEQ4oGVuSb580Jxiv2ncw93frO7_Lg5ZVFSMN-uxt6_A/exec";

const RSVP_LOCAL_KEY_PREFIX = "rsvp_response_";

function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "") // strip punctuation (periods, commas, etc.)
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(name) {
  return normalizeName(name).split(" ").filter(Boolean);
}

// precompute tokens once so matching doesn't re-split on every keystroke
const GUEST_LIST = GUEST_LIST_RAW.map((g) => ({
  ...g,
  tokens: tokenize(g.displayName),
  key: normalizeName(g.displayName)
}));

const rsvpNameInput = document.getElementById("rsvpNameInput");
const rsvpFindBtn = document.getElementById("rsvpFindBtn");
const rsvpResult = document.getElementById("rsvpResult");

if (rsvpFindBtn) {
  rsvpFindBtn.addEventListener("click", handleFind);
  rsvpNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleFind();
  });
}

function findGuestMatches(inputTokens) {
  // every word the guest typed must appear somewhere in the full name
  return GUEST_LIST.filter((g) => inputTokens.every((t) => g.tokens.includes(t)));
}

function handleFind() {
  const raw = rsvpNameInput.value;
  const inputTokens = tokenize(raw);

  if (inputTokens.length === 0) {
    renderNotFound();
    return;
  }

  const matches = findGuestMatches(inputTokens);

  if (matches.length === 0) {
    renderNotFound();
    return;
  }

  if (matches.length > 1) {
    renderAmbiguous(matches);
    return;
  }

  const guest = matches[0];
  const previous = getLocalResponse(guest.key);
  renderFound(guest, guest.key, previous);
}

function renderNotFound() {
  rsvpResult.innerHTML = `
    <p class="rsvp-status not-found">
      We couldn't find that name on the guest list.<br/>
      Double-check the spelling, or reach out to the host directly.
    </p>
  `;
}

function renderAmbiguous(matches) {
  const names = matches.map((g) => `&ldquo;${g.displayName}&rdquo;`).join(", ");
  rsvpResult.innerHTML = `
    <p class="rsvp-status not-found">
      That matches more than one invitation (${names}).<br/>
      Please type a bit more of your full name.
    </p>
  `;
}

function renderFound(guest, key, previous) {
  const additionalSeats = guest.seats - 1;
  const seatsNote = additionalSeats > 0
    ? `This invitation includes ${additionalSeats} additional guest${additionalSeats > 1 ? "s" : ""} (${guest.seats} seats total).`
    : `This invitation is for 1 seat.`;

  // previous plus-one names were stored as a comma-separated string
  const previousNames = previous && previous.plusOneName
    ? previous.plusOneName.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const alreadyRespondedNote = previous
    ? `<p class="rsvp-seats">You already responded: <strong>${previous.response}</strong>${previousNames.length ? ` (with ${previousNames.join(", ")})` : ""}. Submitting again will update your answer.</p>`
    : "";

  let extraGuestInputs = "";
  for (let i = 0; i < additionalSeats; i++) {
    const label = additionalSeats > 1 ? `Additional guest ${i + 1} name (optional)` : `Additional guest's full name (optional)`;
    const value = previousNames[i] || "";
    extraGuestInputs += `<input type="text" class="rsvp-input rsvp-extra-input" placeholder="${label}" autocomplete="off" value="${value}"/>`;
  }

  rsvpResult.innerHTML = `
    <p class="rsvp-status found">Invitation found — welcome, ${guest.displayName}!</p>
    <p class="rsvp-seats">${seatsNote}</p>
    ${alreadyRespondedNote}

    ${additionalSeats > 0 ? `<div class="rsvp-plusone">${extraGuestInputs}</div>` : ""}

    <div class="rsvp-choice-row" id="rsvpChoiceRow">
      <button type="button" class="rsvp-choice" data-choice="Accept">Accept</button>
      <button type="button" class="rsvp-choice" data-choice="Decline">Decline</button>
    </div>

    <div>
      <button type="button" id="rsvpConfirmBtn" class="details-btn rsvp-confirm-btn" disabled>Confirm RSVP</button>
    </div>

    <p class="rsvp-error" id="rsvpError" style="display:none;"></p>
  `;

  let selectedChoice = previous ? previous.response : null;
  const choiceButtons = rsvpResult.querySelectorAll(".rsvp-choice");
  const confirmBtn = document.getElementById("rsvpConfirmBtn");
  const errorEl = document.getElementById("rsvpError");

  choiceButtons.forEach((btn) => {
    if (previous && btn.dataset.choice === previous.response) {
      btn.classList.add("selected");
      confirmBtn.disabled = false;
    }
    btn.addEventListener("click", () => {
      choiceButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedChoice = btn.dataset.choice;
      confirmBtn.disabled = false;
      errorEl.style.display = "none";
    });
  });

  confirmBtn.addEventListener("click", () => submitFlow());

  function submitFlow() {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Sending...";
    errorEl.style.display = "none";

    const extraInputs = rsvpResult.querySelectorAll(".rsvp-extra-input");
    const extraNames = Array.from(extraInputs)
      .map((input) => input.value.trim())
      .filter(Boolean);

    const payload = {
      name: guest.displayName,
      matched: true,
      seatsAllowed: guest.seats,
      plusOneName: extraNames.join(", "),
      response: selectedChoice
    };

    submitRSVP(payload)
      .then(() => {
        saveLocalResponse(key, payload);
        rsvpResult.innerHTML = `
          <p class="rsvp-status found">Thank you, ${guest.displayName}!</p>
          <p class="rsvp-thankyou">${selectedChoice === "Accept" ? "We can't wait to see you." : "You'll be missed!"}</p>
        `;
      })
      .catch((err) => {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Confirm RSVP";
        errorEl.textContent = "Something went wrong sending your RSVP (" + err.message + "). Please try again.";
        errorEl.style.display = "block";
      });
  }
}

function submitRSVP(payload) {
  if (!RSVP_SCRIPT_URL || RSVP_SCRIPT_URL.indexOf("PASTE_YOUR") === 0) {
    console.warn("RSVP_SCRIPT_URL not set yet — response was not saved.", payload);
    return Promise.resolve();
  }

  return fetch(RSVP_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // keeps this a "simple request", no CORS preflight
    body: JSON.stringify(payload)
  })
    .catch(() => {
      throw new Error("network error");
    })
    .then((res) => {
      if (!res.ok) throw new Error("server error (" + res.status + ")");
      return res.json();
    })
    .then((json) => {
      if (json.status !== "success") throw new Error(json.message || "unknown error");
      return json;
    });
}

function getLocalResponse(key) {
  try {
    const raw = localStorage.getItem(RSVP_LOCAL_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalResponse(key, payload) {
  try {
    localStorage.setItem(RSVP_LOCAL_KEY_PREFIX + key, JSON.stringify(payload));
  } catch {
    // localStorage unavailable — not critical, server-side upsert still handles dupes
  }
}
