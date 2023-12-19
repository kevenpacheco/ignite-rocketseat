import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const registerBodySchema = z.object({
      email: z.string().email(),
      name: z.string(),
      password: z.string(),
    })

    const { email, name, password } = registerBodySchema.parse(request.body)

    await knex('users').insert({
      created_at: new Date().toISOString(),
      email,
      name,
      password,
    })

    return reply.status(201).send()
  })

  app.post('/login', async (request, reply) => {
    const loginBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = loginBodySchema.parse(request.body)

    const user = await knex('users')
      .where({
        email,
        password,
      })
      .select('email', 'name', 'id')
      .first()

    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password!' })
    }

    return reply.status(200).send({ user })
  })
}
