/*
 * Threads Replies Auto Delete
 *
 * Run this in the browser console on your Threads Replies page.
 *
 * Logic:
 * More → Delete available → Delete → Confirm
 *      → no Delete → skip
 *
 * Stop anytime with:
 * window.stopThreadsDelete = true
 */

(async () => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const text = el => (el?.innerText || el?.textContent || "").trim();
  const visible = el => el?.isConnected && el.getClientRects().length > 0;

  const MENU_WAIT = 500;
  const DELETE_WAIT = 700;
  const SCROLL_WAIT = 1200;

  let deleted = 0;
  let skipped = 0;
  let failed = 0;

  // Keeps us from reopening the same More menu.
  // New React nodes after a rerender are treated as new items automatically.
  const checked = new WeakSet();

  window.stopThreadsDelete = false;

  const getMoreButtons = () =>
    [...document.querySelectorAll('svg[title="More"]')]
      .filter(visible)
      .map(svg => svg.closest('[role="button"]'))
      .filter(visible);

  const getMenuDelete = () =>
    [...document.querySelectorAll('[role="menuitem"]')]
      .filter(visible)
      .find(item => text(item) === "Delete");

  const closeMenu = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        bubbles: true
      })
    );
  };

  async function waitFor(fn, timeout = 3000) {
    const end = Date.now() + timeout;

    while (Date.now() < end && !window.stopThreadsDelete) {
      const result = fn();

      if (result) return result;

      await sleep(100);
    }

    return null;
  }

  async function deletePost(deleteItem) {
    deleteItem.click();

    const dialog = await waitFor(() =>
      [...document.querySelectorAll('[role="dialog"]')]
        .filter(visible)
        .find(dialog => text(dialog).includes("Delete post?"))
    );

    if (!dialog) {
      throw new Error("confirmation dialog did not appear");
    }

    const confirm = [...dialog.querySelectorAll('[role="button"]')]
      .filter(visible)
      .find(button => text(button) === "Delete");

    if (!confirm) {
      throw new Error("confirmation button not found");
    }

    confirm.click();

    const closed = await waitFor(
      () => !dialog.isConnected || !visible(dialog),
      5000
    );

    if (!closed) {
      throw new Error("confirmation dialog did not close");
    }

    await sleep(DELETE_WAIT);
  }

  console.log(
    "[Threads Delete] Started\n" +
    "Stop: window.stopThreadsDelete = true"
  );

  while (!window.stopThreadsDelete) {
    const button = getMoreButtons().find(item => !checked.has(item));

    // Everything currently loaded has been checked.
    // Scroll down and give Threads some time to load more replies.
    if (!button) {
      const oldY = window.scrollY;

      window.scrollBy({
        top: Math.round(window.innerHeight * 0.8),
        behavior: "smooth"
      });

      await sleep(SCROLL_WAIT);

      if (window.scrollY <= oldY + 10) {
        await sleep(2000);

        const hasNewItems = getMoreButtons().some(
          item => !checked.has(item)
        );

        if (!hasNewItems) break;
      }

      continue;
    }

    checked.add(button);

    button.scrollIntoView({
      block: "center",
      behavior: "auto"
    });

    await sleep(150);

    if (!button.isConnected) continue;

    button.click();
    await sleep(MENU_WAIT);

    if (window.stopThreadsDelete) break;

    const deleteItem = getMenuDelete();

    // No Delete option = not something we should touch.
    if (!deleteItem) {
      skipped++;
      closeMenu();
      await sleep(200);
      continue;
    }

    console.log(`[Threads Delete] Deleting #${deleted + 1}...`);

    try {
      await deletePost(deleteItem);

      deleted++;

      console.log(
        `[Threads Delete] ✓ ${deleted} deleted | ${skipped} skipped | ${failed} failed`
      );
    } catch (error) {
      failed++;

      console.warn(
        `[Threads Delete] Failed, skipping: ${error.message}`
      );

      closeMenu();
      await sleep(500);
    }
  }

  console.log(
    `[Threads Delete] Finished — ${deleted} deleted | ${skipped} skipped | ${failed} failed`
  );
})();