import jwt from '@tsndr/cloudflare-worker-jwt'


export async function onRequest(context) {
  const secret = await context.env.KV.get("secret") || "secret"
  const body = await context.request.json(); // get the post data as a JSON object
  const { token } = body; // extract the kWh and date properties from the post data
  if (token && await jwt.verify(token, secret)) {
    const username = await jwt.decode(token).payload.username
    let stmt = context.env.DB.prepare(`CREATE TABLE IF NOT EXISTS charges (
        kWh INTEGER,
        date DATE,
        username TEXT
      );`);
    await stmt.run();

    stmt = context.env.DB.prepare('SELECT * FROM charges WHERE username = ?').bind(username);
    const data = await stmt.all();

    return Response.json(data.results);
  }
  return Response.json([])
}