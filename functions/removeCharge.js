export async function onRequestPost(context) {
    const body = await context.request.json(); // get the post data as a JSON object
    const { date } = body; // extract the date property from the post data
  
    const stmt = context.env.DB.prepare('DELETE FROM charges WHERE date = ?').bind(date);
    const result = await stmt.run();
  
    return new Response(JSON.stringify(result));
  }
  