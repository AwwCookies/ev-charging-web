export async function onRequest(context) {
    const { results } = await context.env.text.prepare(
        "SELECT * FROM Customers WHERE CompanyName = ?"
      )
        .bind("Bs Beverages")
        .all();
    return new Response(results)
}