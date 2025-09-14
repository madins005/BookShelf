const addBook = [];
const RENDER_EVENT = "render-book";
const uncompletedBookList = document.getElementById("addBook");
const completedBookList = document.getElementById("completed-book");
const SAVED_EVENT = "saved_book";
const STORAGE_KEY = "BOOK_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addBookList();
    submitForm.reset();  
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const removeSearchKeyword = document.getElementById("remove-search-keyword");
  removeSearchKeyword.addEventListener("click", function () {
    const searchInput = document.getElementById("search-input");
    searchInput.value = "";
    resetSearchResult();
  });
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(addBook);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const books of data) {
      addBook.push(books);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateid() {
  return +new Date();
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser tidak mendukung local storage");
    return false;
  }
  return true;
}

function addBookList() {
  let title = document.getElementById("title").value;
  let author = document.getElementById("author").value;
  const year = Number(document.getElementById("year").value);
  if (typeof year === "number" && !isNaN(year)) {
    console.log("Nilai year adalah number:", year);
  } else {
    console.log("Nilai year bukan number:", year);
  }
  const isComplete = document.getElementById("input-complete").checked;
  
  title = capitalizeWords(title);
  author = capitalizeWords(author);

  const generatedID = generateid();
  const listObj = generateListObj(generatedID, title, author, year, isComplete);
  addBook.push(listObj);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateListObj(id, title, author, year, isComplete) {
  return { id, title, author, year, isComplete };
}

function findBookIndex(listId) {
  for (const index in addBook) {
    if (addBook[index].id === listId) {
      return index;
    }
  }
  return -1;
}

function makeBookList(listObj) {
  const image = document.createElement("img");
  image.classList.add("uncompleted");
  image.src = listObj.isComplete ? "assets/completed-book.png" : "assets/uncompleted-book.png";

  const textTitle = document.createElement("h2");
  textTitle.innerText = listObj.title;

  const textAuthor = document.createElement("p");
  const imgAuthor = document.createElement("img");
  imgAuthor.classList.add("icon-list");
  imgAuthor.src = "assets/writing.png";
  textAuthor.appendChild(imgAuthor);
  textAuthor.appendChild(document.createTextNode(listObj.author));

  const textYear = document.createElement("p");
  const imgYear = document.createElement("img");
  imgYear.classList.add("icon-list");
  imgYear.src = "assets/public-relation.png";
  textYear.appendChild(imgYear);
  textYear.appendChild(document.createTextNode(listObj.year));

  let checkButton;
  let deleteButton;
  let uncompletedButton;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.style.borderRadius = "24px";
  textContainer.append(image, textTitle, textAuthor, textYear);

  const innerChild = document.createElement("div");
  innerChild.classList.add("innerChildList");
  innerChild.append(textTitle, textAuthor, textYear);
  textContainer.append(innerChild);

  const optionUser = document.createElement("div");
  optionUser.classList.add("optionUser");

  const container = document.createElement("div");
  container.classList.add("item");
  container.setAttribute("data-title", listObj.title);
  container.append(textContainer);
  container.setAttribute("id", `list-${listObj.id}`);
  container.setAttribute("data-title", listObj.title);

  if (listObj.isComplete) {
    uncompletedButton = document.createElement("button");
    uncompletedButton.classList.add("uncompletedButton");
    uncompletedButton.addEventListener("click", function () {
      uncompletedListFromCompleted(listObj.id);
    });

    deleteButton = document.createElement("button");
    deleteButton.classList.add("deleteButton");
    deleteButton.addEventListener("click", function () {
      const userConfirm = confirm("Yakin dihapus?");
      if (userConfirm) {
        removeListFromCompleted(listObj.id);
      }
    });
    optionUser.append(uncompletedButton, deleteButton);
  } else {
    checkButton = document.createElement("button");
    checkButton.classList.add("checkButton");
    checkButton.addEventListener("click", function () {
      addBookCompleted(listObj.id);
    });
    deleteButton = document.createElement("button");
    deleteButton.classList.add("deleteButton");
    deleteButton.addEventListener("click", function () {
      const userConfirm = confirm("Yakin dihapus?");
      if (userConfirm) {
        removeListFromCompleted(listObj.id);
      }
    });
    optionUser.append(checkButton, deleteButton);
  }
  textContainer.append(optionUser);

  return container;
}

function findBook(listId) {
  for (const listItem of addBook) {
    if (listItem.id === listId) {
      return listItem;
    }
  }
  return null;
}

function addBookCompleted(listId) {
  const listTarget = findBook(listId);

  if (listTarget == null) return;

  listTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeListFromCompleted(listId) {
  const listTarget = findBookIndex(listId);
  if (listTarget === -1) return;
  addBook.splice(listTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  const afterDeleteBox = document.getElementById("after-delete-box");
  afterDeleteBox.style.display = "block";
  afterDeleteBox.style.animation = "yAxisFade .2s";

  const removeButtonPopup = document.getElementById("remove-button-popup");
  removeButtonPopup.addEventListener("click", function () {
    afterDeleteBox.style.display = "none";
  });

  setTimeout(() => {
    afterDeleteBox.style.display = "none";
  }, 1900);
}

function uncompletedListFromCompleted(listId) {
  const listTarget = findBook(listId);
  if (listTarget == null) return;
  listTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
  uncompletedBookList.innerHTML = "";
  completedBookList.innerHTML = "";

  for (const bookList of addBook) {
    const bookElement = makeBookList(bookList);
    if (!bookList.isComplete) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
  listBookTitleStyle();
});

function searchBook() {
  const searchButton = document.getElementById("search-button");
  const removeSearchInput = document.getElementById("remove-search-keyword");
  const searchBox = document.getElementById("search-box");
  const searchInput = document.getElementById("search-input");

  function doSearch() {
    const inputValue = searchInput.value.toLowerCase();
    const bookList = document.querySelectorAll(".item");

    for (const book of bookList) {
      const title = book.getAttribute("data-title").toLowerCase();
      if (title.includes(inputValue)) {
        book.style.display = "";
      } else {
        book.style.display = "none";
      }
    }
  }

  searchButton.addEventListener("click", function (e) {
    e.preventDefault();
    doSearch();
  });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
  });

  searchInput.addEventListener("input", function () {
    const inputValue = searchInput.value.trim();

    if (inputValue !== "") {
      removeSearchInput.style.display = "block";
    } else {
      removeSearchInput.style.display = "none";
    }
  });

  removeSearchInput.addEventListener("click", function () {
    searchInput.value = "";
    removeSearchInput.style.display = "none";
    resetSearchResult()
  });

  searchInput.addEventListener("click", function () {
    searchBox.style.outline = "2px solid #fe7473";
    searchBox.style.boxShadow = "0 10px 30px -10px #de7473";
  });
  searchInput.addEventListener("blur", function () {
    searchBox.style.outline = "";
    searchBox.style.boxShadow = "";
  });
}
searchBook();

function listBookTitleStyle() {
  const titleBookList = document.getElementById("container-title");
  const titleBookListComplete = document.getElementById("container-title-completed");

  if (uncompletedBookList.children.length > 0) {
    titleBookList.style.color = "#fe7473";
  } else {
    titleBookList.style.color = "";
  }

  if (completedBookList.children.length > 0) {
    titleBookListComplete.style.color = "#fe7473";
  } else {
    titleBookListComplete.style.color = "";
  }
}

function resetSearchResult() {
  const bookList = document.querySelectorAll(".item");
  for (const book of bookList) {
    book.style.display = "block";
  }
}

function capitalizeWords(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}