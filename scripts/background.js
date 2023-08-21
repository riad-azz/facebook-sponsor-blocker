// Background variables
const activeTabs = {};
let totalCount = 0;

// Set the custom badge theme color
browser.browserAction.setBadgeBackgroundColor({ color: "grey" });
browser.browserAction.setBadgeTextColor({ color: "white" });

// Load total removed posts count from extension storage
const loadStoredVariables = async () => {
  const {
    totalCount: count,
    blockSponsored,
    blockSuggested,
    blockReels,
  } = await browser.storage.local.get([
    "totalCount",
    "blockSponsored",
    "blockSuggested",
    "blockReels",
  ]);
  if (count) {
    totalCount = count;
  } else {
    await browser.storage.local.set({ totalCount: 0 });
  }
  if (!blockSponsored) {
    await browser.storage.local.set({ blockSponsored: true });
  }
  if (!blockSuggested) {
    await browser.storage.local.set({ blockSuggested: true });
  }
  if (!blockReels) {
    await browser.storage.local.set({ blockReels: true });
  }
};

// Start count for the specified active tab
const startTabCounter = (tabId) => {
  activeTabs[tabId] = 0;
};

// Update badge text for a specified active tab
const updateTabBadgeCounter = (tabId) => {
  browser.browserAction.setBadgeText({
    tabId: tabId,
    text: `${activeTabs[tabId]}`,
  });
};

// Notify the popup page that the counter changed
const updatePopupCounter = async (tabId) => {
  tabCount = activeTabs[tabId];
  const sending = browser.runtime.sendMessage({
    title: "counter-updated",
    totalCount,
    tabCount,
  });
  sending.then(null, (error) => console.log("Popup page is not open"));
};

// Update the counter for specified tab and the total count
const updateCounter = (tabId) => {
  totalCount += 1;
  activeTabs[tabId] += 1;
  browser.storage.local.set({ totalCount: totalCount });
  updateTabBadgeCounter(tabId);
  updatePopupCounter(tabId);
};

// On message listener ( from content and popup scripts )
const handleOnMessage = (request, sender, sendResponse) => {
  if (request.title === "start-tab-counter") {
    const currentTabId = sender.tab.id;
    startTabCounter(currentTabId);
  } else if (request.title === "update-counter") {
    const currentTabId = sender.tab.id;
    updateCounter(currentTabId);
  } else if (request.title === "get-counter") {
    const currentTabId = request.tabId;
    const response = {
      totalCount,
      tabCount: activeTabs[currentTabId],
    };
    sendResponse(response);
  }
};

// On close tab listener
const handleRemovedTabs = (tabId, removeInfo) => {
  if (tabId in activeTabs) {
    delete activeTabs[tabId];
  }
};

// ------ MAIN -----
function runApp() {
  // Set up app variables
  loadStoredVariables();
  // Add event listeners
  browser.runtime.onMessage.addListener(handleOnMessage);
  browser.tabs.onRemoved.addListener(handleRemovedTabs);
}

runApp();
