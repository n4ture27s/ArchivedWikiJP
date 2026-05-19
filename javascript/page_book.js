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

    // 表示対象のブックを決定
    const targetBookIds = filterBook ? [filterBook] : Object.keys(pages);

    targetBookIds.forEach(bookId => {
        const bookPages = pages[bookId];
        if (!bookPages) return;

        const book = books[bookId];

        Object.entries(bookPages).forEach(([pageId, data]) => {
            const div = document.createElement("div");
        div.className = "page-card";

        div.style.setProperty(
            "--book-color",
            `#${book.color}` || "#777"
        );

        div.style.setProperty(
            "--book-color",
            `#${book.color2}` || `#${book.color}` || "#777"
        );

        div.innerHTML = `
    <div class="page-video">
        <video autoplay loop muted>
            <source src="${data.image}">
            
        </video>
    </div>
    <div class="page-content">
        <div class="page-top">
        <div class="page-name">${data.name_jp} / ${data.name_en}</div>
        </div>
        <div class="page-effect">${formatText(data.effect || '')}</div>
        ${data.effect2 ? `<div class="page-effect secondary-effect">${formatText(data.effect2)}</div>` : ''}
        <div class="page-bottom">
            <div class="page-stat"><span class="tooltip-target" data-key="light"></span>:${data.light}</div>
            <div class="page-stat">CT:${data.ct}</div>
            <div class="page-obtain"><a href="/pages/arsenal/page_detail.html?id=${bookId}">入手:${book.name_jp}</a> </div>
            
        </div>
    </div>
        `;

        container.appendChild(div);
        });
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
            `#${data.color}` || "#777"
        );

        div.style.setProperty(
            "--book-color-2",
            `#${data.color2}` || `#${data.color}` || "#777"
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


function renderBookHeader(bookId) {

    const data = books[bookId];

    if (!data) return;

    const el = document.getElementById("book-header");

    if (!el) return;

    el.style.setProperty(
        "--book-color",
        `#${data.color}` || "#777"
    );

    el.style.setProperty(
        "--book-color-2",
        `#${data.color2}` || `#${data.color}` || "#777"
    );

    el.innerHTML = `

    <div class="book-detail-header">

        <img
            src="/assets/image/${data.icon}.png"
            class="book-detail-icon"
        >

        <div>

            <h1>${data.name_jp}</h1>

            <p>${data.name_en || ""}</p>

        </div>

    </div>
    `;
}