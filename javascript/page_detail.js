function renderBookHeader(bookId) {

    const data = books[bookId];

    if (!data) return;

    const el = document.getElementById("book-header");

    if (!el) return;

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