
//A - Validate and parse on frontend. Then send object to backend via IPC-Main
//Create local storage or file for src and destination stls folder
//Nprogress.js


const fs = require('fs')

//directories to search for STLs
const stlDir = '/Users/samsale/Documents/subs/stls/'
const mamDir = '/Users/samsale/Documents/subs/stls/to_mam'

const createSuccessTags = (array) => {
  let allTags = ''
  for (let obj of array) {
    if (obj.status === "Success"){
    allTags += `<span class="tag is-success">${obj.src} > ${obj.dest}</span>`
    }
  }

  document.getElementById("success-tags").innerHTML = allTags
}

const createErrorTags = (array) => {
  let allTags = ''
  for (let obj of array) {
    if (obj.status === "Source STL doesn't exist"){
    allTags += `<div class="control"> <div class="tags has-addons"><span class="tag is-dark">${obj.src} > ${obj.dest}</span><span class="tag is-danger">No Source STL</span></div></div>`
  }else if (obj.status === "Destination STL exists already"){
    allTags += `<div class="control"> <div class="tags has-addons"><span class="tag is-dark">${obj.src} > ${obj.dest}</span><span class="tag is-danger">Destination STL Exists</span></div></div>`
  }
  }
  document.getElementById("error-tags").innerHTML = allTags

}

const tidyData = (array) => {
  let tidiedArray = []
  for (let arr of array) {
    let newObject = {src: arr[0].trim().toUpperCase(),
      dest: arr[1].trim().toUpperCase()
    }
    tidiedArray.push(newObject)
  }
  return tidiedArray
}

const findSTLs = (array) => {
  for (let obj of array) {
    let sourcePath = `${stlDir}${obj.src.substring(0,3)}/${obj.src}`
    //check if source stl exists
    if(fs.existsSync(`${sourcePath}.stl`)){
      obj['sourceStlExists'] = `${sourcePath}.stl`
    }
    //check if source stl exists with ENG in file name
    else if (fs.existsSync(`${sourcePath}.eng.stl`)){
      obj['sourceStlExists'] = `${sourcePath}.eng.stl`
    }
    //soruce STL doesn't exist
    else {
      obj['sourceStlExists'] = false
      obj['status'] = "Source STL doesn't exist"
    }
  }
  for (let obj of array) {
    let destPath = `${stlDir}${obj.dest.substring(0,3)}/${obj.dest}`
    //check if source directory exists, if it doesn't, then return
    if(obj.error === "Source STL doesn't exist"){
      return
    }
    //check if desintation STL exists
    else if(fs.existsSync(`${destPath}.stl`) || fs.existsSync(`${destPath}.eng.stl`) ){
      obj['destinationStlExists'] = true
      obj['status'] = "Destination STL exists already"
    }
    //The file is ready to copy
    else {
      obj['destinationStlExists'] = false
    }
  }
  return array;
}

const copyStls = (array) => {
  for (let obj of array) {
    if (obj.sourceStlExists && !obj.destinationStlExists){
      let destFile = `${stlDir}${obj.dest.substring(0,3)}/${obj.dest}.stl`
      let destMamFile = `${mamDir}/${obj.dest}.stl`
      let destFolder = `${stlDir}${obj.dest.substring(0,3)}`
      //Check if destination folder exists, if it doesn't then create it
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder);
      }
      //copy stl and rename it to destination folder
      fs.copyFile(obj.sourceStlExists, destFile, (err) => {
      if (err) throw err;
      });
      //copy stl to MAM folder
      fs.copyFile(obj.sourceStlExists, destMamFile, (err) => {
      if (err) throw err;
      });
      obj['status'] = "Success"
    }
  }
  return array
}

const updateResults = (results) => {
  createSuccessTags(results)
  createErrorTags(results)
  let errorCount = results.filter((obj) => obj.status !== "Success").length;
  let successCount = results.filter((obj) => obj.status === "Success").length;
  document.getElementById('copyButton').classList.add("is-invisible");
  document.getElementById('errorsWindow').innerHTML = errorCount
  document.getElementById('successWindow').innerHTML = successCount
}

const copier = async(jObj) => {
  const tidiedArray = await tidyData(jObj)
  const readyToCopyArray = await findSTLs(tidiedArray)
  const copyResults = await copyStls(readyToCopyArray)
  await updateResults(copyResults)
}

module.exports = { copier };
