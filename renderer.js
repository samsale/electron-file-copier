// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const Papa = require('papaparse')
const app = require('electron').remote
const dialog = app.dialog
const fs = require('fs')
const copier = require('./copier')

let results

function readFile(filepath) {
  let data = fs.readFileSync(filepath, 'utf-8')
  parseData(data)
}

function parseData(csvObj){
  resultsObj = Papa.parse(csvObj, {skipEmptyLines:true});
  results = resultsObj.data
}

function countProgrammes(){
  return results.length
}

function csvloaded(numberOfProgrammes){
  document.getElementById('number-of-programmes').innerHTML = numberOfProgrammes
  if(numberOfProgrammes > 0){
    document.getElementById('read-csv-status-container').classList.remove("is-invisible");
    document.getElementById('copyButton').classList.remove("is-invisible");
  }
  else {
    document.getElementById('read-csv-status-container').classList.remove("is-invisible");
    document.getElementById('copyButton').classList.add("is-invisible");
  }
}

document.getElementById('openButton').onclick = () => {
  dialog.showOpenDialog({filters: [{ name: 'csvs', extensions: ['csv']},]},
  (fileNames) => {
    document.getElementById('status').classList.add("is-invisible");
    if(fileNames === undefined){
      alert('No File Selected')
    } else if (fileNames[0].endsWith(".csv")) {
      //parse csv to object
      readFile(fileNames[0])
      //get number of rows in csv
      let numberOfProgrammes = countProgrammes()
      //change DOM elements
      csvloaded(numberOfProgrammes)
      //start check and copy of stls
        document.getElementById('copyButton').onclick = () => {
          copier.copier(results)
          document.getElementById('status').classList.remove("is-invisible");
        }
    } else {
      alert('Please select a csv')
    }
  })
}
