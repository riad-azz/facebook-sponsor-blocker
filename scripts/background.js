const activeTabs = {};
let totalCount = 0;
let isActive = false;

// Disable pop up in all tabs
browser.browserAction.disable()

// Load total removed posts count from extension storage
const loadTotalCount = async () => {
  const counter = await browser.storage.local.get("totalCount");
  if (counter.totalCount) {
    totalCount = counter.totalCount;
  } else {
    await browser.storage.local.set({ "totalCount": 0 });
  }
}

// Update total count in extension storage
const saveTotalCount = (count) => {
  browser.storage.local.set({ "totalCount": count });
}

// Start count for the specified tab and enable the browser action
const setUpTabCounter = (tabId) => {
  // Start the counter
  activeTabs[tabId] = 0;
  // Enable the pop up window for this tab
  browser.browserAction.enable(tabId);
}


// Set the custom badge theme color
browser.browserAction.setBadgeBackgroundColor(
  { color: 'grey' }
)
browser.browserAction.setBadgeTextColor(
  { color: 'white' }
)

// Handle runtime messages
browser.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.msg === "tab-ready") {
      const currentTabId = sender.tab.id;
      setUpTabCounter(currentTabId);
    } else if (request.msg === "sponsor-removed") {
      const currentTabId = sender.tab.id;
      totalCount += 1;
      saveTotalCount(totalCount);
      activeTabs[currentTabId] += 1
      browser.browserAction.setBadgeText(
        {
          tabId: currentTabId,
          text: `${activeTabs[currentTabId]}`,
        },
      );
    }
    else if (request.msg === "request-counter") {
      const currentTabId = request.tabId;
      response = {
        totalCounter: totalCount,
        tabCounter: `${activeTabs[currentTabId]}`
      }
      sendResponse(response);
    }
  }
);


// Clear closed tabs counter
const handleRemoved = (tabId, removeInfo) => {
  if (tabId in activeTabs) {
    delete activeTabs[tabId];
  }
}

browser.tabs.onRemoved.addListener(handleRemoved);

loadTotalCount();