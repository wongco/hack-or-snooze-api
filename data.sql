DROP TABLE favorites;
DROP TABLE stories;
DROP TABLE users;

CREATE TABLE users
(
  username text PRIMARY KEY,
  name text NOT NULL,
  password text NOT NULL,
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

-- INSERT INTO users VALUES ('yay2', 'PiratesArrrrGreat2', '654321');

INSERT INTO stories (title, url, author, username) VALUES ('Psy - Gentleman', 'https://www.youtube.com/watch?v=ASO_zypdnsQ&list=PLFd8oTOTa63XxaqljzpJ_PbrZj22NJ0iK', 'ArrrrPirates', 'bob');

INSERT INTO favorites VALUES ('bob', 1);