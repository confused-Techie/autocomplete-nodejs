const requireOSReg = /require\(["|']((os["|'])|(node:os["|']))\)/gm;
const propertyPrefixPatternOS = /(?:^|\[|\(|,|=|:|\s)\s*(os\.(?:[a-zA-Z\(\)]+\.?){0,2})$/;

const COMPLETIONS = require("../completions.json");

const allCompletions = {};

function getCompletions(kind, line) {
  let completions = [];
  let match = propertyPrefixPatternOS.exec(line);
  if (match === null) {
    return completions;
  }
  match = match[1] ?? null;
  if (match === null) {
    return completions;
  }

  completions = findCompletions(kind, match);
  return completions;
}

function findCompletions(nodeModule, text) {
  let completions = [];

  let moduleCompletions = COMPLETIONS[nodeModule];

  if (moduleCompletions === null) {
    return completions;
  }

  // Lets first check if what they are typing matches a property with more methods
  let segments = text.split(".");
  let prefix = segments.pop();
  let property = segments[segments.length -1];
  let propertyCompletions = COMPLETIONS[property];

  //console.log(`Text: ${text} - Segments: ${segments} - prefix: ${prefix} - property: ${property}`);
  //console.log(typeof propertyCompletions);
  if (typeof propertyCompletions !== "undefined") {
    // the property they are working with has completions.
    //console.log("trigger property completions");

    if (prefix.length > 1) {
      // The user has already typed something that we should match against
      for (const property of propertyCompletions) {
        if (firstCharsEqual(property.text, prefix)) {
          completions.push(property);
        }
      }
    } else {
      // The user has just typed `os.PROPERTY.` and we should return all relevant
      // completions
      completions = propertyCompletions;
    }
  } else {
    // The property they are working with does not have completions.
    // Lets focus on the method completions for the module.
    if (prefix.length > 1) {
      // The user has already typed something in that we should match against.
      for (const complete of moduleCompletions) {
        if (firstCharsEqual(complete.text, prefix)) {
          //console.log(`Pushing: ${complete.text} with ${prefix}`);
          completions.push(complete);
        }
      }
    } else {
      // The user has just typed `os.` and we should return all relevant completions.
      //console.log("Returning all relevant completions");
      completions = moduleCompletions;
    }
  }
  return completions;
}

function firstCharsEqual(str1, str2) {
  return str1[0].toLowerCase() == str2[0].toLowerCase();
}


module.exports = {
  selector: ".source.js",
  filterSuggestions: true,
  getSuggestions: ({bufferPosition, editor}) => {
    if (requireOSReg.test(editor.getText())) {
      // We can provide node:os autocompletions
      let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return getCompletions("NodeJS-OS", line);
    }

  },
  load: () => {
    //console.log("Hello I'm autocomplete-nodejs");
  },

};
