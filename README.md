# Threads Replies Auto Delete

A small browser console script for deleting old replies on Threads.

I made this because I wanted to clean up my old Threads replies, and doing it manually was obviously not happening.

The script goes through the More (`...`) menus on the Replies page. If the menu contains `Delete`, it deletes the post and confirms the deletion. If there is no `Delete` option, it leaves it alone and moves on.

It also scrolls down automatically to load more replies.

## Usage

1. Open Threads in a desktop browser and log in.
2. Go to your profile.
3. Open the **Replies** tab.
4. Open Developer Tools → **Console**.
5. Copy and paste the content of `threads-replies-delete.js`.
6. Press Enter and let it run.

To stop the script at any time:

```js
window.stopThreadsDelete = true
```

I would recommend keeping the Threads tab open while the script is running. If the computer goes to sleep, the script will pause.

## How it works

Basically:

```text
find More (...)
    ↓
open menu
    ↓
Delete exists?
    ├── no  → close menu → next
    └── yes → Delete → confirm Delete → next
```

The script does not rely on a hard-coded username.

It also does not assume that every `...` menu belongs to one of your replies. It simply opens the menu and checks whether the `Delete` action is available. If there is no `Delete`, the menu is closed and the item is skipped.

After a successful deletion, Threads may rerender parts of the page. The script rescans the current DOM instead of continuing to use old references.

If Threads fails to open the deletion dialog for a particular item, the script skips that item instead of stopping the whole process.

## Console output

The script keeps track of three things:

- `deleted` — successfully deleted
- `skipped` — the menu did not contain `Delete`
- `failed` — `Delete` was available, but the deletion process failed

For example:

```text
[Threads Delete] Deleting #12...
[Threads Delete] ✓ 12 deleted | 24 skipped | 1 failed
```

You may also see errors from Threads itself, such as:

```text
BarcelonaPostOverflowMenuBottomSheetQuery
BarcelonaPostDeletionDialogQuery
```

In my testing, Threads sometimes fails to return the expected media object when opening a menu or deletion dialog. The script tries to skip these items and continue instead of terminating the whole run.

## Stopping the script

Run this in the Console:

```js
window.stopThreadsDelete = true
```

Refreshing or closing the Threads tab will also stop it.

## Notes

This is just a browser console script based on the current Threads web interface. It does not use an official bulk-delete API, so it may break if Meta changes the Threads DOM or deletion flow.

I wrote this for cleaning up replies on my own Threads account. It has only been tested for this particular use case.

I would recommend testing it on a few replies first before leaving it running for a larger cleanup.

## Files

```text
threads-replies-auto-delete/
├── README.md
└── threads-replies-delete.js
```

## Disclaimer

Use at your own risk.

Deleted Threads posts may not be recoverable. Check that the script behaves as expected on your account before using it for a large number of replies.