// -- App vars --
const activeTabs = {};
let totalCount;
let removeSponsored;
let removeSuggested;
// Disable Extension button
browser.browserAction.disable();

// Set the custom badge theme color
browser.browserAction.setBadgeBackgroundColor({ color: "grey" });
browser.browserAction.setBadgeTextColor({ color: "white" });
// Load total removed posts count from extension storage
const loadSettings = async () => {
  // Total counter
  const counter = await browser.storage.local.get("totalCount");
  if (counter.totalCount) {
    totalCount = counter.totalCount;
  } else {
    totalCount = 0;
    await browser.storage.local.set({ totalCount: 0 });
  }
  // Remove sponsored
  const sponsored = await browser.storage.local.get("removeSponsored");
  if (sponsored.removeSponsored === undefined) {
    await browser.storage.local.set({ removeSponsored: true });
    removeSponsored = true;
  } else {
    removeSponsored = sponsored.removeSponsored;
  }
  // Remove sponsored
  const suggested = await browser.storage.local.get("removeSuggested");
  if (suggested.removeSuggested === undefined) {
    await browser.storage.local.set({ removeSuggested: true });
    removeSuggested = true;
  } else {
    removeSuggested = suggested.removeSuggested;
  }
};

// ------ Handle runtime messages ------

// Start count for the specified tab and enable the browser action
const startTabCounter = (tabId) => {
  // Start the counter
  activeTabs[tabId] = 0;
  // Enable the pop up window for this tab
  browser.browserAction.enable(tabId);
};

// Update badge text for a tab
const updateTabBadgeText = (tabId) => {
  browser.browserAction.setBadgeText({
    tabId: tabId,
    text: `${activeTabs[tabId]}`,
  });
};

// Notify the popup page that the counter changed
const notifyPopup = async (tabId) => {
  tabCount = activeTabs[tabId];
  const sending = browser.runtime.sendMessage({
    msg: "counter-updated",
    totalCounter: totalCount,
    tabCounter: tabCount,
  });
  sending.then(null, (error) => console.log("Popup page is not open"));
};

// Send remove sponsor request to content script
const removeSponsors = async (tabId) => {
  browser.tabs.sendMessage(tabId, { msg: "request-remove" });
};

// -- Update what posts to remove --
const checkSponsored = async (tabId, check) => {
  if (!tabId) return;
  browser.tabs.sendMessage(tabId, {
    msg: "request-check-sponsored",
    state: check,
  });
  removeSponsored = check;
};

const checkSuggested = async (tabId, check) => {
  if (!tabId) return;
  browser.tabs.sendMessage(tabId, {
    msg: "request-check-suggested",
    state: check,
  });
  removeSuggested = check;
};

// -- Manage the popup updates --

// Update the counter for specified tab and the total count
const updateCount = (tabId) => {
  totalCount += 1;
  activeTabs[tabId] += 1;
  browser.storage.local.set({ totalCount: totalCount });
  updateTabBadgeText(tabId);
  notifyPopup(tabId);
};

// onMessage Listener
const handleOnMessage = (request, sender, sendResponse) => {
  if (request.msg === "start-counter") {
    const currentTabId = sender.tab.id;
    startTabCounter(currentTabId);
    response = {
      removeSponsored,
      removeSuggested,
    };
    sendResponse(response);
  } else if (request.msg === "update-counter") {
    const currentTabId = sender.tab.id;
    updateCount(currentTabId);
  } else if (request.msg === "request-counter") {
    const currentTabId = request.tabId;
    response = {
      totalCounter: totalCount,
      tabCounter: activeTabs[currentTabId],
    };
    sendResponse(response);
  } else if (request.msg === "request-remove") {
    const currentTabId = request.tabId;
    removeSponsors(currentTabId);
  } else if (request.msg === "request-check-sponsored") {
    const currentTabId = request.tabId;
    checkSponsored(currentTabId, request.state);
  } else if (request.msg === "request-check-suggested") {
    const currentTabId = request.tabId;
    checkSuggested(currentTabId, request.state);
  }
};

// ------ Handle closed tabs -----
// onRemoved (Tabs) Listener
const handleRemovedTabs = (tabId, removeInfo) => {
  if (tabId in activeTabs) {
    delete activeTabs[tabId];
  }
};

// Main run function
function runApp() {
  // Set up app variables
  loadSettings();
  // Add event listeners
  browser.runtime.onMessage.addListener(handleOnMessage);
  browser.tabs.onRemoved.addListener(handleRemovedTabs);
}

runApp();
