DROP TABLE favorites;
DROP TABLE stories;
DROP TABLE users;

CREATE TABLE users
(
  username text PRIMARY KEY,
  name text NOT NULL,
  password text NOT NULL,
  phone text,
  createdAt timestamp DEFAULT current_timestamp NOT NULL,
  updatedAt timestamp DEFAULT current_timestamp NOT NULL
);

CREATE TABLE stories
(
  storyId serial PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  author text NOT NULL,
  username text NOT NULL REFERENCES users ON DELETE CASCADE,
  createdAt timestamp DEFAULT current_timestamp NOT NULL,
  updatedAt timestamp DEFAULT current_timestamp NOT NULL
);

CREATE TABLE favorites
(
  username text NOT NULL REFERENCES users ON DELETE CASCADE,
  storyId integer NOT NULL REFERENCES stories ON DELETE CASCADE,
  PRIMARY KEY(username, storyId)
);