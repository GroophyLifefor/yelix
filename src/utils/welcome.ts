export function sayWelcome() {
  const characterCount = 96;

  console.log(
    `%c${"".padStart(characterCount, " ")}%c`,
    "background-color: white; color: black;",
    "background-color: inherit",
  );
  console.log(
    "%c  Hi %c" + "%s" + "%c" + "%s" + "%c" + "%s" + "%c " + "%c",
    "background-color: white; color: black;",
    "background-color: inherit",
    "there! Welcome to ",
    "color: orange",
    "Yelix",
    "background-color: inherit",
    " ".repeat(characterCount - 12 - "there! Welcome to".length),
    "background-color: white; color: black;",
    "background-color: inherit",
  );

  console.log(
    "%c  I'm %c" + "%s" + "%c %c",
    "background-color: white; color: black;",
    "background-color: inherit",
    "the maintainer of this project, and if you use Yelix for an open-source project." +
      " ".repeat(
        characterCount -
          7 -
          "the maintainer of this project, and if you use Yelix for an open-source project."
            .length,
      ),
    "background-color: white; color: black;",
    "background-color: inherit",
  );

  console.log(
    "%c  I would %c" + "%s" + "%c %c",
    "background-color: white; color: black;",
    "background-color: inherit",
    "love to review your codebase and analyze where I can improve it." +
      " ".repeat(
        characterCount -
          11 -
          "love to review your codebase and analyze where I can improve it."
            .length,
      ),
    "background-color: white; color: black;",
    "background-color: inherit",
  );

  console.log(
    "%c  Please Submit %c" + "%s" + "%c %c",
    "background-color: white; color: black;",
    "background-color: inherit",
    'an issue on the GitHub repository with the title "Used Yelix in my project"' +
      " ".repeat(
        characterCount -
          17 -
          'an issue on the GitHub repository with the title "Used Yelix in my project"'
            .length,
      ),
    "background-color: white; color: black;",
    "background-color: inherit",
  );

  console.log(
    "%c  To not get this message %c" + "%s" + "%c %c",
    "background-color: white; color: black;",
    "background-color: inherit",
    "again, set the `noWelcome` option to true in the Yelix constructor." +
      " ".repeat(
        characterCount -
          27 -
          "again, set the `noWelcome` option to true in the Yelix constructor."
            .length,
      ),
    "background-color: white; color: black;",
    "background-color: inherit",
  );

  console.log(
    `%c${"".padStart(characterCount, " ")}%c`,
    "background-color: white; color: black;",
    "background-color: inherit",
  );
}
