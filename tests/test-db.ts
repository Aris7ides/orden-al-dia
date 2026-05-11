import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  fetch_types: false
})

async function test() {
  const result = await sql`select 1 as ok`
  console.log(result)
}

test()