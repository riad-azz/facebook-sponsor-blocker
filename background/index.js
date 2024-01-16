// Constant Variables
const BADGE_BG_COLOR = { color: "grey" };
const BADGE_TEXT_COLOR = { color: "white" };

// Set badge colors
browser.browserAction.setBadgeTextColor(BADGE_TEXT_COLOR);
browser.browserAction.setBadgeBackgroundColor(BADGE_BG_COLOR);

// Set the initial block count.
browser.runtime.onInstalled.addListener(details => {
  browser.storage.local.set({
    blockedCount: 0
  });
});

// On message listener (from content and popup scripts)
function handleOnMessage(request, sender, sendResponse) {
  switch (request.code) {
    case "UPDATE_BADGE_TEXT":
      browser.browserAction.setBadgeText({
        tabId: sender.tab.id,
        text: request.text,
      });
      break;
    default:
      console.log("Unknown message received in background.js:", request.title);
  }
}

browser.runtime.onMessage.addListener(handleOnMessage);