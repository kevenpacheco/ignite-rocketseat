import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler(req, res) {
      const { id, search } = req.query;

      const tasks = database.select("tasks", {
        title: search,
        description: search,
        id,
      });

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler(req, res) {
      const { title, description } = req.body;

      database.insert("tasks", { title, description });

      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    async handler(req, res) {
      const { id } = req.params;

      const { title, description } = req.body || {};

      try {
        database.update("tasks", id, { title, description });
      } catch (error) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: error.message }));
      }

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler(req, res) {
      const { id } = req.params;

      const task = database.selectById("tasks", id);

      if (!task) {
        return res.writeHead(404).end();
      }

      try {
        if (task.completed_at) {
          database.update("tasks", id, {
            completedAt: null,
          });
        } else {
          database.update("tasks", id, {
            completedAt: new Date(),
          });
        }
      } catch (error) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: error.message }));
      }

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler(req, res) {
      const { id } = req.params;

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
];
