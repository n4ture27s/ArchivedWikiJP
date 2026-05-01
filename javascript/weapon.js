
//weapon sort
function filterWeapon(type) {
    const cards = document.querySelectorAll(".weapon-card");
    cards.forEach(card => {
        if (type === "all" || card.dataset.dmgtype === type) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

const weapon_filter_button = document.querySelectorAll('.filter-buttons button');
weapon_filter_button.forEach(button => {
    button.addEventListener('click', (ev) => {
        weapon_filter_button.forEach(allb => {
            allb.classList.remove('pressed')
        })
        button.classList.add("pressed")
    })
})

function sortWeapon(key) {
    const list = document.querySelector(".weapon-list");
    const cards = Array.from(document.querySelectorAll(".weapon-card"));

    cards.sort((a, b) => {
        return a.dataset[key].localeCompare(b.dataset[key]);
    });

    cards.forEach(card => list.appendChild(card));
}

document.getElementById("search").addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    document.querySelectorAll(".weapon-card").forEach(card => {
        const name = card.textContent.toLowerCase();
        card.style.display = name.includes(value) ? "block" : "none";
    });
});