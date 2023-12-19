import fastify from 'fastify'
import { authRoutes, mealsRoutes } from './routes'

export const app = fastify()

app.register(authRoutes, { prefix: 'auth' })
app.register(mealsRoutes, { prefix: 'meals' })
