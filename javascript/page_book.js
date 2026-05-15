let books = {};
let pages = {};

async function loadPageData() {

    const [bookRes, pageRes] = await Promise.all([
        fetch("/javascript/json/book_page/books.json"),
        fetch("/javascript/json/book_page/page.json")
    ]);

    books = await bookRes.json();
    pages = await pageRes.json();
}

function renderPageList(containerId, filterBook = null) {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    Object.entries(pages).forEach(([id, data]) => {

        if (filterBook && data.book !== filterBook) return;

        const book = books[data.book];

        const div = document.createElement("div");
        div.className = "page-card";

        div.innerHTML = `
        <div class="page-name"> ${data.name_jp} / ${data.name_en}</div>
        <div class="page-effect"> ${formatText(data.effect)} </div>
        <div class="page-footer">
        <div class="page-stats">
            <span class="page-cost">光:2</span>
            <span class="page-ct">CT:40s</span>
        </div>
        <div class="page-obtain">
            入手:${book.name_jp}
        </div>

    </div>
        `;

        container.appendChild(div);
    });

    applyAllStyles?.();
}

function renderBookList(containerId) {

    const container = document.getElementById(containerId);

    if (!container) return;

    container.classList.add("book-list");

    container.innerHTML = "";

    Object.entries(books).forEach(([id, data]) => {

        const div = document.createElement("div");

        div.className = "book-card";

        div.style.setProperty(
            "--book-color",
            data.color || "#777"
        );

        div.innerHTML = `
        
        <div class="book-icon-area">

            <img
                src="/assets/image/${data.icon}.png"
                alt="${data.name_en}"
            >

        </div>

        <div class="book-info">

            <div class="book-name_jp">
                ${data.name_jp}
            </div>

            <div class="book-name_en">
                ${data.name_en || ""}
            </div>

        </div>
        `;

        div.addEventListener("click", () => {

            location.href = `/pages/arsenal/page_detail.html?id=${id}`;
        });

        container.appendChild(div);
    });
}
