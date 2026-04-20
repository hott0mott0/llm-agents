async page => {
  await page.goto("https://suumo.jp/chintai/tokyo/ek_27280/");
  await page.getByRole("link", { name: "さらに条件を追加する" }).click();
  const formInfo = await page.evaluate(() => {
    const form = document.querySelector("#js-conditionbox form");
    if (!form) {
      return { error: "form not found" };
    }

    const fields = [];
    for (const el of form.querySelectorAll("input, select, textarea")) {
      fields.push({
        tag: el.tagName,
        type: el.type || null,
        name: el.name || null,
        id: el.id || null,
        value: el.value || null,
        checked: "checked" in el ? el.checked : null,
      });
    }

    return {
      action: form.getAttribute("action"),
      method: form.getAttribute("method"),
      fields,
    };
  });

  console.log(JSON.stringify(formInfo, null, 2));
}
