export async function onRequest(context) {
    const stmt = context.env.DB.prepare('DELETE FROM charges');
    const data = await stmt.run();
    
    return Response.json(data.results);
  }