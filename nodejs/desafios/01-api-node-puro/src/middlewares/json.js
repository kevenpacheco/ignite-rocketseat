export async function json(req, res) {
  const buffers = [];
  for await (const chuck of req) {
    buffers.push(chuck);
  }

  try {
    req.body = JSON.parse(Buffer.concat(buffers).toString());
  } catch {
    req.body = null;
  }

  res.setHeader("Content-Type", "application/json");
}
