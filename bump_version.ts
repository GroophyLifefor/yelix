async function bumpVersion(type: 'patch' | 'minor' | 'major') {
  const fileNames = ['jsr.json', 'deno.json'];
  await fileNames.forEach(async (fileName) => {
    const data = await Deno.readTextFile(fileName);
    const json = JSON.parse(data);

    if (!json.version) {
      console.error('No version field found in jsr.json');
      Deno.exit(1);
    }

    const [major, minor, patch] = json.version.split('.').map(Number);

    if (type === 'patch') {
      json.version = `${major}.${minor}.${patch + 1}`;
    } else if (type === 'minor') {
      json.version = `${major}.${minor + 1}.0`;
    } else if (type === 'major') {
      json.version = `${major + 1}.0.0`;
    }

    await Deno.writeTextFile(fileName, JSON.stringify(json, null, 2) + '\n');
    console.log(`✅ Updated version to ${json.version}`);
  });
}

// Get command-line argument
const arg = Deno.args[0];
if (arg === 'patch' || arg === 'minor' || arg === 'major') {
  await bumpVersion(arg);
} else {
  console.error(
    'Usage: deno run --allow-read --allow-write bump_version.ts patch|minor|major'
  );
}
