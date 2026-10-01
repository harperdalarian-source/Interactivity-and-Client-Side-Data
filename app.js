"use strict";

// Class data used by the Find Your Class feature on the Services page.
const classOptions = [
  {
    name: "Gentle Yoga",
    experiences: ["new", "some", "regular"],
    energies: ["low", "medium"],
    goals: ["learn", "relax"],
    description: "Gentle Yoga is a good fit when you want clear instruction, a slower pace, and room to get comfortable with each movement."
  },
  {
    name: "Vinyasa",
    experiences: ["some", "regular"],
    energies: ["medium", "high"],
    goals: ["move"],
    description: "Vinyasa is a more active choice that links movement and breathing while still letting you work at your own pace."
  },
  {
    name: "Restorative Yoga",
    experiences: ["new", "some", "regular"],
    energies: ["low"],
    goals: ["relax"],
    description: "Restorative Yoga is designed for slowing down, resting, and letting some of the week's tension go."
  },
  {
    name: "Private Session",
    experiences: ["new", "some", "regular"],
    energies: ["low", "medium", "high"],
    goals: ["learn", "personal"],
    description: "A private session gives you one-on-one attention for questions, basics, or a personal goal you want to work on."
  }
];

// These messages keep the validation feedback consistent across the Events form.
const validationMessages = {
  nameRequired: "Please enter your name.",
  nameLength: "Please enter at least 2 characters for your name.",
  emailRequired: "Please enter your email address.",
  emailFormat: "Please enter an email address in a format like name@example.com.",
  phoneFormat: "Use the phone format 555-555-5555, or leave this field blank.",
  interestRequired: "Please choose a class, private session, or workshop.",
  experienceRequired: "Please choose your experience level.",
  contactRequired: "Please choose email or phone as your preferred contact method.",
  messageRequired: "Please enter a short message.",
  messageLength: "Please enter at least 10 characters so we know how to help."
};

// Keys are kept in one object so the storage names stay consistent.
const storageKeys = {
  classPreferences: "riverBendClassPreferences",
  contactPreferences: "riverBendContactPreferences"
};

function scoreClass(option, preferences) {
  let score = 0;
  if (option.experiences.includes(preferences.experience)) score += 1;
  if (option.energies.includes(preferences.energy)) score += 1;
  if (option.goals.includes(preferences.goal)) score += 2;
  return score;
}

function findBestClass(preferences) {
  return classOptions
    .map(option => ({ option, score: scoreClass(option, preferences) }))
    .sort((a, b) => b.score - a.score)[0].option;
}

function showClassResult(classMatch, restored = false) {
  const result = document.getElementById("class-result");
  const name = document.getElementById("class-result-name");
  const description = document.getElementById("class-result-description");
  const feedback = document.getElementById("finder-feedback");
  if (!result || !name || !description || !feedback) return;

  name.textContent = classMatch.name;
  description.textContent = classMatch.description;
  result.hidden = false;
  feedback.textContent = restored
    ? "Saved choice restored from your last visit."
    : "Your choices were saved on this device for your next visit.";
}

function getClassPreferences() {
  return {
    experience: document.getElementById("finder-experience")?.value || "",
    energy: document.getElementById("finder-energy")?.value || "",
    goal: document.getElementById("finder-goal")?.value || ""
  };
}

function saveClassPreferences(preferences, match) {
  localStorage.setItem(
    storageKeys.classPreferences,
    JSON.stringify({ ...preferences, matchName: match.name })
  );
}

function handleClassFinder() {
  const preferences = getClassPreferences();
  const feedback = document.getElementById("finder-feedback");
  if (!feedback) return;

  if (!preferences.experience || !preferences.energy || !preferences.goal) {
    feedback.textContent = "Please make a choice in all three boxes so we can suggest a class.";
    document.getElementById("class-result").hidden = true;
    return;
  }

  const match = findBestClass(preferences);
  saveClassPreferences(preferences, match);
  showClassResult(match, false);
}

