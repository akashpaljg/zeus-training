const pg = require('pg');
const { Client } = pg

var conString = "postgres://postgres:akashpal@localhost:5432/world";

var client = new pg.Client(conString);

module.exports = {
    Client
}