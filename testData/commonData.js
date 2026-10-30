// ---- Valid login variants ----
const validVariants = [
  ["Username is case-insensitive (lowercase)", (u) => u.toLowerCase()],
  ["Username is case-insensitive (uppercase)", (u) => u.toUpperCase()],
];

// ---- Invalid credentials -> generic error alert -------
const errorCases = [
  [
    "valid username and invalid password",
    process.env.ADMIN_USERNAME,
    process.env.INVALID_PASSWORD,
  ],
  [
    "invalid username and valid password",
    process.env.INVALID_USERNAME,
    process.env.ADMIN_PASSWORD,
  ],
  [
    "both invalid credentials",
    process.env.INVALID_USERNAME,
    process.env.INVALID_PASSWORD,
  ],
  ["whitespace in username", " Admin", process.env.ADMIN_PASSWORD],
  ["whitespace in password", process.env.ADMIN_USERNAME, " admin123 "],
];

// ---- Required-field validation ----
const requiredCases = [
  ["both fields empty", "", "", ["userNameRequired", "passwordRequired"]],
  ["username only", process.env.ADMIN_USERNAME, " ", ["passwordRequired"]],
  ["password only", " ", process.env.ADMIN_PASSWORD, ["userNameRequired"]],
];

module.exports = { validVariants, errorCases, requiredCases };
