// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  interface Meal {
    id: number
    name: string
    description: string
    date: string
    is_in_diet: number
    created_at: string
    user_id: string
  }

  interface User {
    id: number
    name: string
    email: string
    created_at: string
    password: string
  }

  export interface Tables {
    users: User
    meals: Meal
  }
}
