DROP TABLE IF EXISTS characters;

CREATE TABLE characters(
  id SERIAL PRIMARY KEY,
  quote text,
  character text,
  image varchar(255),
  characterDirection text  
);