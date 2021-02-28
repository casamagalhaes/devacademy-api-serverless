module.exports = class App {
  constructor(event) {
    this.event = event;
  }

  router(router) {
    this.router = router;
  }

  get request() {
    const { event } = this;
    const { httpMethod, isBase64Encoded } = event;

    const extractRawBody = (body) => {
      if (!body) return Buffer.from("");

      const { isBase64Encoded } = this;
      return Buffer.from(body, isBase64Encoded ? "base64" : "utf8");
    };

    const parserBody = (body) => {
      const content = body.toString("utf8");
      return content ? JSON.parse(content) : content;
    };

    const rawBody = extractRawBody(event.body);

    return {
      method: httpMethod,
      path: event.path,
      body: rawBody,
      bodyParsed: parserBody(rawBody),
      queryStringParameters: event.queryStringParameters,
      headers: event.headers,
      isBase64Encoded,
    };
  }

  async handler() {
    try {
      const { router, request } = this;
      const matched = router.matchRoute(request.method, request.path);

      if (!matched) return this.makeResponse({ statusCode: 404, body: "Recurso não localizado" });

      const { handler, resource, params } = matched;
      const { bodyParsed } = request;

      let response = null;
      const responseFn = (data, { statusCode, headers }) => {
        response = this.makeResponse({ body: data, statusCode: statusCode || 200, headers });
      };

      const data = await handler({ params, bodyParsed }, responseFn);

      return response || this.makeResponse({ body: data });
    } catch (error) {
      console.error(error);
      console.error(error.stack);
      return this.makeResponseError(error);
    }
  }

  makeResponse({ statusCode, body, headers, isBase64Encoded } = {}) {
    return {
      statusCode: statusCode || 200,
      headers: { "content-type": "application/json", ...(headers || {}) },
      isBase64Encoded,
      body: isBase64Encoded ? body : JSON.stringify(body),
    };
  }

  makeResponseError(error) {
    switch (error.code) {
      case "VALIDATION_ERROR":
      case "NOTFOUND_ERROR":
        return this.makeResponse({ statusCode: error.statusCode, body: error.message });
      default:
        return this.makeResponse({ statusCode: 500, body: "Erro interno" });
    }
  }
};
