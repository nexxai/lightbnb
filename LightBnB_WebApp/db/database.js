// const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg");

const pool = new Pool({
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [
      email.toLowerCase(),
    ])
    .then((result) => {
      console.log(result.rows[0]);
      return Promise.resolve(result.rows[0]);
    })
    .catch((err) => {
      console.log(err.message);
      return Promise.resolve(null);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [id])
    .then((result) => {
      console.log(result.rows[0]);
      return Promise.resolve(result.rows[0]);
    })
    .catch((err) => {
      console.log(err.message);
      return Promise.resolve(null);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
    .query(
      `INSERT INTO users (name, password, email) VALUES ($1, $2, $3) RETURNING *;`,
      [user.name, user.password, user.email]
    )
    .then((result) => {
      console.log(result.rows[0]);
      return Promise.resolve(result.rows[0]);
    })
    .catch((err) => {
      console.log(err.message);
      return Promise.resolve(null);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(
      `
SELECT
  reservations.id,
  properties.*,
  reservations.*,
  AVG(rating) AS average_rating
FROM
  reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE
  reservations.guest_id = $2
GROUP BY
  properties.id,
  reservations.id
ORDER BY
  reservations.start_date
LIMIT 
  $1
  `,
      [limit, guest_id]
    )
    .then((result) => {
      console.log(result.rows);
      return Promise.resolve(result.rows);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id`;

  let queryWheres = [];
  // 3
  if (options.city) {
    queryWheres.push([`%${options.city}%`, `city LIKE `]);
  }

  if (options.owner_id) {
    queryWheres.push([options.owner_id, `owner_id = `]);
  }

  if (options.minimum_price_per_night) {
    queryWheres.push([options.minimum_price_per_night, `cost_per_night >= `]);
  }

  if (options.maximum_price_per_night) {
    queryWheres.push([options.maximum_price_per_night, `cost_per_night <= `]);
  }

  // If even one where clause is specified, let's start building it up
  if (queryWheres.length > 0) {
    // Prepend "WHERE" to the beginning of this piece of the queryString
    queryString += `
  WHERE `;
    let whereCounter = 0;

    // Progressively loop through each clause and add them to the statement
    // being sure to add both the clause itself and the positioning of the variable in the statement
    queryWheres.forEach((clause) => {
      queryParams.push(clause[0]);
      queryString += clause[1] + `$${queryParams.length}`;

      // If there are more than one clause but we're not at the end, add an "AND" between each clause
      whereCounter++;
      if (whereCounter < queryWheres.length) {
        queryString += " AND ";
      }
    });
  }

  queryString += `
  GROUP BY properties.id `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `
  HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  }

  // 4
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
