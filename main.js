const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "seved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

// MEMASTIKAN FUNGSI LOCAL STORAGE MENDUKUNG ATAU TIDAK
function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, years, isCompleted) {
  return {
    id,
    title,
    author,
    years,
    isCompleted,
  };
}

function addBook() {
  const bookTodo = document.getElementById("inputBookTitle").value;
  const authors = document.getElementById("inputBookAuthor").value;
  const bookYears = document.getElementById("inputBookYear").value;
  const completedStatus = document.querySelector("#inputBookIsComplete");

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    bookTodo,
    authors,
    bookYears,
    completedStatus.checked ? true : false
  );

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitBook = document.getElementById("inputBook");
  submitBook.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataBookStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBOOKList.innerHTML = "";

  const completedBOOKList = document.getElementById("completeBookshelfList");
  completedBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `Penulis: ${bookObject.author}`;

  const bookYear = document.createElement("p");
  bookYear.innerText = `Tahun: ${bookObject.years}`;

  const btnContainer = document.createElement("div");
  btnContainer.classList.add("action");

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.setAttribute("id", `book-${bookObject.id}`);
  container.append(bookTitle, bookAuthor, bookYear);
  container.append(btnContainer);

  if (bookObject.isCompleted) {
    const greenButton = document.createElement("button");
    greenButton.classList.add("green");
    greenButton.innerText = "Belum selesai dibaca";

    greenButton.addEventListener("click", function () {
      undoBookFormCompleted(bookObject.id);
    });

    const redButton = document.createElement("button");
    redButton.classList.add("red");
    redButton.innerText = "Hapus Buku";

    redButton.addEventListener("click", function () {
      removeBookFormCompleted(bookObject.id);
    });

    btnContainer.append(greenButton, redButton);
  } else {
    const finsihButton = document.createElement("button");
    finsihButton.classList.add("green");
    finsihButton.innerText = "Selesai dibaca";

    finsihButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const redButton = document.createElement("button");
    redButton.classList.add("red");
    redButton.innerHTML = "Hapus Buku";

    redButton.addEventListener("click", function () {
      removeBookFormCompleted(bookObject.id);
    });
    btnContainer.append(finsihButton, redButton);
  }

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFormCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFormCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataBookStorage() {
  const serialData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serialData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooksByTitle() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const searchResults = books.filter((book) =>
    book.title.toLowerCase().includes(searchTitle)
  );

  // Clear the bookshelf lists
  const uncompletedBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  uncompletedBookshelfList.innerHTML = "";
  completedBookshelfList.innerHTML = "";

  // Render the search results
  for (const book of searchResults) {
    const bookElement = makeBook(book);
    if (book.isCompleted) {
      completedBookshelfList.appendChild(bookElement);
    } else {
      uncompletedBookshelfList.appendChild(bookElement);
    }
  }
}

// Add an event listener to the search form
const searchForm = document.getElementById("searchBook");
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  searchBooksByTitle();
});
