const fs = require("fs");
const os = require("os");
const sqlite3 = require("sqlite3").verbose();
const executionEnv = process.env.AWS_EXECUTION_ENV || "local";
const isLambda = executionEnv.startsWith("AWS");
const filename = process.env.DATABASE || `${os.tmpdir()}/db.sqlite`;

const open = () => {
  return new sqlite3.Database(filename);
};

const execute = async (sql, params, connection) => {
  const db = connection || (await open());
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

const create = async (directory = __dirname) => {
  const db = await open();
  const script = fs.readFileSync(`${directory}/migrations/database.sql`).toString();
  const statements = script.split("GO;");
  const promises = [];

  db.serialize(() => {
    for (statement of statements) {
      promises.push(execute(statement, [], db));
    }
  });

  await Promise.all(promises);
  await db.close();

  console.log("database created");
};

const destroy = async () => {
  if (filename !== ":memory:") {
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
  }
  console.log("database destroyed");
};

const reset = async () => {
  await destroy();
  await create();
};

const query = async (sql, params, connection) => {
  const db = connection || (await open());
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const bootstrap = async () => {
  await create();
};

module.exports = {
  open,
  execute,
  query,
  create,
  destroy,
  reset,
  bootstrap,
};
