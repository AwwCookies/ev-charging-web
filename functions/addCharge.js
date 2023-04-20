import jwt from '@tsndr/cloudflare-worker-jwt'


export async function onRequestPost(context) {
    const body = await context.request.json(); // get the post data as a JSON object
    const { kWh, token } = body; // extract the kWh and date properties from the post data

    if (token && await jwt.verify(token, "8rjg8jgsdf&W^6f6h!@#")) { 
        const username = await jwt.decode(token).payload.username

        let stmt = await context.env.DB.prepare(`CREATE TABLE IF NOT EXISTS charges (
          kWh INTEGER,
          date DATE,
          username TEXT
        );
        `);
        await stmt.run();
      
        stmt = context.env.DB.prepare('INSERT INTO charges (kWh, date, username) VALUES (?1, ?2, ?3)').bind(kWh, Date.now(), username);
        const data = await stmt.run();
      
        return Response.json(data);
    } else {
        console.error("Invalid token")
    }

  }
  