const { v4: uuid } = require('uuid');
const { DataMapper } = require('@aws/dynamodb-data-mapper');
const { Endpoint } = require('aws-sdk');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const Product = require('../models/product');
const { ValidationError, NotFoundError } = require('../lib/errors');

const { DYNAMODB_ENDPOINT } = process.env;

module.exports = class ProductService {
  constructor() {
    this._client = new DynamoDB({
      ...(DYNAMODB_ENDPOINT && {
        endpoint: new Endpoint(process.env.DYNAMODB_ENDPOINT),
      }),
    });
    this._mapper = new DataMapper({ client: this._client });
    this._modelClass = Product;
  }

  async validateBeforeSave(product) {
    if (!product.name) throw new ValidationError('name is required');
    if (!product.price) throw new ValidationError('price is required');
    if (product.price < 0)
      throw new ValidationError('price must be greater than 0');
  }

  async save(instance) {
    return await this._mapper.put(instance, { onMissing: 'skip' });
  }

  async create(data) {
    await this.validateBeforeSave(data);
    const product = new this._modelClass({ id: uuid(), ...data });
    await this.save(product);
    return product;
  }

  async validateExists(id) {
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundError('product not found');
  }

  async update(id, data) {
    if (id !== data.id)
    throw new ValidationError('resource id is different from the body id');
    await this.validateBeforeSave(data);
    await this.validateExists(id);
    const product = new this._modelClass({ id, ...data });
    return this.save(product);
  }

  async patch(id, data) {
    await this.validateExists(id);
    const product = await this.findById(id);
    Object.assign(product, { id, ...data });
    return this.save(product);
  }

  async findAll(filter) {
    const products = [];
    const scanFilter = {
      filter: {
        type: 'And',
        conditions: [
          filter || {
            type: 'Function',
            name: 'attribute_exists',
            subject: 'id',
          },
        ],
      },
    };
    const iterator = this._mapper.scan(this._modelClass, scanFilter);
    for await (const product of iterator) products.push(product);
    return products;
  }

  async findById(id) {
    try {
      const product = await this._mapper.get(new this._modelClass({ id }));
      if (!product.deletedAt) return product;
    } catch (e) {
      if (e.name === 'ItemNotFoundException')
        throw new NotFoundError('product not found');
      throw e;
    }
  }

  async delete(id) {
    const product = await this.findById(id);
    if (!product) throw new NotFoundError('product not found');
    return this._mapper.delete(product, { onMissing: 'skip' });
  }
};
