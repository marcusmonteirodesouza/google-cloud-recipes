/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  if (!(await knex.schema.hasTable('invoices'))) {
    await knex.schema.createTable('invoices', table => {
      table
        .uuid('id', {primaryKey: true})
        .defaultTo(knex.raw('gen_random_uuid()'));
      table.string('vendor_id').notNullable();
      table.timestamps(true, true);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  if (await knex.schema.hasTable('invoices')) {
    await knex.schema.dropTable('invoices');
  }
};
