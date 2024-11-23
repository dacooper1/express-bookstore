\c bookstore
CREATE TABLE books(
  isbn text PRIMARY KEY,
  amazon_url text,
  author text,
  language TEXT
,
  pages integer,
  publisher text,
  title text,
  year integer
);

