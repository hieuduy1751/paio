import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("skills", (table) => {
    table.increments("id").primary()
    table.string("name", 100).notNullable().unique()
    table.text("description")
    table.string("icon", 50)
    table.integer("base_exp").defaultTo(10)
    table.timestamps(true, true)
  })

  // Insert default skills
  await knex("skills").insert([
    { name: "Reading", description: "Knowledge through books", icon: "Book", base_exp: 15 },
    { name: "Hygiene", description: "Personal care and cleanliness", icon: "Bath", base_exp: 10 },
    { name: "Cooking", description: "Culinary mastery", icon: "ChefHat", base_exp: 20 },
    { name: "Household", description: "Maintaining your space", icon: "Home", base_exp: 15 },
    { name: "Focus", description: "Deep work and concentration", icon: "Target", base_exp: 25 },
  ])
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("skills")
}
