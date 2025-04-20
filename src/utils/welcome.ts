export function sayWelcome() {
  // Pre-calculate the full message as a string array
  const characterCount = 96;
  const padding = " ".repeat(characterCount);
  const border = `%c${padding}%c`;
  const borderStyle = "background-color: white; color: black;";
  const resetStyle = "background-color: inherit";

  // Prepare all message lines at once
  const messages = [
    [border, borderStyle, resetStyle],
    [
      "%c  Hi %c" + "there! Welcome to " + "%cYelix%c" +
      " ".repeat(characterCount - 12 - "there! Welcome to".length) + " %c",
      borderStyle,
      resetStyle,
      "color: orange",
      resetStyle,
      borderStyle,
      resetStyle,
    ],
    [
      "%c  I'm %c" +
      "the maintainer of this project, and if you use Yelix for an open-source project." +
      " ".repeat(
        characterCount - 7 -
          "the maintainer of this project, and if you use Yelix for an open-source project."
            .length,
      ) + " %c",
      borderStyle,
      resetStyle,
      borderStyle,
      resetStyle,
    ],
    [
      "%c  I would %c" +
      "love to review your codebase and analyze where I can improve it." +
      " ".repeat(
        characterCount - 11 -
          "love to review your codebase and analyze where I can improve it."
            .length,
      ) + " %c",
      borderStyle,
      resetStyle,
      borderStyle,
      resetStyle,
    ],
    [
      "%c  Please Submit %c" +
      'an issue on the GitHub repository with the title "Used Yelix in my project"' +
      " ".repeat(
        characterCount - 17 -
          'an issue on the GitHub repository with the title "Used Yelix in my project"'
            .length,
      ) + " %c",
      borderStyle,
      resetStyle,
      borderStyle,
      resetStyle,
    ],
    [
      "%c  To not get this message %c" +
      "again, set the `noWelcome` option to true in the Yelix constructor." +
      " ".repeat(
        characterCount - 27 -
          "again, set the `noWelcome` option to true in the Yelix constructor."
            .length,
      ) + " %c",
      borderStyle,
      resetStyle,
      borderStyle,
      resetStyle,
    ],
    [border, borderStyle, resetStyle],
  ];

  // Log all messages at once in a single batch
  messages.forEach((args) => console.log(...args));
}
