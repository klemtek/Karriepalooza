import { mkdir, writeFile } from "node:fs/promises";

const apiKey = process.env.FORMSUBMIT_API_KEY;
const endpoint =
  process.env.FORMSUBMIT_API_URL ||
  (apiKey ? `https://formsubmit.co/api/get-submissions/${apiKey}` : "");

if (!endpoint) {
  throw new Error("Set FORMSUBMIT_API_KEY before exporting RSVPs.");
}

const response = await fetch(endpoint, {
  headers: {
    Accept: "application/json",
  },
});

if (!response.ok) {
  throw new Error(`FormSubmit export failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();
const submissions = Array.isArray(payload)
  ? payload
  : payload.submissions || payload.data || payload.results || [];

function getFields(submission) {
  return submission.form_data || submission.formData || submission.data || submission.fields || submission;
}

function getSubmittedAt(submission) {
  return (
    submission.created_at ||
    submission.createdAt ||
    submission.submitted_at ||
    submission.submittedAt ||
    submission.date ||
    ""
  );
}

function normalizeSubmission(submission) {
  const fields = getFields(submission);
  return {
    id: String(submission.id || submission._id || `${fields.Name || ""}-${getSubmittedAt(submission)}`),
    submittedAt: String(getSubmittedAt(submission)),
    name: String(fields.Name || "").trim(),
    guests: String(fields["Total guests attending"] || "").trim(),
    shirtRequested: String(fields["T-shirt requested"] || "No").trim(),
    shirtSize: String(fields["T-shirt size"] || "").trim(),
    questions: String(fields["Questions or notes"] || "").trim(),
  };
}

function isRsvp(submission) {
  const fields = getFields(submission);
  return Boolean(fields.Name && fields["Total guests attending"]);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const seen = new Set();
const rsvps = submissions
  .filter(isRsvp)
  .map(normalizeSubmission)
  .filter((rsvp) => {
    const key = `${rsvp.name}|${rsvp.guests}|${rsvp.submittedAt}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  })
  .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));

await mkdir("data", { recursive: true });
await writeFile(
  "data/rsvps.json",
  `${JSON.stringify({ generatedAt: new Date().toISOString(), rsvps }, null, 2)}\n`,
);

const headers = ["submittedAt", "name", "guests", "shirtRequested", "shirtSize", "questions"];
const csv = [
  headers.join(","),
  ...rsvps.map((rsvp) => headers.map((header) => csvEscape(rsvp[header])).join(",")),
].join("\n");

await writeFile("data/rsvps.csv", `${csv}\n`);
console.log(`Exported ${rsvps.length} RSVPs.`);
