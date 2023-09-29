
const tabCountElement = document.getElementById("fsb-tab-count");
const totalCountElement = document.getElementById("fsb-total-count");

const sponsoredCheckbox = document.getElementById("sponsored-checkbox");
const suggestedCheckbox = document.getElementById("suggested-checkbox");
const suggestedReelsCheckbox = document.getElementById("reels-checkbox");

let currentTabId = null;

const setCurrentTabId = async () => {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true })
    currentTabId = tabs[0].id
  } catch (error) {
    console.log("Failed to get current tab in popup.js:", error)
  }
};


const getRemoveElementsCount = async () => {

  try {
    const message = { title: "GET_COUNTER", tabId: currentTabId };
    const response = await browser.runtime.sendMessage(message);
    const { tabCount, totalCount } = response;

    if (!tabCount || isNaN(tabCount)) {
      tabCountElement.innerText = "0";
    } else {
      tabCountElement.innerText = `${tabCount}`;
    }

    totalCountElement.innerText = `${totalCount}`;
  } catch (error) {
    console.log("Failed to get tab count in popup.js:", error)
  }

};

// Listen for counter updates
const handleMessages = (request, sender, sendResponse) => {
  switch (request.title) {
    case 'COUNTER_UPDATED':
      const { tabCount, totalCount } = request;
      tabCountElement.innerText = `${tabCount}`;
      totalCountElement.innerText = `${totalCount}`;
      break;
    default:
      console.log("Unknown message received in popup.js:", request.title);
  }

};

const updateLocalStorage = async (key, value) => {
  await browser.storage.local.set({ [key]: value });
}

const sendTabMessage = async (tabId, message) => {
  await browser.tabs.sendMessage(tabId, message);
}

const handleUpdateUserPref = async (tabId, title, key, value) => {
  await updateLocalStorage(key, value);
  await sendTabMessage(tabId, { title, value });
}

// Listen for sponsored checkbox changes
const handleSponsored = async (event) => {
  const value = event.target.checked;
  if (!currentTabId) return;

  handleUpdateUserPref(currentTabId, "BLOCK_SPONSORED_UPDATED", "blockSponsored", value);
};

// Listen for suggested checkbox changes
const handleSuggested = async (event) => {
  const value = event.target.checked;
  if (!currentTabId) return;

  handleUpdateUserPref(currentTabId, "BLOCK_SUGGESTED_UPDATED", "blockSuggested", value);
};

// Listen for reels checkbox changes
const handleSuggestedReels = async (event) => {
  const value = event.target.checked;
  if (!currentTabId) return;

  handleUpdateUserPref(currentTabId, "BLOCK_SUGGESTED_REELS_UPDATED", "blockSuggestedReels", value);
};

const loadStoredVariables = async () => {
  const { blockSuggested, blockSponsored, blockSuggestedReels } =
    await browser.storage.local.get([
      "blockSponsored",
      "blockSuggested",
      "blockSuggestedReels",
    ]);
  sponsoredCheckbox.checked = blockSponsored ?? true;
  suggestedCheckbox.checked = blockSuggested ?? true;
  suggestedReelsCheckbox.checked = blockSuggestedReels ?? true;
};

async function runApp() {
  // Fetch stored variables
  await setCurrentTabId();
  await loadStoredVariables();
  await getRemoveElementsCount();
  // Observe input changes
  sponsoredCheckbox.addEventListener("change", handleSponsored);
  suggestedCheckbox.addEventListener("change", handleSuggested);
  suggestedReelsCheckbox.addEventListener("change", handleSuggestedReels);
  // Listen for background script messages
  browser.runtime.onMessage.addListener(handleMessages);
}

runApp();
