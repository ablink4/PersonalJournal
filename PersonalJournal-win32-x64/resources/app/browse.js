const sqlite3 = require('sqlite3').verbose();
const dateformat = require('dateformat');
const electron = require('electron');
const ipcRenderer = require('electron').ipcRenderer;

var currentWindow = electron.remote.getCurrentWindow();
var entryList = document.getElementById('entry-list');

var db = new sqlite3.Database('./sqldb', (err) => {
    if(err) {
        console.error(err.message);
    }
});

db.each(`SELECT id, entryName, entryDate from journal;`, (err, row) => {
    if(err) {
        console.error(err.message);
    }

    var currentEntryDateString = row.entryDate;
    var dateAsInt = parseInt(currentEntryDateString);
    var currentEntryDate = new Date(dateAsInt);
    var formattedDate = dateformat(currentEntryDate, "dddd, mmmm dS, yyyy, hh:MM TT");

    var textSpan = document.createElement('span');
    textSpan.textContent = row.entryName + ', ' + formattedDate;

    var li = document.createElement('li');
    li.setAttribute('id', row.id);
    li.appendChild(textSpan);
    li.addEventListener('click', () => {
        ipcRenderer.send('show-entry-by-id', event.currentTarget.id);
        currentWindow.close();
    });
    entryList.appendChild(li);
});
