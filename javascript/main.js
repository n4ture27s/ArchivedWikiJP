function LogFilter(type) {
    const details = document.querySelectorAll(".update-log details")

    details.forEach(d => {
        const logs = d.querySelectorAll(".log");
        let view = 0;

        logs.forEach(log => {
            if (type === "all" || log.classList.contains(type)) {
                log.style.display = "block"
                view++;
            } else {
                log.style.display = "none"
            }
        })

        d.style.display = view > 0 ? "block" : "none";
    })
}

const buttons = document.querySelectorAll('.filter-buttons button');
buttons.forEach(button => {
    button.addEventListener('click', (ev) => {
        buttons.forEach(allb => {
            allb.classList.remove('pressed')
        })
        button.classList.add("pressed")
    })
})

fetch("sidebar.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("sidebar-container").innerHTML = data;
    });


document.querySelectorAll('.staff-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.staff-card').forEach(c => {
            if (c !== card) {
                c.classList.remove('open')
            }
        })
        card.classList.toggle('open')
    });
});