export async function onRequest(context) {
    const data = await context.env.DB.prepare('SELECT * FROM charges').run();
    return Response.json(data);  
  }