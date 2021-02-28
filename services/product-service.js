const uuid = require('uuid').v4;
const database = require('../database');
const { ValidationError, NotFoundError } = require('../lib/errors');

module.exports = class ProductService {
    constructor(connection) {
        this.connection = connection || database.open();
    }

    async validateBeforeSave(data) {
        if (!data.name) throw new ValidationError('name is required');
        if (!data.price) throw new ValidationError('price is required');
        if (data.price < 0) throw new ValidationError('price must be greater than 0');
    }

    async create(data) {
        await this.validateBeforeSave(data);
        const contents = Object.assign({ id: uuid() }, data);
        await database.execute(
            `INSERT INTO products (id, name, price) VALUES (?, ?, ?)`,
            [contents.id, contents.name, contents.price],
            this.connection
        );
        return contents;
    }

    async update(id, data) {
        await this.validateBeforeSave(data);
        return await database.execute(
            `UPDATE products SET name = ?, price = ? WHERE id = ?`,
            [data.name, data.price, data.id],
            this.connection
        );
    }

    async findAll() {
        return await database.query('SELECT * FROM products', [], this.connection);
    }

    async findById(id) {
        const data = await database.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id], this.connection);
        if (!data || !data.length) throw new NotFoundError('product not found');
        return data[0];
    }

    async delete(id) {
        const affectedRows = await database.execute('DELETE FROM products WHERE id = ?', [id], this.connection);
        if (!affectedRows) throw new NotFoundError('product not found');
        return affectedRows;
    }
}