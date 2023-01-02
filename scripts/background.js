// -- App vars --
const activeTabs = {};
let totalCount;

// Disable Extension button
browser.browserAction.disable();

// Set the custom badge theme color
browser.browserAction.setBadgeBackgroundColor(
  { color: 'grey' }
)
browser.browserAction.setBadgeTextColor(
  { color: 'white' }
)
// Load total removed posts count from extension storage
const loadTotalCount = async () => {
  const counter = await browser.storage.local.get("totalCount");
  if (counter.totalCount) {
    totalCount = counter.totalCount;
  } else {
    totalCount = 0;
    await browser.storage.local.set({ "totalCount": 0 });
  }
}

// ------ Handle runtime messages ------

// Start count for the specified tab and enable the browser action
const startTabCounter = (tabId) => {
  // Start the counter
  activeTabs[tabId] = 0;
  // Enable the pop up window for this tab
  browser.browserAction.enable(tabId);
}

// Update badge text for a tab
const updateTabBadgeText = (tabId) => {
  browser.browserAction.setBadgeText(
    {
      tabId: tabId,
      text: `${activeTabs[tabId]}`,
    },
  );
}

// Notify the popup page that the counter changed
const notifyPopup = (tabId) => {
  tabCount = activeTabs[tabId];
  const sending = browser.runtime.sendMessage({
    msg: "counter-updated",
    totalCounter: totalCount,
    tabCounter: tabCount
  });

  try {
    sending.then(null, (error) => console.error(error));
  } catch {
    console.log("Popup page is not open");
  }
}

// -- Manage the counters updates --
const updateCount = (tabId) => {
  // Update the counter for specified tab and the total count
  totalCount += 1;
  activeTabs[tabId] += 1
  browser.storage.local.set({ "totalCount": totalCount });
  updateTabBadgeText(tabId);
  notifyPopup(tabId);
}

// onMessage Listener
const handleOnMessage = (request, sender, sendResponse) => {
  if (request.msg === "start-counter") {
    const currentTabId = sender.tab.id;
    startTabCounter(currentTabId);
  } else if (request.msg === "update-counter") {
    const currentTabId = sender.tab.id;
    updateCount(currentTabId);
  }
  else if (request.msg === "request-counter") {
    const currentTabId = request.tabId;
    response = {
      totalCounter: totalCount,
      tabCounter: activeTabs[currentTabId]
    }
    sendResponse(response);
  }
}


// ------ Handle closed tabs -----
// onRemoved (Tabs) Listener
const handleRemovedTabs = (tabId, removeInfo) => {
  if (tabId in activeTabs) {
    delete activeTabs[tabId];
  }
}

// Main run function
function runApp() {
  // Set up app variables
  loadTotalCount();
  // Add event listeners
  browser.runtime.onMessage.addListener(handleOnMessage);
  browser.tabs.onRemoved.addListener(handleRemovedTabs);
}

runApp();