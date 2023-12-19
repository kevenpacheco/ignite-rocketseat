import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', async (table) => {
    table.uuid('id').defaultTo(knex.fn.uuid()).primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.text('date').notNullable()
    table.boolean('is_in_diet').notNullable().defaultTo(false)
    table.text('created_at').notNullable()
    table.uuid('user_id').notNullable().references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
