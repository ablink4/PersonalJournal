const sqlite3 = require('sqlite3').verbose();

const saveButton = document.getElementById('save-button');
const journalContent = document.getElementById('journal-content');

var db = new sqlite3.Database('./sqldb', (err) => {
    if (err) {
        console.error(err.message);
    }
});

db.serialize(() => {
    const createQuery = `CREATE TABLE IF NOT EXISTS journal (text);`;
    db.run(createQuery, (err) => {
        if(err) {
            console.error(err.message);
        }
    });

    db.all(`SELECT * FROM journal;`, (err, rows) => {
        if(err) {
            console.error(err.message);
        }

        if(rows.length === 0) {
            var insertQuery = `INSERT INTO journal (text) VALUES(?)`;
            db.run(insertQuery, [''], (err) => {
                if(err) {
                    console.error(err.message);
                }
            });
        }
        else {
            const selectQuery = `SELECT * from journal;`;

            // this only works because there's 1 row in the table
            db.each(selectQuery, (err, row) => {
                if(err) {
                    console.error(err.message);
                }

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
    db.run(query, [text], (err) => {
        if(err) {
            console.error(err.message);
        }
    });
});