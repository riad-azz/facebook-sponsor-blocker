const tabCountElement = document.getElementById("fsb-tab-count");
const totalCountElement = document.getElementById("fsb-total-count");
const tabCountParent = tabCountElement.parentElement;
const suggestedCheckbox = document.getElementById("suggested-checkbox");
let currentTabId;

// Get and set the current tab id
const setCurrentTabId = async () => {
  await browser.tabs
    .query({ currentWindow: true, active: true })
    .then((tabs) => (currentTabId = tabs[0].id))
    .catch((error) => console.error(`Error: ${error}`));
};

// Get and set the counter for removed posts
const getRemovedCount = async () => {
  browser.runtime
    .sendMessage({
      title: "get-counter",
      tabId: currentTabId,
    })
    .then((response) => {
      const { tabCount, totalCount } = response;
      if (tabCount !== undefined) {
        tabCountElement.innerText = `${tabCount}`;
      } else {
        tabCountParent.style.display = "none";
      }
      totalCountElement.innerText = `${totalCount}`;
    })
    .catch((error) => console.error(`Error: ${error}`));
};

// Listen for counter updates
const handleMessages = (request, sender, sendRes) => {
  if (request.title === "counter-updated") {
    const { tabCount, totalCount } = request;
    tabCountElement.innerText = `${tabCount}`;
    totalCountElement.innerText = `${totalCount}`;
  }
};

// Listen for suggested checkbox changes
const handleSuggested = async (event) => {
  const value = event.target.checked;
  if (!currentTabId) return;
  browser.storage.local.set({ blockSuggested: value });
  browser.tabs.sendMessage(currentTabId, {
    title: "block-suggested-updated",
    value,
  });
};

const loadStoredVariables = async () => {
  const { blockSuggested } = await browser.storage.local.get([
    "blockSuggested",
  ]);
  suggestedCheckbox.checked = blockSuggested ?? true;
};

async function runApp() {
  // Fetch stored variables
  await setCurrentTabId();
  await loadStoredVariables();
  getRemovedCount();
  // Observe input changes
  suggestedCheckbox.addEventListener("change", handleSuggested);
  // Listen for background script messages
  browser.runtime.onMessage.addListener(handleMessages);
}

runApp();
