async page => {
  await page.goto("https://suumo.jp/chintai/tokyo/ek_27280/");
  await page.getByRole("link", { name: "さらに条件を追加する" }).click();
  await page.evaluate(() => {
    const setChecked = id => {
      const node = document.getElementById(id);
      if (!node) return false;
      node.checked = true;
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    };

    const upperRent = document.querySelector('#js-conditionbox select[name="ct"]');
    const builtWithin = document.querySelector('#js-conditionbox select[name="cn"]');
    if (upperRent) upperRent.value = "23.0";
    if (builtWithin) builtWithin.value = "20";
    upperRent?.dispatchEvent(new Event("change", { bubbles: true }));
    builtWithin?.dispatchEvent(new Event("change", { bubbles: true }));

    setChecked("co0");
    setChecked("md3");
    setChecked("tc1_4");
  });
  await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll("a")).find(
      el => el.textContent.replace(/\s+/g, " ").trim() === "この条件で検索する"
    );
    link?.click();
  });
  await page.waitForLoadState("networkidle");
}
