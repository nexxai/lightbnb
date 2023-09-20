DROP TABLE IF EXISTS property_reviews CASCADE;

DROP TABLE IF EXISTS reservations CASCADE;

DROP TABLE IF EXISTS properties CASCADE;

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE
  users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL
  );

CREATE TABLE
  properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cost_per_night INTEGER NOT NULL,
    parking_spaces INTEGER NOT NULL,
    number_of_bathrooms INTEGER NOT NULL,
    number_of_bedrooms INTEGER NOT NULL,
    thumbnail_url VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    post_code VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE
  );

CREATE TABLE
  reservations (
    id SERIAL PRIMARY KEY,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    property_id INTEGER NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
    guest_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE
  );

CREATE TABLE
  property_reviews (
    id SERIAL PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    rating SMALLINT NOT NULL DEFAULT 0,
    property_id INTEGER NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
    guest_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    reservation_id INTEGER NOT NULL REFERENCES reservations (id) ON DELETE CASCADE
  );