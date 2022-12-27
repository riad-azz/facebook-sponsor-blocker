let removedCounter = 0;
let isActive = false;

browser.browserAction.setBadgeBackgroundColor(
  { color: 'grey' }
)
browser.browserAction.setBadgeTextColor(
  { color: 'white' }
)
browser.browserAction.disable();

const browserNotification = async function (tab) {
  if (isActive) return;
  isActive = true;

  function onExecuted(result) {
    console.log('Script excecuted successfully');
    isActive = false;
  }

  function onError(error) {
    console.error(error);
    isActive = false;
  }

  const executing = browser.tabs.executeScript(tab.id, {
    file: "scripts/notification.js",
  });
  await executing.then(onExecuted, onError);
}

browser.browserAction.onClicked.addListener((tab) => {
  browserNotification(tab);
});

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
      if (removedCounter === 0) return;
      browser.browserAction.setBadgeText(
        {
          text: `${removedCounter}`,
          tabId: sender.tab.id,
        },
      );
    } else if (request.msg === "request-counter") {
      sendResponse({ counter: `${removedCounter}` });
    }
  }
);