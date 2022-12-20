let removedCounter = 0;
let isActive = false;

browser.browserAction.setBadgeBackgroundColor(
  { color: 'grey' }
)
browser.browserAction.setBadgeTextColor(
  { color: 'white' }
)
browser.browserAction.disable();

const browserNotification = async function () {
  if (isActive) return;
  isActive = true;
  await browser.notifications.create(
    "unique",
    {
      type: "basic",
      title: "Facebook Sponsor Blocker",
      message: `${removedCounter} Removed sponsored post so far.`,
    }
  );
  isActive = false;
}

browser.browserAction.onClicked.addListener(browserNotification);

browser.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.msg === "sponsor-removed") {
      removedCounter += 1;
      browser.browserAction.setBadgeText(
        {
          text: `${removedCounter}`,
          tabId: sender.tab.id,
        },
      );
    } else if (request.msg === "enable-badge") {
      browser.browserAction.enable(sender.tab.id);
    }
  }
);