const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const filename = process.env.DATABASE || ':memory:';

const open = () => {
    return new sqlite3.Database(filename);
}

const create = async () => {
    const db = await open();
    const script = fs.readFileSync(`${__dirname}/migrations/database.sql`).toString();
    const statements = script.split('GO;');
    db.serialize(() => {
        for (statement of statements) {
            db.run(statement);
        }
    });
    await db.close();
    console.log('database created');
}

const destroy = async () => {
    if (filename !== ':memory:') {
        if (fs.existsSync(filename)) {
            fs.unlinkSync(filename);
        }
    }
    console.log('database destroyed');
}

const reset = async () => {
    await destroy();
    await create();
}

const execute = async (sql, params, connection) => {
    const db = connection || await open();
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err)
            else resolve(this.changes);
        })
    });
}

const query = async (sql, params, connection) => {
    const db = connection || await open();
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    open,
    execute,
    query,
    create,
    destroy,
    reset
}