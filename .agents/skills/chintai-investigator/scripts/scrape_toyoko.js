async page => {
  const rooms = await page.evaluate(() => {
    const normalize = value =>
      (value || "")
        .replace(/\s+/g, " ")
        .replace(/\u3000/g, " ")
        .trim();

    const rows = [];
    for (const building of Array.from(document.querySelectorAll("div.cassetteitem"))) {
      const title = normalize(
        building.querySelector(".cassetteitem_content-title")?.textContent ||
          building.querySelector(".js-cassette_link")?.textContent
      );
      const access = Array.from(building.querySelectorAll(".cassetteitem_detail-col2 div"))
        .map(node => normalize(node.textContent))
        .filter(Boolean);
      const age = normalize(building.querySelector(".cassetteitem_detail-col3 div")?.textContent);

      for (const room of Array.from(building.querySelectorAll("tbody tr"))) {
        const cells = room.querySelectorAll("td");
        const href = room.querySelector("a[href*='/chintai/jnc_']")?.href;
        if (!href) {
          continue;
        }
        rows.push({
          title,
          access,
          age,
          rent: normalize(cells?.[3]?.textContent),
          layoutArea: normalize(cells?.[5]?.textContent),
          href,
        });
      }
    }
    return rows.slice(0, 30);
  });

  return await page.evaluate(async inputRooms => {
    const normalize = value =>
      (value || "")
        .replace(/\s+/g, " ")
        .replace(/\u3000/g, " ")
        .trim();

    const parseDetail = html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      let orientation = "";
      for (const tr of Array.from(doc.querySelectorAll("tr"))) {
        const header = normalize(tr.querySelector("th")?.textContent);
        if (header === "向き") {
          return normalize(tr.querySelector("td")?.textContent);
        }
      }
      return orientation;
    };

    const results = [];
    for (const room of inputRooms) {
      try {
        const response = await fetch(room.href, { credentials: "include" });
        const html = await response.text();
        results.push({
          ...room,
          orientation: parseDetail(html),
          url: room.href,
        });
      } catch (error) {
        results.push({ ...room, error: String(error) });
      }
    }
    return results;
  }, rooms);
}
