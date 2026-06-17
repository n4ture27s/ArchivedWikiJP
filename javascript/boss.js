let allBossesData = {};
let bossSearchTerm = "";
let bossActiveCategory = "all";

function resolveImportedPage(pageId) {
  if (!pages) return null;
  for (const bookId of Object.keys(pages)) {
    if (pages[bookId] && pages[bookId][pageId]) {
      return { ...pages[bookId][pageId], sourceBook: bookId };
    }
  }
  return null;
}

function resolveImportedWeapon(weaponId) {
  if (!allWeaponsData || !allWeaponsData[weaponId]) return null;
  return { ...allWeaponsData[weaponId], imported: true };
}

function getBossPages(boss) {
  const result = [];
  if (!boss.pages) return result;

  if (boss.pages.import_from_bookpage) {
    boss.pages.import_from_bookpage.forEach(pageId => {
      const page = resolveImportedPage(pageId);
      if (page) {
        result.push({ id: pageId, ...page, imported: true });
      }
    });
  }

  Object.keys(boss.pages).forEach(key => {
    if (key === "import_from_bookpage") return;
    const page = boss.pages[key];
    result.push({ id: key, ...page, imported: false });
  });

  return result;
}

function getBossWeapons(boss) {
  const result = [];
  if (!boss.weapons) return result;

  if (boss.weapons.import) {
    boss.weapons.import.forEach(wepId => {
      const wep = resolveImportedWeapon(wepId);
      if (wep) {
        result.push({ id: wepId, ...wep, imported: true });
      }
    });
  }

  if (boss.weapon_ids) {
    boss.weapon_ids.forEach(wepId => {
      if (!result.find(r => r.id === wepId)) {
        const wep = resolveImportedWeapon(wepId);
        if (wep) {
          result.push({ id: wepId, ...wep, imported: true });
        }
      }
    });
  }

  Object.keys(boss.weapons).forEach(key => {
    if (key === "import") return;
    const wep = boss.weapons[key];
    if (!result.find(r => r.id === key)) {
      result.push({ id: key, ...wep, imported: false });
    }
  });

  return result;
}

function getBookForPage(page) {
  if (!page.sourceBook || !books || !books[page.sourceBook]) return null;
  return books[page.sourceBook];
}

