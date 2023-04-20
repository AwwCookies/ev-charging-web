import jwt from '@tsndr/cloudflare-worker-jwt'


export async function onRequest(context) {
    const secret = await context.env.KV.get("secret") || "secret"
    const body = await context.request.json(); // get the post data as a JSON object
    const { token } = body; // extract the date property from the post data

    if (!token) return;

    if (token && await jwt.verify(token, secret)) {
        const username = await jwt.decode(token).payload.username

        const stmt = context.env.DB.prepare('DELETE FROM charges WHERE username = ?').bind(username);
        const data = await stmt.run();
    
        return Response.json(data.results);
    }
}