import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf8")
      .then((data) => (this.#database = JSON.parse(data)))
      .catch(() => this.#persist());
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, filters) {
    const databaseTable = this.#database[table];

    const hasFilter = Object.keys(filters).some((key) => {
      return filters[key];
    });

    if (!hasFilter) {
      return databaseTable || [];
    }

    const filteredDatabaseTable = databaseTable.filter((row) => {
      return Object.entries(filters).some(([key, value]) => {
        return String(row[key])
          .toLocaleLowerCase()
          .includes(String(value).toLocaleLowerCase());
      });
    });

    return filteredDatabaseTable || [];
  }

  selectById(table, id) {
    const databaseTable = this.#database[table];

    const task = databaseTable.find((row) => {
      return row.id === id;
    });

    return task;
  }

  insert(table, data) {
    const { title, description } = data;

    if (!title || !description) {
      new Error("Please insert a title and description");
    }

    const newTask = {
      id: randomUUID(),
      title,
      description,
      completed_at: null,
      created_at: new Date(),
      updated_at: null,
    };

    if (this.#database[table]) {
      this.#database[table].push(newTask);
    } else {
      this.#database[table] = [newTask];
    }

    this.#persist();
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex < 0) {
      throw new Error("Please insert a valid task id");
    }

    const row = this.#database[table][rowIndex];

    const newData = {
      id: row.id,
      title: data?.title || row.title,
      description: data?.description || row.description,
      completed_at: data.hasOwnProperty("completedAt")
        ? data.completedAt
        : row.completed_at,
      created_at: row.created_at,
      updated_at: new Date(),
    };

    this.#database[table][rowIndex] = newData;

    this.#persist();
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex < 0) {
      return;
    }

    this.#database[table].splice(rowIndex, 1);
    this.#persist();
  }
}
