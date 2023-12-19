import { knex } from '../database'

export class KnexDateTransform {
  toDate(knexTimestamp: string) {
    console.log(knexTimestamp)
  }

  toKnexTimestamp(date: Date) {
    console.log(date)

    // const day = String(date.getDay()).padStart(2, '0')
    // const month = String(date.getMonth()).padStart(2, '0')
    // const year = String(date.getFullYear()).padStart(4, '0')

    // const hours = String(date.getHours()).padStart(2, '0')
    // const minutes = String(date.getMinutes()).padEnd(2, '0')
    // const seconds = String(date.getSeconds()).padStart(2, '0')

    // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

    return knex.raw('?', [date.toISOString()])
  }
}
