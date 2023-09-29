// Constant Variables
const badgeBackgroundColor = { color: "grey" };
const badgeTextColor = { color: "white" };

// Mutable variables
const activeTabs = {};
let totalCount = 0;

// Set badge colors
browser.browserAction.setBadgeBackgroundColor(badgeBackgroundColor);
browser.browserAction.setBadgeTextColor(badgeTextColor);


const loadStoredVariables = async () => {
  const { totalCount: _totalCount } =
    await browser.storage.local.get([
      "totalCount",
      "blockSponsored",
      "blockSuggested",
      "blockSuggestedReels",
    ]);


  const setIfUndefined = async (key, value) => {
    if (!(await browser.storage.local.get(key))[key]) {
      await browser.storage.local.set({ [key]: value });
    }
  };

  if (_totalCount) {
    totalCount = _totalCount;
  } else {
    await setIfUndefined("totalCount", 0);
  }


  await setIfUndefined("blockSponsored", true);
  await setIfUndefined("blockSuggested", true);
  await setIfUndefined("blockSuggestedReels", true);
};

const handleStartTabCounter = (tabId) => {
  activeTabs[tabId] = 0;
};

const handleUpdateCounter = (tabId) => {
  totalCount += 1;
  activeTabs[tabId] += 1;
  browser.storage.local.set({ totalCount: totalCount });

  const tabCount = activeTabs[tabId];
  // Update badge count
  browser.browserAction.setBadgeText({
    tabId: tabId,
    text: `${tabCount}`,
  }).then(null, (error) => console.log("Couldn't update badge count,", error));
  // Update popup counter
  browser.runtime.sendMessage({
    title: "COUNTER_UPDATED",
    totalCount,
    tabCount,
  }).then(null, (error) => console.log("Couldn't update popup count"));;
};

const handleGetCounter = (request, sendResponse) => {
  const response = {
    totalCount,
    tabCount: activeTabs[request.tabId],
  };
  sendResponse(response);
}

// On message listener (from content and popup scripts)
const handleOnMessage = (request, sender, sendResponse) => {
  switch (request.title) {
    case "START_TAB_COUNTER":
      handleStartTabCounter(sender.tab.id);
      break;
    case "UPDATE_COUNTER":
      handleUpdateCounter(sender.tab.id);
      break;
    case "GET_COUNTER":
      handleGetCounter(request, sendResponse);
      break;
    default:
      console.log("Unknown message received in background.js:", request.title);
  }
};

// On close tab listener
const handleRemovedTabs = (tabId, removeInfo) => {
  if (tabId in activeTabs) {
    delete activeTabs[tabId];
  }
};

// ------ MAIN -----
async function runApp() {
  // Set up app variables
  await loadStoredVariables();

  // Add event listeners
  browser.runtime.onMessage.addListener(handleOnMessage);
  browser.tabs.onRemoved.addListener(handleRemovedTabs);
}

runApp();
