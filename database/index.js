const fs = require('fs');
const { promisify } = require('util');
const sqlite3 = require('sqlite3').verbose();

const DATABASE_FILENAME = process.env.DATABASE || ':memory:';

const open = () => new sqlite3.Database(DATABASE_FILENAME);

const ensureConnection = async (alreadyConnection) => {
  const connection = alreadyConnection || open();
  const runAsync = promisify(connection.run).bind(connection);
  const allAsync = promisify(connection.all).bind(connection);
  const closeAsync = promisify(connection.close).bind(connection);
  return { connection, runAsync, allAsync, closeAsync };
};

const runScript = async (script, alreadyConnection) => {
  const { connection, closeAsync, runAsync } = await ensureConnection(alreadyConnection);
  return new Promise((resolve, reject) =>
    connection.serialize(async () => {
      try {
        for (statement of script.split('GO;')) {
          console.log('[execute]: sql: %s', statement.trim());
          await runAsync(statement);
        }
        return resolve();
      } catch (error) {
        return reject(error);
      }
    })
  );
};

const create = async () => {
  const { connection, closeAsync, runAsync } = await ensureConnection();
  const script = await fs.promises.readFile(`${__dirname}/migrations/database.sql`, {
    encoding: 'utf-8',
  });
  await runScript(script, connection);
  await closeAsync();
  console.log('[database] created');
};

const destroy = async () => {
  const isInMemory = DATABASE_FILENAME === ':memory:';
  if (!isInMemory && fs.existsSync(DATABASE_FILENAME)) await fs.promises.unlink(DATABASE_FILENAME);
  console.log('[database] destroyed');
};

const reset = async () => {
  await destroy();
  await create();
};

const execute = async (sql, params, alreadyConnection) => {
  const { runAsync } = await ensureConnection(alreadyConnection);
  console.log('[execute]: sql: %s \n\t params:', sql, params);
  return await runAsync(sql, params);
};

const query = async (sql, params, alreadyConnection) => {
  const { allAsync } = await ensureConnection(alreadyConnection);
  console.log('[query]: sql: %s \n\t params:', sql, params);
  return await allAsync(sql, params);
};

const bootstrap = async () => {
  await create();
};

module.exports = {
  bootstrap,
  open,
  execute,
  query,
  create,
  destroy,
  reset,
};
