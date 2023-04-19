export async function onRequest(context) {
  let stmt = context.env.DB.prepare(`CREATE TABLE IF NOT EXISTS charges (
      kWh INTEGER,
      date DATE
    );`);
  await stmt.run();

  stmt = context.env.DB.prepare('SELECT * FROM charges');
  const data = await stmt.all();
  
  return Response.json(data.results);
}