module.exports = {
    ValidationError: class extends Error { constructor(message) { super(message); this.code = 'VALIDATION_ERROR'; this.statusCode = 422; } },
    NotFoundError: class extends Error { constructor(message) { super(message); this.code = 'NOTFOUND_ERROR'; this.statusCode = 404; } },
}