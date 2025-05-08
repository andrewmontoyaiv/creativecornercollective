const en = require("./translations/en.json");
const es = require("./translations/es.json");
const pl = require("./translations/pl.json");
const ru = require("./translations/ru.json");
const uk = require("./translations/uk.json");

module.exports = function() {
  return {
    en: en,
    es: es,
    pl: pl,
    ru: ru,
    uk: uk
  };
};