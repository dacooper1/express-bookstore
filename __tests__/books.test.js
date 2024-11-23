/** Integration tests for books route */


process.env.NODE_ENV = "test"

const request = require("supertest");


const app = require("../app");
const db = require("../db");


// isbn of sample book
let book_isbn;

beforeEach(async () => {
    let results = await db.query(`
    INSERT INTO books (isbn, amazon_url,author,language,pages,publisher,title,year)
    VALUES (
        '0358447844',
        'https://www.amazon.ca/Wool-Hugh-Howey/dp/0358447844/ref=sr_1_2?dib=eyJ2IjoiMSJ9.SEQTSofQkd3WFW0b2B2njbK_1GkpxYcAPj8xnGou8kN93SDiUmXFMp5z1A56R4WbvCEwMJwoM8bvK1TSYvOvwdLThlteq-7wnA93f4OjWMM8QKbB3ZMbSxu9dgWPnBqIJJEK567uqZm70sozqSKg1jX0j2_dV9B0Iq9hlmFHv922key0ApF1OYJJuVzJ9AnAejb-Q7WHXCv67h2sLHdxiZg-zKWoMa_eWeLDHgkEEGo.S_A37uaXeG4NZjkIufRlsUnRmiKrYbB3_UKN29ENxj0&dib_tag=se&qid=1732380539&refinements=p_lbr_books_series_browse-bin%3ASilo&s=books&sr=1-2',
        'Hugh Howey',
        'English',
        592,
        'William Morrow Paperbacks',
        'Wool: Book One of the Silo Series',
        2020)
        RETURNING isbn`)

        book_isbn = results.rows[0].isbn

        console.log(`BEFORE EACH book_isbn in test: ${book_isbn}`);

})



describe("POST /books", () => {
    test("Creates a new book", async () => {
        const response = await request(app)
            .post('/books')
            .send({
                isbn: '32794782',
                amazon_url: "https://football.com",
                author: "mctest",
                language: "english",
                pages: 1000,
                publisher: "yeah right",
                title: "amazing times",
                year: 1999
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty('isbn');
    })
})

describe("GET /books", () => {
    test("Gets a list of 1 book", async () => {
        const response = await request(app)
            .get('/books')
        expect(response.statusCode).toBe(200);
        expect(response.body.books).toHaveLength(1);
        expect(Array.isArray(response.body.books)).toBe(true);
        expect(response.body.books[0]).toHaveProperty('isbn');

    })
})

describe("GET /books/:id", () => {

    test("Gets 1 book by id", async () => {
        const response = await request(app).get(`/books/${book_isbn}`);
    
        // Log response for debugging
        console.log(`Response body:`, response.body);
    
        // Assertions
        expect(response.statusCode).toBe(200); // Status code should be 200
        expect(response.body).toHaveProperty("book"); // Response must have a "book" key
        expect(response.body.book).toHaveProperty("isbn"); // "book" must have an "isbn"
        expect(response.body.book.isbn).toBe(book_isbn); // "isbn" must match the test value
    });
  
    test("Responds with 404 if can't find book in question", async () => {
      const response = await request(app)
          .get(`/books/999`)
      expect(response.statusCode).toBe(404);
    });
 
})

describe("PUT /books/:isbn", function () {
    test("Updates a single book", async function () {
      const response = await request(app)
          .put(`/books/${book_isbn}`)
          .send({
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "UPDATED BOOK",
            year: 2000
          });
      expect(response.body.book).toHaveProperty("isbn");
      expect(response.body.book.title).toBe("UPDATED BOOK");
    });
  
    test("Prevents a bad book update", async function () {
      const response = await request(app)
          .put(`/books/${book_isbn}`)
          .send({
            isbn: "32794782",
            badField: "DO NOT ADD ME!",
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "UPDATED BOOK",
            year: 2000
          });
      expect(response.statusCode).toBe(400);
    });
  
    test("Responds 404 if can't find book in question", async function () {
      // delete book first
      await request(app)
          .delete(`/books/${book_isbn}`)
      const response = await request(app).delete(`/books/${book_isbn}`);
      expect(response.statusCode).toBe(404);
    });
  });

describe("DELETE /books/:id", function () {
    test("Deletes a single a book", async function () {
      const response = await request(app)
          .delete(`/books/${book_isbn}`)
      expect(response.body).toEqual({message: "Book deleted"});
    });
  });


afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  afterAll(async function () {
    await db.end()
  });