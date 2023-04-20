import jwt from '@tsndr/cloudflare-worker-jwt'


export async function onRequestPost(context) {

    const secret = "8rjg8jgsdf&W^6f6h!@#"

    const body = await context.request.json(); // get the post data as a JSON object
    const { date, token } = body; // extract the date property from the post data

    if (!token) return;

    if (token && await jwt.verify(token, secret)) {
        const username = await jwt.decode(token).payload.username
        const stmt = context.env.DB.prepare('DELETE FROM charges WHERE username = ? AND date = ?').bind(username, date);
        const result = await stmt.run();

        return new Response(JSON.stringify(result));
    }
}
