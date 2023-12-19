import { execSync } from 'node:child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should create a new user', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'test',
        name: 'John Doe',
      })
      .expect(201)
  })

  it('should login a user', async () => {
    const email = 'test@example.com'
    const password = 'test'
    const name = 'John Doe'

    await request(app.server)
      .post('/auth/register')
      .send({
        email,
        password,
        name,
      })
      .expect(201)

    const loginResponse = await request(app.server)
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200)

    expect(loginResponse.body.user).toEqual(
      expect.objectContaining({
        email,
        name,
      }),
    )

    expect(loginResponse.body.user).toHaveProperty('id')
  })
})
