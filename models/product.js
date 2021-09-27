const { DynamoDbSchema, DynamoDbTable } = require('@aws/dynamodb-data-mapper');

class Product {
  constructor(opts = {}) {
    Object.assign(this, opts);
  }

  get [DynamoDbTable]() {
    return process.env.PRODUCTS_TABLE || 'products';
  }

  get [DynamoDbSchema]() {
    return {
      id: {
        type: 'String',
        keyType: 'HASH',
      },
      name: { type: 'String' },
      price: { type: 'Number' },
    };
  }
}

module.exports = Product;
