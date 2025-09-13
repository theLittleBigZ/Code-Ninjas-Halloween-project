exports.up = function(knex) {
  return knex.schema.createTable('registrations', (table) => {
    table.increments('id_int').primary();
    table.string('id').notNullable().unique();
    table.uuid('uuid').notNullable().unique();
    table.timestamp('createdAt').notNullable();
    table.string('parentFirst');
    table.string('parentLast');
    table.string('email');
    table.string('phone');
    table.string('postal');
    table.integer('numPhotos');
    table.text('children');
    table.text('ages');
    table.string('consent');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('registrations');
};
