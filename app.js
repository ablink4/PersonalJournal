const electronSpellChecker = require('electron-spellchecker');
const SpellCheckHandler = electronSpellChecker.SpellCheckHandler;
const ContextMenuListener = electronSpellChecker.ContextMenuListener;
const ContextMenuBuilder = electronSpellChecker.ContextMenuBuilder;

const sqlite3 = require('sqlite3').verbose();
const dateformat = require('dateformat');

const saveButton = document.getElementById('save-button');
const journalContent = document.getElementById('journal-content');
const newEntryButton = document.getElementById('new-entry-button');
const previousEntryButton = document.getElementById('previous-entry-button');
const nextEntryButton = document.getElementById('next-entry-button');
const browseEntriesButton = document.getElementById('browse-entries-button');
const entryNameLabel = document.getElementById('current-entry-name');
const entryDateLabel = document.getElementById('current-entry-date');
const newEntryName = document.getElementById('new-entry-name');

window.spellCheckHandler = new SpellCheckHandler();
window.spellCheckHandler.attachToInput();

// start with US english
window.spellCheckHandler.switchLanguage('en-US');

let contextMenuBuilder = new ContextMenuBuilder(window.spellCheckHandler);
let contextMenuListener = new ContextMenuListener((info) => {
    contextMenuBuilder.showPopupMenu(info);
});

var db = new sqlite3.Database('./sqldb', (err) => printError(err));

var currentEntryId = 0; // 0 is a placeholder/default value only, not valid in the DB

db.serialize(() => {
    const createQuery = `CREATE TABLE IF NOT EXISTS journal (id INTEGER PRIMARY KEY, entryName TEXT, entryDate TEXT, entryText TEXT);`;
    db.run(createQuery, (err) => printError(err));

    db.all(`SELECT * FROM journal;`, (err, rows) => {
        printError(err);

        if(rows.length === 0) {
            var insertQuery = `INSERT INTO journal (id, entryName, entryDate, entryText) VALUES(NULL,?,?,?)`;
            db.run(insertQuery, ['Entry 1', new Date(), ''], (err) => printError(err));
        }
        else {
            const selectQuery = `SELECT * from journal;`;

            // TODO: need to query by ID of most recent entry
            db.each(selectQuery, (err, row) => {
                printError(err);

                if(row) {
                    journalContent.value = row.entryText;
                }
            });
        }
    });

    const query = `SELECT * from journal order by entryDate desc limit 1;`;
    db.all(query, (err, rows) => {
        printError(err);
        updateCurrentEntry(rows[0]);
    });
});

saveButton.addEventListener('click', () => {
    var text = journalContent.value;
    if(!text) return;

    var query = `UPDATE journal SET entryText = ? WHERE id = ?`;
    db.run(query, [text, currentEntryId], (err) => printError(err));
});

newEntryButton.addEventListener('click', () => {
    var name = newEntryName.value;

    var insertQuery = `INSERT INTO journal (id,entryName, entryDate, entryText) VALUES(NULL,?,?,?)`;
    db.run(insertQuery, [name, new Date(), ''], (err) => printError(err));

    const query = `SELECT * from journal order by entryDate desc limit 1;`;
    db.all(query, (err, rows) => {
        printError(err);
        updateCurrentEntry(rows[0]);
    });

    newEntryName.value = ''; // reset the new entry name field
});

// note: case where there is no previous/next entry handled by guard clause in
// updateCurrentEntry().  That is hacky and should be improved IMO.
previousEntryButton.addEventListener('click', () => {
    var query = `select * from journal where id < ? order by id desc limit 1;`;

    db.all(query, [currentEntryId], (err, rows) => {
        printError(err);
        updateCurrentEntry(rows[0]);
    });
});

nextEntryButton.addEventListener('click', () => {
    var query = `select * from journal where id > ? order by id asc limit 1;`;

    db.all(query, [currentEntryId], (err, rows) => {
        printError(err);
        updateCurrentEntry(rows[0]);
    });
});

function printError(err) {
    if(err) {
        console.error(err.message);
    }
}

function updateCurrentEntry(row) {
    if(!row) return;

    currentEntryId = row.id;
    journalContent.value = row.entryText;
    entryNameLabel.innerHTML = row.entryName;

    var currentEntryDateString = row.entryDate;
    var dateAsInt = parseInt(currentEntryDateString);
    var currentEntryDate = new Date(dateAsInt);
    var formattedDate = dateformat(currentEntryDate, "dddd, mmmm dS, yyyy, hh:MM TT");
    entryDateLabel.innerHTML = formattedDate;
}