import jwt from '@tsndr/cloudflare-worker-jwt'

const username = "emma"
const password = "cookies"

export async function onRequestPost(context) {
    const secret = await context.env.KV.get("secret") || "secret"

    const body = await context.request.json(); // get the post data as a JSON object
    const { username, password } = body; // extract the kWh and date properties from the post data

    if (username === "emma" && password === "cookies") {
        return Response.json({
            success: true,
            token: await jwt.sign({ username }, secret)
        });
    } else {
        return Response.json({ success: false })
    }
}
