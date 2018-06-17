const sqlite3 = require('sqlite3').verbose();

const saveButton = document.getElementById('save-button');
const journalContent = document.getElementById('journal-content');

var db = new sqlite3.Database('./sqldb', (err) => printError(err));

db.serialize(() => {
    const createQuery = `CREATE TABLE IF NOT EXISTS journal (text);`;
    db.run(createQuery, (err) => printError(err));

    db.all(`SELECT * FROM journal;`, (err, rows) => {
        printError(err);

        if(rows.length === 0) {
            var insertQuery = `INSERT INTO journal (text) VALUES(?)`;
            db.run(insertQuery, [''], (err) => printError(err));
        }
        else {
            const selectQuery = `SELECT * from journal;`;

            // this only works because there's 1 row in the table
            db.each(selectQuery, (err, row) => {
                printError(err);

                if(row) {
                    journalContent.value = row.text;
                }
            });
        }
    });
});

saveButton.addEventListener('click', () => {
    var text = journalContent.value;
    if(!text) return;

    var query = `UPDATE journal SET text = ?`;
    db.run(query, [text], (err) => printError(err));
});

function printError(err) {
    if(err) {
        console.error(err.message);
    }
}