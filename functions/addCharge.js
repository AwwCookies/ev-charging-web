export async function onRequestPost(context) {
    const body = await context.request.json(); // get the post data as a JSON object
    const { kWh } = body; // extract the kWh and date properties from the post data
  
    let stmt = await context.env.DB.prepare(`CREATE TABLE IF NOT EXISTS charges (
      kWh INTEGER,
      date DATE
    );
    `);
    await stmt.run();
  
    stmt = context.env.DB.prepare('INSERT INTO charges (kWh, date) VALUES (?1, ?2)').bind(kWh, Date.now());
    const data = await stmt.run();
  
    return Response.json(data);
  }
  