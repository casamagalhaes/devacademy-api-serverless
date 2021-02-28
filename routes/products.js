const Router = require("./../lib/router");
const ProductService = require("../services/product-service");
const productService = new ProductService();

const router = new Router({ prefix: "products" });

router.get("/", async () => {
  const data = await productService.findAll();
  return data;
});

router.post("/", async (req, res) => {
  const data = await productService.create(req.bodyParsed);
  return res(data, { statusCode: 201 });
});

router.get("/{id}", async (req) => {
  const data = await productService.findById(req.params.id);
  return data;
});

router.put("/{id}", async (req) => {
  const data = await productService.update(req.params.id, req.bodyParsed);
  return data;
});

router.delete("/{id}", async (req, res) => {
  await productService.delete(req.params.id);
  return res(null, { statusCode: 204 });
});

module.exports = router;
