const App = require('./lib/app');
const productsRouter = require('./routes/products');

module.exports.handler = async (event) => {
  const app = new App(event);

  try {
    app.router(productsRouter);
    return await app.handler();
  } catch (error) {
    console.error(error);
    return app.makeResponse({
      statusCode: 500,
      body: 'server error',
    });
  }
};
