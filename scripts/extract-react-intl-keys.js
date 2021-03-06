/* eslint-disable no-console */
/* global require */

const glob = require('glob')
const { resolve } = require('path')
const { readFileSync, writeFileSync } = require('fs')

const LANG_DIR = './static/lang/'
const EXTRACTED_KEYS = `${LANG_DIR}.messages/keys.json`

const defaultMessages = glob.sync(`${LANG_DIR}.messages/**/*.json`)
  .map((filename) => readFileSync(filename, 'utf8'))
  .map((file) => JSON.parse(file))
  .reduce((messages, descriptors) => {
    descriptors.forEach(({ id }) => {
      messages.push({ Key: id })
    })
    return messages
  }, [])

writeFileSync(`${EXTRACTED_KEYS}`, JSON.stringify(defaultMessages, null, 2))
console.log(`> Wrote default messages to: "${resolve(`${EXTRACTED_KEYS}`)}"`)
