const { DataMapper } = require("@aws/dynamodb-data-mapper");
const { Endpoint } = require("aws-sdk");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const uuid = require("uuid").v4;
const Product = require("../models/product");
const { ValidationError, NotFoundError } = require("../lib/errors");
const forAwaitOf = require("../lib/for-await-of");

module.exports = class ProductService {
  constructor() {
    this._client = new DynamoDB(
      process.env.DYNAMODB_ENDPOINT
        ? { endpoint: new Endpoint(process.env.DYNAMODB_ENDPOINT) }
        : undefined
    );
    this._mapper = new DataMapper({ client: this._client });
    this._modelClass = Product;
  }

  async validateBeforeSave(data) {
    if (!data.name) throw new ValidationError("name is required");
    if (!data.price) throw new ValidationError("price is required");
    if (data.price < 0) throw new ValidationError("price must be greater than 0");
  }

  async save(instance) {
    return this._mapper.put(instance, { onMissing: "skip" });
  }

  async create(data) {
    await this.validateBeforeSave(data);
    const instance = new this._modelClass(Object.assign({ id: uuid() }, data));
    await this.save(instance);
    return instance;
  }

  async update(id, values) {
    await this.validateBeforeSave(data);
    const instance = new this._modelClass({ id, ...values });
    return this.save(instance);
  }

  async patch(id, values) {
    const instance = await this.findById(id);
    const newValues = { id, ...values };
    Object.keys(newValues).forEach((key) => {
      instance[key] = newValues[key];
    });
    return this.save(instance);
  }

  async findAll(filter) {
    const records = [];
    const scanFilter = {
      filter: {
        type: "And",
        conditions: [
          filter || {
            type: "Function",
            name: "attribute_exists",
            subject: "id",
          },
        ],
      },
    };
    const iterator = this._mapper.scan(this._modelClass, scanFilter);
    await forAwaitOf((record) => records.push(record), iterator);
    return records;
  }

  async findById(id) {
    try {
      const instance = await this._mapper.get(new this._modelClass({ id }));
      if (!instance.deletedAt) {
        return instance;
      }
    } catch (e) {
      if (e.name === "ItemNotFoundException") throw new NotFoundError("product not found");
      throw e;
    }
  }

  async delete(id) {
    const instance = await this.findById(id);

    if (instance) {
      return this._mapper.delete(instance, { onMissing: "skip" });
    }

    throw new NotFoundError("product not found");
  }
};
