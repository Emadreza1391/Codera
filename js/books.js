const books = [
  {
    title: "پایتون پلاس",
    author: "عمادرضا عباس پور",
    subject: "برنامه نویسی پایتون",
    file: "books/pythonplus.pdf"
  },
  {
    title: "10 سوال هوش مصنوعی",
    author: "عمادرضا عباس پور",
    subject: "هوش مصنوعی",
    file: "books/AI-Level.pdf"
  }
];

const grid = document.getElementById("bookGrid");
const count = document.getElementById("bookCount");
const empty = document.getElementById("empty");
count.textContent = `${books.length} کتاب`;
empty.hidden = books.length > 0;
grid.innerHTML = books.map(book => `
<article class="book-card">
  <div class="book-cover">📘</div>
  <div class="book-body">
    <h2>${book.title}</h2>
    <div class="book-meta">
      <div>✍️ نویسنده: <strong>${book.author}</strong></div>
      <div>💻 موضوع: <strong>${book.subject}</strong></div>
    </div>
    <a class="book-btn" href="${book.file}" target="_blank" rel="noopener">📖 مشاهده کتاب</a>
  </div>
</article>`).join("");
