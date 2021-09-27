const { Endpoint } = require('aws-sdk');
const DynamoDB = require('aws-sdk/clients/dynamodb');

const { DYNAMODB_ENDPOINT } = process.env;

const dynamodb = new DynamoDB({
  ...(DYNAMODB_ENDPOINT && {
    endpoint: new Endpoint(process.env.DYNAMODB_ENDPOINT),
  }),
});

const tables = [
  {
    TableName: 'products',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 100,
      WriteCapacityUnits: 100,
    },
  },
];

const exists = async (TableName) => {
  try {
    await dynamodb.describeTable({ TableName }).promise();
    return true;
  } catch (e) {
    if (e.code !== 'ResourceNotFoundException') throw e;
    return false;
  }
};

const create = async () => {
  for (const table of tables) {
    const tableExists = await exists(table.TableName);
    if (tableExists) continue;
    await dynamodb.createTable(table).promise();
  }
  console.log('[database] created');
};

const destroy = async () => {
  for (const { TableName } of tables) {
    const tableExists = await exists(TableName);
    if (!tableExists) continue;
    await dynamodb.deleteTable({ TableName }).promise();
  }
  console.log('[database] destroyed');
};

const reset = async () => {
  await destroy();
  await create();
};

module.exports = { create, destroy, reset };
