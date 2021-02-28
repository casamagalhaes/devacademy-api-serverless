const { DynamoDbSchema, DynamoDbTable } = require("@aws/dynamodb-data-mapper");

class Product {
  constructor(opts) {
    if (opts) {
      Object.keys(opts).forEach((key) => {
        this[key] = opts[key];
      });
    }
  }
}

Object.defineProperties(Product.prototype, {
  [DynamoDbTable]: {
    value: process.env.PRODUCTS_TABLE || "products",
  },
  [DynamoDbSchema]: {
    value: {
      id: {
        type: "String",
        keyType: "HASH",
      },
      name: { type: "String" },
      price: { type: "Number" },
    },
  },
});

module.exports = Product;
