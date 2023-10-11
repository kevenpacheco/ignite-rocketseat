import fs from "node:fs";
import { parse } from "csv-parse";

const csvPath = new URL("./posts.csv", import.meta.url);

const stream = fs.createReadStream(csvPath);

const csvParse = parse({
  skipEmptyLines: true,
  fromLine: 2,
});

(async function () {
  const linesParse = stream.pipe(csvParse);

  for await (const line of linesParse) {
    const [title, description] = line;

    try {
      await fetch("http://localhost:3333/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
    } catch (error) {
      console.log("Erro in create task -> ", error);
    }
  }
})();
