export function sayWelcome() {
  // Pre-calculate the full message as a string array
  const characterCount = 96;
  const padding = " ".repeat(characterCount);
  const border = `${padding}`;
  const borderStyle = "background-color: white; color: black;";
  const resetStyle = "";
  const yelixStyle = "color: orange; font-weight: bold;";

  // Prepare all message lines at once
  console.log(`%c${border}`, borderStyle);
  console.log(
    `%c  Hi %cthere! Welcome to %cYelix%c${
      " ".repeat(
        characterCount - 12 - "there! Welcome to".length,
      )
    }`,
    borderStyle,
    resetStyle,
    yelixStyle,
    resetStyle,
  );
  console.log(
    `%c  I'm %cthe maintainer of this project, and if you use Yelix for an open-source project.${
      " ".repeat(
        characterCount -
          7 -
          "the maintainer of this project, and if you use Yelix for an open-source project."
            .length,
      )
    }`,
    borderStyle,
    resetStyle,
  );
  console.log(
    `%c  I would %clove to review your codebase and analyze where I can improve it.${
      " ".repeat(
        characterCount -
          11 -
          "love to review your codebase and analyze where I can improve it."
            .length,
      )
    }`,
    borderStyle,
    resetStyle,
  );
  console.log(
    `%c  Please Submit %can issue on the GitHub repository with the title "Used Yelix in my project"${
      " ".repeat(
        characterCount -
          17 -
          'an issue on the GitHub repository with the title "Used Yelix in my project"'
            .length,
      )
    }`,
    borderStyle,
    resetStyle,
  );
  console.log(
    `%c  To not get this message %cagain, set the \`noWelcome\` option to true in the Yelix constructor.${
      " ".repeat(
        characterCount -
          27 -
          "again, set the `noWelcome` option to true in the Yelix constructor."
            .length,
      )
    }`,
    borderStyle,
    resetStyle,
  );
  console.log(`%c${border}`, borderStyle);
}
