async page => {
  return await page.evaluate(() =>
    Array.from(document.querySelectorAll("div.cassetteitem"))
      .slice(0, 15)
      .map(card => ({
        name: card.querySelector("div.cassetteitem_content-title")?.textContent?.trim() || null,
        address: card.querySelector("li.cassetteitem_detail-col1")?.textContent?.trim() || null,
        access: Array.from(
          card.querySelectorAll("li.cassetteitem_detail-col2"),
          el => el.textContent.replace(/\s+/g, " ").trim()
        ),
        age: card.querySelector("li.cassetteitem_detail-col3")?.textContent?.replace(/\s+/g, " ").trim() || null,
        rooms: Array.from(card.querySelectorAll("tbody tr")).map(tr => ({
          floor: tr.querySelector("td.ui-text--midium")?.textContent?.trim() || null,
          rent: tr.querySelector("span.cassetteitem_other-emphasis.ui-text--bold")?.textContent?.trim() || null,
          fee: tr.querySelectorAll("td")[2]?.textContent?.replace(/\s+/g, " ").trim() || null,
          layout: tr.querySelector("span.cassetteitem_madori")?.textContent?.trim() || null,
          area: tr.querySelector("span.cassetteitem_menseki")?.textContent?.trim() || null,
          detailUrl:
            tr.querySelector('a[href*="/chintai/jnc_"]')?.href ||
            tr.querySelector('a[href*="/chintai/bc_"]')?.href ||
            null,
        })),
      }))
  );
}
