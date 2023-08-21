const tabCountElement = document.getElementById("fsb-tab-count");
const totalCountElement = document.getElementById("fsb-total-count");
const tabCountParent = tabCountElement.parentElement;
const sponsoredCheckbox = document.getElementById("sponsored-checkbox");
const suggestedCheckbox = document.getElementById("suggested-checkbox");
const reelsCheckbox = document.getElementById("reels-checkbox");
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

// Listen for sponsored checkbox changes
const handleSponsored = async (event) => {
  const value = event.target.checked;
  if (!currentTabId) return;
  browser.storage.local.set({ blockSponsored: value });
  browser.tabs.sendMessage(currentTabId, {
    title: "block-sponsored-updated",
    value,
  });
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

// Listen for reels checkbox changes
const handleReels = async (event) => {
  const value = event.target.checked;
  if (!currentTabId) return;
  browser.storage.local.set({ blockReels: value });
  browser.tabs.sendMessage(currentTabId, {
    title: "block-reels-updated",
    value,
  });
};

const loadStoredVariables = async () => {
  const { blockSuggested, blockSponsored, blockReels } =
    await browser.storage.local.get([
      "blockSponsored",
      "blockSuggested",
      "blockReels",
    ]);
  sponsoredCheckbox.checked = blockSponsored ?? true;
  suggestedCheckbox.checked = blockSuggested ?? true;
  reelsCheckbox.checked = blockReels ?? true;
};

async function runApp() {
  // Fetch stored variables
  await setCurrentTabId();
  await loadStoredVariables();
  getRemovedCount();
  // Observe input changes
  sponsoredCheckbox.addEventListener("change", handleSponsored);
  suggestedCheckbox.addEventListener("change", handleSuggested);
  reelsCheckbox.addEventListener("change", handleReels);
  // Listen for background script messages
  browser.runtime.onMessage.addListener(handleMessages);
}

runApp();
