import { createServer } from "node:http";
import { routes } from "./routes.js";
import { json } from "./middlewares/json.js";
import { extractQueryParams } from "./utils/extract-query-params.js";

const server = createServer(async (req, res) => {
  const { method, url } = req;

  const route = routes.find((route) => {
    return route.method === method && route.path.test(url);
  });

  if (!route) {
    res.writeHead(404).end(
      JSON.stringify({
        method: method,
        url: url,
        message: "Rota não encontrada",
      })
    );
  }
  
  await json(req, res);

  const routeParams = url.match(route.path);

  const { query, ...params } = routeParams.groups;

  req.query = query ? extractQueryParams(query) : {};
  req.params = params;

  return route.handler(req, res);
});

server.listen(3333);
