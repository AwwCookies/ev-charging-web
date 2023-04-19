export async function onRequest(context) {
    // Create a prepared statement with our query
    const ps = context.env.TEST.prepare('SELECT * from Customers');
    const data = await ps.first();
  
    return Response.json(data);
  }