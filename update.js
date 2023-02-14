const superagent = require("superagent");
const fs = require("fs");

const nodeOSURL = "https://nodejs.org/api/os.json";

const userAgent = "confused-Techie:Pulsar:autocomplete-nodejs - https://github.com/confused-Techie/autocomplete-nodejs";

const completionsFile = {};

// Since crafting snippets from the API return is difficult, the simpliest solution
// with minor upkeep is to keep a list of hand crafted snippets for certain items.
const knownSnippets = {
  "getPriority": "getPriority(${1:pid})",
  "setPriority": "setPriority(${1:pid}, ${2:optionalPriority})",
  "userInfo": "userInfo({ encoding: ${1:'utf8'} })",
};

async function manageUpdate() {
  // This function is in charge of getting all individual parts updated.

  const nodeOSRaw = await getRemote(nodeOSURL);

  await parseOS(nodeOSRaw, completionsFile);

  console.log("Saving new Completions File");
  fs.writeFileSync("./completions.json", JSON.stringify(completionsFile, null, 2));
  console.log("Done!");
}

async function getRemote(url) {
  try {

    const res = await superagent
      .get(url)
      .set({ "USer-Agent": userAgent });

    if (res.status !== 200) {
      console.error(`Got ${res.status} StatusCode from ${url}`);
      throw new Error(res);
    }

    return res.body;

  } catch(err) {
    console.error(`Failed Updating from: ${url}`);
    throw new Error(err);
  }
}

async function parseOS(raw, obj) {
  // This function will have to turn the raw JSON data into usable autocompletions.
  // Object is the resulting completions file we will move data into, in such a way
  // as to not overwrite any other changes.

  /**
    As of 12/02/23
    The JSON API returns three major parts
      - properties
      - methods
      - modules
   */

  obj.os = [];

  for (const prop of raw.modules[0].properties) {
    obj.os.push({
      name: prop.name,
      text: prop.name,
      snippet: null,
      description: extractDescFromDesc(prop.desc),
      descriptionMoreURL: `${nodeOSURL.replace(".json", ".html")}#os${prop.name.toLowerCase()}`,
      leftLabel: extractReturnFromTextRaw(prop.textRaw),
      rightLabel: `Added in: ${prop.meta.added.join(",")}`,
      type: "property"
    });
  }

  for (const prop of raw.modules[0].methods) {
    let snippet = null;

    if (knownSnippets[prop.name]) {
      snippet = knownSnippets[prop.name];
    }

    obj.os.push({
      name: prop.name,
      text: `${prop.name}()`,
      snippet: snippet,
      description: extractDescFromDesc(prop.desc),
      descriptionMoreURL: `${nodeOSURL.replace(".json", ".html")}#os${prop.name.toLowerCase()}`,
      leftLabel: extractReturnFromTextRaw(prop.signatures[0]?.return?.type ?? null),
      rightLabel: `Added in: ${prop.meta.added.join(",")}`,
      type: "method"
    });
  }

  // Then lastly for modules. The modules for the OS module consists of the
  // constants returned.
  // In this case they are returned as a big jumble of HTML.
  // While in the future finding a way of properly reading this and extracting the
  // needed info would be best, the simpliest thing to do right now may be to create
  // the list manually. At least we can make it slightly more managable.

  obj["os.constants"] = require("./static-constants/os.constants.json");
  obj["os.constants.signals"] = require("./static-constants/os.constants.signals.json");
  obj["os.constants.priority"] = require("./static-constants/os.constants.priority.json");
  obj["os.constants.libuv"] = require("./static-constants/os.constants.libuv.json");
  obj["os.constants.dlopen"] = require("./static-constants/os.constants.dlopen.json");
  obj["os.constants.errno"] = require("./static-constants/os.constants.errno.json");

  return;
}

function extractReturnFromTextRaw(value) {
  // Aims to take value like "`EOL` {string}" and return string
  const reg = /{([a-zA-Z0-9]*)}/;

  let match = reg.exec(value);
  if (match === null) {
    return value;
  }
  // TODO: Removed \\ doesn't work
  return match[1].replace("\\", ""); // The last replace is because their HTML has escapes that we don't need
}

function extractDescFromDesc(value) {
  // Aims to extract a summary description from the HTML description of items
  // within the JSON api data.
  const reg = /(<([^>]+)>)/ig;
  let text = value.replace(reg, "");
  text = text.replace("\n", "");
  text = text.split(".")[0];
  text += "."; // Add back the period we removed earlier.
  return text;
}

// Call our update
manageUpdate();
