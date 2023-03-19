# autocomplete-nodejs

[![autocomplete-nodejs](https://image.pulsar-edit.dev/packages/autocomplete-nodejs)](https://web.pulsar-edit.dev/packages/autocomplete-nodejs)

Autocomplete NodeJS is a package made for the [Pulsar](https://pulsar-edit.dev/) Text Editor.

Which provides autocompletions for the built in functions, constants, and exports of modules that come with NodeJS.

![Autocompletions Example](https://raw.githubusercontent.com/confused-Techie/autocomplete-nodejs/0.0.1/assets/base-autocompletions.png)

## Features

* Only appears when you actually import the relevant module!
    - e.g. `require("node:os")`
    - e.g. `require('os')`
* Provides Snippets where applicable
  - `os.getPriority(pid)`
  - `os.setPriority(pid, optionalPriority)`
  - `os.userInfo({ encoding: 'utf8' })`
* Provides what version of NodeJS certain APIs were added to modules
* Provides links to Node's Documentation on nearly every suggestion under `More`

## Currently Supported NodeJS Modules
  - [`os`](https://nodejs.org/api/os.html)
