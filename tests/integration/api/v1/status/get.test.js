test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status")
  expect(response.status).toBe(200)

  const responseBody = await response.json()
  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString()

  expect(responseBody.updated_at).toEqual(parsedUpdatedAt)
  expect(responseBody.dependencies.database.pg_max_connections).toEqual(100)
  expect(responseBody.dependencies.database.pg_used_connections).toEqual(1)
  expect(responseBody.dependencies.database.pg_version).toBe("16.0")
})
