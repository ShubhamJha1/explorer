/* eslint-disable no-console */
/* global require */
const glob = require('glob')
const { basename, resolve } = require('path')
// const csvParse = require('csv-parse/lib/sync')
const { readFileSync, writeFileSync } = require('fs')

const LANG_DIR = './static/lang/'
const DEFAULT_LOCALE = 'en'
const TRANSLATED_STRINGS_DIR = '../translations/explorer'

const supportedLanguages = glob.sync('./static/lang/*.json').map((f) => basename(f, '.json'))

// Copy latest files from `translations`
supportedLanguages.forEach((lang) => {
  console.log('> Getting latest translations for langugae ✨', lang)
  writeFileSync(`${LANG_DIR}/${lang}.json`, readFileSync(`${TRANSLATED_STRINGS_DIR}/${lang}/strings.json`))
})

// Build the locale files to be sent to the browser
const translationsMap = supportedLanguages
  .reduce((t, lang) => {
    t[lang] = JSON.parse(readFileSync(`${LANG_DIR}/${lang}.json`))
    return t
  }, {})

const translationsContent = `window.OONITranslations = ${JSON.stringify(translationsMap)}`
writeFileSync('./static/lang/translations.js', translationsContent)
console.log('> Wrote translations to: ./static/lang/translations.js')
