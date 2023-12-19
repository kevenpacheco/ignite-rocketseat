import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const registerBodySchema = z
      .object({
        date: z.string().datetime({ message: 'Date must be of type ISO' }),
        description: z.string(),
        name: z.string(),
        isInDiet: z.boolean(),
        userId: z.string(),
      })
      .transform((values) => {
        return {
          ...values,
          isInDiet: values.isInDiet ? 1 : 0,
        }
      })

    try {
      const { userId, ...mealData } = registerBodySchema.parse(request.body)

      const { date, description, isInDiet, name } = mealData

      await knex('meals').insert({
        description,
        is_in_diet: isInDiet,
        name,
        date,
        user_id: userId,
        created_at: new Date().toISOString(),
      })

      return reply.status(201).send()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors = error.issues.reduce((acc, { path, message }) => {
          return {
            ...acc,
            [path[0]]: message,
          }
        }, {})

        return reply.status(400).send({ errors: zodErrors })
      }
    }
  })

  app.get('/', async () => {
    const meals = await knex('meals').select('*')
    return meals.map((meal) => {
      return {
        ...meal,
        is_in_diet: meal.is_in_diet === 1,
      }
    })
  })

  app.get('/:id', async (request, reply) => {
    const requestParamsSchema = z.object({
      id: z.string(),
    })
    const { id } = requestParamsSchema.parse(request.params)

    const meal = await knex('meals').select('*').where('id', id).first()

    if (!meal) {
      return reply.status(400).send({ error: 'Meal not found!' })
    }

    return meal
  })

  app.put('/:id/update', async (request, reply) => {
    const requestParamsSchema = z.object({
      id: z.string(),
    })

    const requestBodySchema = z.object({
      date: z.string().datetime().optional(),
      description: z.string().optional(),
      name: z.string().optional(),
      isInDiet: z.boolean().optional(),
      userId: z.string(),
    })

    const { id } = requestParamsSchema.parse(request.params)
    const { userId, ...updates } = requestBodySchema.parse(request.body)

    const meal = await knex('meals')
      .select('*')
      .where('id', id)
      .where('user_id', userId)
      .first()

    if (!meal) {
      return reply.status(400).send({ error: 'Meal not found!' })
    }

    const updateQuery = knex('meals').where('id', id).where('user_id', userId)

    for (const [key, newValue] of Object.entries(updates)) {
      if (key === 'isInDiet') {
        updateQuery.update('is_in_diet', newValue)
      } else {
        updateQuery.update(key, newValue)
      }
    }

    try {
      await updateQuery

      return reply.status(204).send({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors = error.issues.reduce((acc, { path, message }) => {
          return {
            ...acc,
            [path[0]]: message,
          }
        }, {})

        return reply.status(400).send({ errors: zodErrors })
      }
    }
  })

  app.delete('/:id', async (request, reply) => {
    const requestParamsSchema = z.object({
      id: z.string(),
    })
    const { id } = requestParamsSchema.parse(request.params)

    await knex('meals').where('id', id).del()

    return reply.status(204).send({})
  })

  app.get('/:id/statistics', async (request, reply) => {
    const requestParamsSchema = z.object({
      id: z.string(),
    })

    try {
      const { id } = requestParamsSchema.parse(request.params)

      const meals = await knex('meals').where('user_id', id).select('*')

      const statistics = meals.reduce(
        (acc, meal) => {
          const data = {
            quantity: acc.quantity + 1,
            inDiet: 0,
            outDiet: 0,
            bestInDietSequency: 0,
          }

          if (meal.is_in_diet) {
            data.inDiet = acc.inDiet + 1
          } else {
            data.outDiet = acc.outDiet + 1
          }

          return data
        },
        {
          quantity: 0,
          inDiet: 0,
          outDiet: 0,
          bestInDietSequency: 0,
        },
      )

      return statistics
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors = error.issues.reduce((acc, { path, message }) => {
          return {
            ...acc,
            [path[0]]: message,
          }
        }, {})

        return reply.status(400).send({ errors: zodErrors })
      }
    }
  })
}