function loadClassPreferences() {
  const savedText = localStorage.getItem(storageKeys.classPreferences);
  if (!savedText) return;

  try {
    const saved = JSON.parse(savedText);
    const experience = document.getElementById("finder-experience");
    const energy = document.getElementById("finder-energy");
    const goal = document.getElementById("finder-goal");
    if (!experience || !energy || !goal) return;

    experience.value = saved.experience || "";
    energy.value = saved.energy || "";
    goal.value = saved.goal || "";

    const match = classOptions.find(option => option.name === saved.matchName);
    if (match && saved.experience && saved.energy && saved.goal) {
      showClassResult(match, true);
    }
  } catch (error) {
    localStorage.removeItem(storageKeys.classPreferences);
  }
}

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (field) field.classList.toggle("field-error", Boolean(message));
  if (errorElement) errorElement.textContent = message;
}

function validateName() {
  const value = document.getElementById("name")?.value.trim() || "";
  if (!value) return validationMessages.nameRequired;
  if (value.length < 2) return validationMessages.nameLength;
  return "";
}

function validateEmail() {
  const value = document.getElementById("email")?.value.trim() || "";
  if (!value) return validationMessages.emailRequired;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value)) return validationMessages.emailFormat;
  return "";
}

function validatePhone() {
  const value = document.getElementById("phone")?.value.trim() || "";
  if (!value) return "";
  return /^\d{3}-\d{3}-\d{4}$/.test(value) ? "" : validationMessages.phoneFormat;
}

function validateSelect(fieldId, message) {
  return document.getElementById(fieldId)?.value ? "" : message;
}

function validateContactMethod() {
  return document.querySelector('input[name="contact-method"]:checked')
    ? ""
    : validationMessages.contactRequired;
}

function validateMessage() {
  const value = document.getElementById("message")?.value.trim() || "";
  if (!value) return validationMessages.messageRequired;
  if (value.length < 10) return validationMessages.messageLength;
  return "";
}

function validateForm() {
  const errors = {
    name: validateName(),
    email: validateEmail(),
    phone: validatePhone(),
    interest: validateSelect("interest", validationMessages.interestRequired),
    experience: validateSelect("experience", validationMessages.experienceRequired),
    message: validateMessage()
  };

  Object.entries(errors).forEach(([field, message]) => setError(field, message));

  const contactMessage = validateContactMethod();
  const contactError = document.getElementById("contact-method-error");
  if (contactError) contactError.textContent = contactMessage;

  return Object.values(errors).every(message => !message) && !contactMessage;
}

function saveContactPreferences() {
  const name = document.getElementById("name")?.value.trim() || "";
  const interest = document.getElementById("interest")?.value || "";
  localStorage.setItem(storageKeys.contactPreferences, JSON.stringify({ name, interest }));
}

function loadContactPreferences() {
  const savedText = localStorage.getItem(storageKeys.contactPreferences);
  if (!savedText) return;

  try {
    const saved = JSON.parse(savedText);
    const name = document.getElementById("name");
    const interest = document.getElementById("interest");
    const status = document.getElementById("form-status");
    if (name && saved.name) name.value = saved.name;
    if (interest && saved.interest) interest.value = saved.interest;
    if (status && (saved.name || saved.interest)) {
      status.textContent = "We remembered your name and class interest from your last visit on this device.";
    }
  } catch (error) {
    localStorage.removeItem(storageKeys.contactPreferences);
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formStatus = document.getElementById("form-status");

  if (!validateForm()) {
    if (formStatus) formStatus.textContent = "Please fix the highlighted fields and try again.";
    const firstError = document.querySelector(".field-error");
    if (firstError) firstError.focus();
    return;
  }

  saveContactPreferences();
  if (formStatus) {
    formStatus.textContent = "Thanks! Your request looks ready to send. This class project does not send information to a live studio.";
  }
}

function initializeClassFinder() {
  const button = document.getElementById("find-class-button");
  if (!button) return;
  button.addEventListener("click", handleClassFinder);
  loadClassPreferences();
}

function initializeForm() {
  const form = document.getElementById("interest-form");
  if (!form) return;

  // JavaScript handles the messages so feedback can appear beside each field.
  form.noValidate = true;
  form.addEventListener("submit", handleFormSubmit);
  ["name", "interest"].forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) field.addEventListener("change", saveContactPreferences);
  });
  loadContactPreferences();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeClassFinder();
  initializeForm();
});
