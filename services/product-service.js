const uuid = require('uuid').v4;
const database = require('../database');
const { ValidationError, NotFoundError } = require('../lib/errors');

module.exports = class ProductService {
  constructor(connection) {
    this.connection = connection || database.open();
  }

  async validateBeforeSave(product) {
    if (!product.name) throw new ValidationError('name is required');
    if (!product.price) throw new ValidationError('price is required');
    if (product.price < 0) throw new ValidationError('price must be greater than 0');
  }

  async create(product) {
    await this.validateBeforeSave(product);
    const contents = Object.assign({ id: uuid() }, product);
    await database.execute(
      `INSERT INTO products (id, name, price) VALUES (?, ?, ?)`,
      [contents.id, contents.name, contents.price],
      this.connection
    );
    return contents;
  }

  async validateExists(id) {
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundError('product not found');
  }

  async update(id, product) {
    if (id !== product.id) throw new ValidationError('resource id is different from the body id');
    await this.validateBeforeSave(product);
    await this.validateExists(id);
    await database.execute(
      'UPDATE products SET `name` = ?, `price` = ? WHERE `id` = ?',
      [product.name, product.price, product.id],
      this.connection
    );
    return await this.findById(id);
  }

  async findAll() {
    return await database.query('SELECT * FROM products', [], this.connection);
  }

  async findById(id) {
    const [product] = await database.query(
      'SELECT * FROM products WHERE id = ? LIMIT 1',
      [id],
      this.connection
    );
    if (!product) throw new NotFoundError('product not found');
    return product;
  }

  async delete(id) {
    await this.validateExists(id);
    await database.execute('DELETE FROM products WHERE id = ?', [id], this.connection);
  }
};
