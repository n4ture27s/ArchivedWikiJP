fetch('/javascript/json/license.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('licenses');

    data.forEach(item => {
      const div = document.createElement('div');

      div.innerHTML = `
        <a class="w-subtitle heading" href="${item.url}" id="${item.url}">${item.title}</a>
        <p>著者:<a href="https://archivedwiki.miraheze.org/wiki/Wiki_Staff">Archived Wiki contributors</a></p>
        <p>原文: <a href="${item.source}" target="_blank">${item.source}</a></p>
        <p>ライセンス: <a href="${item.license_url}" target="_blank">${item.license}</a></p>
        <p>変更: ${item.modified}</p>
        
      `;

      container.appendChild(div);
    });
  });