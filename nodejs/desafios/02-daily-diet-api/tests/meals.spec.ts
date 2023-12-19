import { execSync } from 'node:child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

async function getFakeUserId() {
  const fakeUser = {
    email: 'test@example.com',
    password: 'test',
    name: 'John Doe',
  }

  await request(app.server).post('/auth/register').send(fakeUser).expect(201)

  const { body } = await request(app.server)
    .post('/auth/login')
    .send({
      email: fakeUser.email,
      password: fakeUser.password,
    })
    .expect(200)

  return body.user.id
}

describe('Meals routes', () => {
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

  it('should create a new meal', async () => {
    const userId = await getFakeUserId()

    const fakeMeal = {
      name: 'breakfast@example.com',
      description: 'Delicious scrambled eggs with toast and coffee',
      date: '2023-11-08T17:57:08.336Z',
      isInDiet: true,
      userId,
    }

    await request(app.server).post('/meals/register').send(fakeMeal).expect(201)
  })

  it("should return an error when it doesn't have the name", async () => {
    const userId = await getFakeUserId()

    const fakeMeal = {
      description: 'Delicious scrambled eggs with toast and coffee',
      date: '2023-11-08T17:57:08.336Z',
      isInDiet: true,
      userId,
    }

    const { body } = await request(app.server)
      .post('/meals/register')
      .send(fakeMeal)
      .expect(400)

    expect(body.errors).toEqual(
      expect.objectContaining({
        name: 'Required',
      }),
    )
  })

  it("should return an error when it doesn't have the description", async () => {
    const userId = await getFakeUserId()

    const fakeMeal = {
      name: 'Teste',
      date: '2023-11-08T17:57:08.336Z',
      isInDiet: true,
      userId,
    }

    const { body } = await request(app.server)
      .post('/meals/register')
      .send(fakeMeal)
      .expect(400)

    expect(body.errors).toEqual(
      expect.objectContaining({
        description: 'Required',
      }),
    )
  })

  it("should return an error when it doesn't have the date", async () => {
    const userId = await getFakeUserId()

    const fakeMeal = {
      name: 'breakfast@example.com',
      description: 'Delicious scrambled eggs with toast and coffee',
      isInDiet: true,
      userId,
    }

    const { body } = await request(app.server)
      .post('/meals/register')
      .send(fakeMeal)
      .expect(400)

    expect(body.errors).toEqual(
      expect.objectContaining({
        date: 'Required',
      }),
    )
  })

  it('should return an error when date is invalid', async () => {
    const userId = await getFakeUserId()

    const fakeMeal = {
      name: 'breakfast@example.com',
      description: 'Delicious scrambled eggs with toast and coffee',
      date: 'invalid-date',
      isInDiet: true,
      userId,
    }

    const { body } = await request(app.server)
      .post('/meals/register')
      .send(fakeMeal)
      .expect(400)

    expect(body.errors).toEqual(
      expect.objectContaining({
        date: 'Date must be of type ISO',
      }),
    )
  })

  it("should return an error when it doesn't have the isInDiet", async () => {
    const userId = await getFakeUserId()

    const fakeMeal = {
      name: 'breakfast@example.com',
      description: 'Delicious scrambled eggs with toast and coffee',
      date: '2023-11-08T17:57:08.336Z',
      userId,
    }

    const { body } = await request(app.server)
      .post('/meals/register')
      .send(fakeMeal)
      .expect(400)

    expect(body.errors).toEqual(
      expect.objectContaining({
        isInDiet: 'Required',
      }),
    )
  })

  it("should return an error when it doesn't have the userId", async () => {
    const fakeMeal = {
      name: 'breakfast@example.com',
      description: 'Delicious scrambled eggs with toast and coffee',
      date: '2023-11-08T17:57:08.336Z',
      isInDiet: true,
    }

    const { body } = await request(app.server)
      .post('/meals/register')
      .send(fakeMeal)
      .expect(400)

    expect(body.errors).toEqual(
      expect.objectContaining({
        userId: 'Required',
      }),
    )
  })

  it('should list meals', async () => {
    const userId = await getFakeUserId()

    const fakeMeal = {
      name: 'breakfast@example.com',
      description: 'Delicious scrambled eggs with toast and coffee',
      date: '2023-11-08T17:57:08.336Z',
      isInDiet: true,
      userId,
    }

    await request(app.server).post('/meals/register').send(fakeMeal).expect(201)

    const meals = await request(app.server).get('/meals')

    expect(meals.body[0]).toEqual(
      expect.objectContaining({
        name: fakeMeal.name,
        description: fakeMeal.description,
        date: fakeMeal.date,
        is_in_diet: fakeMeal.isInDiet,
      }),
    )
  })

  it('should get a meal by id', async () => {
    const userId = await getFakeUserId()

    await request(app.server)
      .post('/meals/register')
      .send({
        name: 'breakfast@example.com',
        description: 'Delicious scrambled eggs with toast and coffee',
        date: '2023-11-08T17:57:08.336Z',
        isInDiet: true,
        userId,
      })
      .expect(201)

    const meals = await request(app.server).get('/meals').expect(200)
    const { id } = meals.body[0]

    const mealRequest = await request(app.server)
      .get(`/meals/${id}`)
      .expect(200)

    expect(mealRequest.body).toEqual(
      expect.objectContaining({
        name: 'breakfast@example.com',
        description: 'Delicious scrambled eggs with toast and coffee',
        date: '2023-11-08T17:57:08.336Z',
        is_in_diet: 1,
        user_id: userId,
      }),
    )
  })

  it("should return an error when it doesn't find meal by id", async () => {
    const id = 'teste-id'

    const { body } = await request(app.server).get(`/meals/${id}`).expect(400)

    expect(body.error).toEqual('Meal not found!')
  })

  it('should update a meal by id', async () => {
    const userId = await getFakeUserId()

    await request(app.server)
      .post('/meals/register')
      .send({
        name: 'breakfast@example.com',
        description: 'Delicious scrambled eggs with toast and coffee',
        date: '2023-11-08T17:57:08.336Z',
        isInDiet: true,
        userId,
      })
      .expect(201)

    const meals = await request(app.server).get('/meals')
    const { id } = meals.body[0]

    const newMealData = {
      name: 'pao',
      description: 'Delicious pao',
      date: '2023-11-08T21:08:51.976Z',
      isInDiet: false,
      userId,
    }

    await request(app.server)
      .put(`/meals/${id}/update`)
      .send(newMealData)
      .expect(204)

    const mealRequest = await request(app.server).get(`/meals/${id}`)

    expect(mealRequest.body).toEqual(
      expect.objectContaining({
        name: newMealData.name,
        description: newMealData.description,
        date: newMealData.date,
        is_in_diet: newMealData.isInDiet ? 1 : 0,
        user_id: newMealData.userId,
      }),
    )
  })

  it("should return an error when it doesn't find id to update", async () => {
    const id = 'teste-id'

    const { body } = await request(app.server).put(`/meals/${id}`).expect(400)

    expect(body.error).toEqual('Meal not found!')
  })

  it('should update one piece of data at a time in the meal', async () => {
    const userId = await getFakeUserId()

    await request(app.server)
      .post('/meals/register')
      .send({
        name: 'breakfast@example.com',
        description: 'Delicious scrambled eggs with toast and coffee',
        date: '2023-11-08T17:57:08.336Z',
        isInDiet: true,
        userId,
      })
      .expect(201)

    const meals = await request(app.server).get('/meals').expect(200)
    const { id } = meals.body[0]

    const updates = [
      { key: 'name', newValue: 'pao' },
      { key: 'description', newValue: 'Delicious pao' },
      { key: 'date', newValue: '2023-11-08T21:08:51.976Z' },
      { key: 'isInDiet', newValue: false },
    ]

    for (const update of updates) {
      await request(app.server)
        .put(`/meals/${id}/update`)
        .send({ [update.key]: update.newValue, userId })
        .expect(204)

      const mealRequest = await request(app.server).get(`/meals/${id}`)

      if (update.key === 'isInDiet') {
        expect(mealRequest.body).toEqual(
          expect.objectContaining({ is_in_diet: update.newValue ? 1 : 0 }),
        )
      } else {
        expect(mealRequest.body).toEqual(
          expect.objectContaining({ [update.key]: update.newValue }),
        )
      }
    }
  })

  it('should delete a meal by id', async () => {
    const userId = await getFakeUserId()

    await request(app.server)
      .post('/meals/register')
      .send({
        name: 'breakfast@example.com',
        description: 'Delicious scrambled eggs with toast and coffee',
        date: '2023-11-08T17:57:08.336Z',
        isInDiet: true,
        userId,
      })
      .expect(201)

    const meals = await request(app.server).get('/meals')
    const { id } = meals.body[0]

    await request(app.server).delete(`/meals/${id}`).expect(204)
  })
})
