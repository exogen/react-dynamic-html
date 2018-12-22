#!/usr/bin/env node
const fs = require("fs");
const reactDocs = require("react-docgen");
const displayNameHandler = require("react-docgen-displayname-handler").default;

const files = ["index.js"];

const resolver = reactDocs.resolver.findExportedComponentDefinition;
const handlers = reactDocs.defaultHandlers.concat([displayNameHandler]);

console.log(
  JSON.stringify(
    files.reduce((output, file) => {
      const src = fs.readFileSync(file, "utf8");
      const documentation = reactDocs.parse(src, resolver, handlers);
      output[documentation.displayName] = documentation;
      return output;
    }, {})
  )
);
