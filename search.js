const electron = require('electron');
const sqlite3 = require('sqlite3').verbose();
const dateformat = require('dateformat');
const ipcRenderer = require('electron').ipcRenderer;

var currentWindow = electron.remote.getCurrentWindow();
var resultsList = document.getElementById('results-list');

var db = new sqlite3.Database('./sqldb', (err) => {
    if(err) {
        console.error(err.message);
    }
});

// I tried this as a parameterized query (i.e. used ?) and it wouldn't work
// it gave me a "SQLITE_RANGE: bind or column index out of range" error I couldn't resolve
var query = `SELECT id, entryName, entryDate from journal where entryText like \'%` + currentWindow.searchText + `%\';`;
db.each(query, (err, row) => {
    if(err) {
        console.error(err.message);
    }

    var currentEntryDateString = row.entryDate;
    var dateAsInt = parseInt(currentEntryDateString);
    var currentEntryDate = new Date(dateAsInt);
    var formattedDate = dateformat(currentEntryDate, "dddd, mmmm dS, yyyy, hh:MM TT");

    var textSpan = document.createElement('span');

    // future improvement: show a snippet of the text that matched the search criteria
    textSpan.textContent = row.entryName + ', ' + formattedDate;

    var li = document.createElement('li');
    li.setAttribute('id', row.id);
    li.appendChild(textSpan);
    li.addEventListener('click', () => {
        ipcRenderer.send('show-entry-by-id', event.currentTarget.id);
        currentWindow.close();
    });
    resultsList.appendChild(li);
});
