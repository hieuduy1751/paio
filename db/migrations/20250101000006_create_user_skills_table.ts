import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_skills", (table) => {
    table.increments("id").primary()
    table.integer("user_id").unsigned().notNullable()
    table.integer("skill_id").unsigned().notNullable()
    table.integer("level").defaultTo(1)
    table.decimal("exp_multiplier", 5, 2).defaultTo(1.0)
    table.timestamps(true, true)

    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE")
    table.foreign("skill_id").references("id").inTable("skills").onDelete("CASCADE")
    table.unique(["user_id", "skill_id"])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_skills")
}
