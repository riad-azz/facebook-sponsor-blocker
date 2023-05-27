const tabCountElement = document.getElementById("fsb-tab-count");
const totalCountElement = document.getElementById("fsb-total-count");
const tabCountParent = tabCountElement.parentElement;
let currentTab;

// Get and set the current tab id
const setCurrentTab = async () => {
  await browser.tabs
    .query({ currentWindow: true, active: true })
    .then((tabs) => (currentTab = tabs[0].id))
    .catch((error) => console.error(`Error: ${error}`));
};

// Get and set the counter for removed posts
const getRemovedCount = async () => {
  browser.runtime
    .sendMessage({
      title: "get-counter",
      tabId: currentTab,
    })
    .then((response) => {
      if (response.tabCounter !== undefined) {
        tabCountElement.innerText = `${response.tabCounter}`;
      } else {
        tabCountParent.style.display = "none";
      }
      totalCountElement.innerText = `${response.totalCounter}`;
    })
    .catch((error) => console.error(`Error: ${error}`));
};

// Listen for counter updates
const counterListener = (request, sender, sendRes) => {
  if (request.title === "counter-updated") {
    tabCountElement.innerText = `${request.tabCounter}`;
    totalCountElement.innerText = `${request.totalCounter}`;
  }
};

async function runApp() {
  await setCurrentTab();
  // Fetch stored variables
  getRemovedCount();
  // Set up events listeners
  browser.runtime.onMessage.addListener(counterListener);
}

runApp();