function formatBossWeaponEntry(weapon) {
  const card = document.createElement("div");
  card.className = "weapon-card-simple";

  const typeText = (typeof typeMap !== 'undefined' && typeMap[weapon.type]) || weapon.type || "";
  const imageUrl = weapon.basic && weapon.basic.image ? weapon.basic.image : "";

  let attacksHtml = "";

  if (weapon.basic) {
    attacksHtml += `
      <div class="simple-attack-section">
        <div class="attack-title">Basic Attack</div>
        ${imageUrl ? `<video autoplay loop muted src="${imageUrl}" class="weapon-image-simple"></video>` : ""}
        ${weapon.basic.effect ? `<div class="simple-effect effect">${formatText(weapon.basic.effect)}</div>` : ""}
      </div>
    `;
  }

  const getNum = s => parseInt(s.replace(/\D/g, '')) || 0;

  Object.keys(weapon)
    .filter(key => key.startsWith("critical"))
    .sort((a, b) => getNum(a) - getNum(b))
    .forEach((key, index) => {
      const c = weapon[key];
      attacksHtml += `
        <div class="simple-attack-section">
          <div class="attack-title">Critical ${index + 1}${c.ct ? ` <span class="ct">(CT: ${c.ct})</span>` : ""}</div>
          <div class="simple-attack-content">
            ${c.image ? `<video autoplay loop muted src="${c.image}" class="attack-vid-simple"></video>` : ""}
            ${c.effect ? `<div class="simple-effect effect">${formatText(c.effect)}</div>` : ""}
          </div>
        </div>
      `;
    });

  Object.keys(weapon)
    .filter(key => key.startsWith("gun"))
    .sort((a, b) => getNum(a) - getNum(b))
    .forEach(key => {
      const g = weapon[key];
      attacksHtml += `
        <div class="simple-attack-section">
          <div class="attack-title">${g.title || "Special Skill"}</div>
          <div class="simple-attack-content">
            ${g.image ? `<video autoplay loop muted src="${g.image}" class="attack-vid-simple"></video>` : ""}
            ${g.effect ? `<div class="simple-effect effect">${formatText(g.effect)}</div>` : ""}
          </div>
        </div>
      `;
    });

  card.innerHTML = `
    <div class="simple-header">
      <div class="weapon-name">
        <span class="name-en">${weapon.name_en}</span>
        <span class="name-jp">${weapon.name_jp}</span>
      </div>
      <div class="weapon-stats-compact">
        <span class="label">必要条件:</span> <span class="value">${weapon.req || "?"} </span>
        <span class="label">速度:</span> <span class="value">${weapon.speed || "?"} </span>
        <span class="label">ダメージ:</span> <span class="value">${weapon.damage || "?"} </span>
        <span class="value" style="margin-left:10px;">${typeText}</span>
      </div>
    </div>
    <div class="simple-body">
      <div class="simple-content-wrapper">
        <div class="simple-info-content">
          <div class="simple-attacks-container">${attacksHtml}</div>
        </div>
      </div>
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (e.target.closest('.detail-link')) return;
    card.classList.toggle("expanded");
  });

  return card;
}

function createBossCard(bossId, boss) {
  const card = document.createElement("div");
  card.className = "boss-card";
  card.dataset.bossId = bossId;

  const bossPages = getBossPages(boss);
  const bossWeapons = getBossWeapons(boss);

  const hasImage = boss.image && boss.image !== "";
  const imageHtml = hasImage ? `<img src="${boss.image}" alt="${boss.name_en}" class="boss-image">` : "";
  const weaponNames = bossWeapons.map(w => w.name_en).join(", ");

  card.innerHTML = `
    <div class="boss-card-header">
      ${imageHtml}
      <div class="boss-info">
        <div class="boss-name">
          <span class="name-en">${boss.name_en}</span>
          <span class="name-jp">${boss.name_jp}</span>
        </div>
        ${boss.title ? `<div class="boss-title">${boss.title}</div>` : ""}
        ${boss.quote ? `<div class="boss-quote">「${boss.quote}」</div>` : ""}
        <div class="boss-stats">
          <span class="stat">HP: ${boss.health}</span>
          ${weaponNames ? `<span class="stat weapon-names">武器: ${weaponNames}</span>` : ""}
          ${formatText(boss.passive) ? `<span class="stat boss-passive">パッシブ: ${formatText(boss.passive)}</span>` : ""}
        </div>
      </div>
    </div>
    <div class="boss-card-body"></div>
  `;

  const body = card.querySelector(".boss-card-body");

  if (bossWeapons.length > 0) {
    const wepSection = document.createElement("div");
    wepSection.className = "boss-section";
    const heading = document.createElement("p");
    heading.className = "w-subtitle heading small-heading";
    heading.textContent = "使用武器";
    wepSection.appendChild(heading);
    const wepList = document.createElement("div");
    wepList.className = "boss-weapons";
    bossWeapons.forEach(wep => {
      wepList.appendChild(formatBossWeaponEntry(wep));
    });
    wepSection.appendChild(wepList);
    body.appendChild(wepSection);
  }

  if (bossPages.length > 0) {
    const pageSection = document.createElement("div");
    pageSection.className = "boss-section";
    const heading = document.createElement("p");
    heading.className = "w-subtitle heading small-heading";
    heading.textContent = "使用ページ";
    pageSection.appendChild(heading);
    const pageList = document.createElement("div");
    pageList.className = "boss-pages";
    bossPages.forEach(page => {
      const item = document.createElement("div");
      item.className = "boss-page-item";
      const book = getBookForPage(page);
      renderPageCard(item, page, book);
      pageList.appendChild(item);
    });
    pageSection.appendChild(pageList);
    body.appendChild(pageSection);
  }

  card.addEventListener("click", (e) => {
    if (e.target.closest('.weapon-card-simple') || e.target.closest('.boss-page-item')) return;
    card.classList.toggle("expanded");
  });

  return card;
}

function renderBossList(containerId) {
  const container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
  if (!container) return;

  container.innerHTML = "";

  const groupLabels = {
    overworld: "オーバーワールドボス",
    city: "シティボス",
    death_sentence: "死刑宣告"
  };

  const groupOrder = allBossesData.groups || ["overworld", "city", "death_sentence"];

  const grouped = {};
  Object.entries(allBossesData.bosses).forEach(([id, boss]) => {
    const g = boss.group || "";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push({ id, data: boss });
  });

  groupOrder.forEach(g => {
    const list = grouped[g];
    if (!list || list.length === 0) return;

    const currentG = g;

    if (bossActiveCategory !== "all" && bossActiveCategory !== currentG) {
      return;
    }

    const section = document.createElement("div");
    section.className = "boss-group";

    const title = document.createElement("h2");
    title.className = "boss-group-title";
    title.textContent = groupLabels[g] || g;
    section.appendChild(title);

    list.forEach(({ id, data }) => {
      const nameMatch = data.name_jp.toLowerCase().includes(bossSearchTerm) ||
                        data.name_en.toLowerCase().includes(bossSearchTerm);
      if (bossSearchTerm && !nameMatch) return;
      const card = createBossCard(id, data);
      section.appendChild(card);
    });

    if (section.querySelectorAll(".boss-card").length > 0) {
      container.appendChild(section);
    }
  });

  if (typeof applyAllStyles === "function") applyAllStyles();
}

async function loadBossData() {
  try {
    const res = await fetch("/javascript/json/boss_data.json");
    allBossesData = await res.json();
  } catch (e) {
    console.error("Failed to load boss data:", e);
  }
}

function setupBossPage() {
  const container = document.getElementById("boss-list-container");
  if (!container) return;

  const tabContainer = document.createElement("div");
  tabContainer.className = "boss-tabs";
  tabContainer.innerHTML = `
    <button class="boss-tab active" data-category="all">すべて</button>
    <button class="boss-tab" data-category="overworld">オーバーワールド</button>
    <button class="boss-tab" data-category="city">シティ</button>
    <button class="boss-tab" data-category="death_sentence">死刑宣告</button>
  `;

  const existingTabs = container.querySelector(".boss-tabs");
  if (!existingTabs) {
    container.parentNode.insertBefore(tabContainer, container);
  }

  tabContainer.addEventListener("click", (e) => {
    const tab = e.target.closest(".boss-tab");
    if (!tab) return;
    tabContainer.querySelectorAll(".boss-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    bossActiveCategory = tab.dataset.category;
    renderBossList(container);
  });

  const searchInput = document.getElementById("boss-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      bossSearchTerm = searchInput.value.toLowerCase();
      renderBossList(container);
    });
  }

  renderBossList(container);
}
