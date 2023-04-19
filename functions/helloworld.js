export async function onRequest(context) {
    // Create a prepared statement with our query
    const ps = context.env.TEST
  
    return Response.json(ps);
  }