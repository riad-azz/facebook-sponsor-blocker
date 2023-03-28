const tabCountElement = document.querySelector(".fsb-tab-count");
const totalCountElement = document.querySelector(".fsb-total-count");
const tabCountParent = tabCountElement.parentElement;
const checkSponsored = document.querySelector("#sponsored-posts");
const checkSuggested = document.querySelector("#suggested-posts");
const removeButton = document.querySelector(".fsb-button");
let currentTab;

const setCurrentTab = async () => {
  await browser.tabs
    .query({ currentWindow: true, active: true })
    .then((tabs) => (currentTab = tabs[0].id))
    .catch((error) => console.error(`Error: ${error}`));
};

const sponsoredOnChange = async (event) => {
  if (!currentTab) return;
  await browser.storage.local.set({ removeSponsored: checkSponsored.checked });

  browser.runtime.sendMessage({
    tabId: currentTab,
    msg: "request-check-sponsored",
    state: checkSponsored.checked,
  });
};

const suggestedOnChange = async (event) => {
  if (!currentTab) return;
  await browser.storage.local.set({ removeSuggested: checkSuggested.checked });

  browser.runtime.sendMessage({
    tabId: currentTab,
    msg: "request-check-suggested",
    state: checkSuggested.checked,
  });
};

const removeSponsors = async () => {
  await browser.runtime
    .sendMessage({
      msg: "request-remove",
      tabId: currentTab,
    })
    .then((response) => console.log("Sponsored posts removed successfully"))
    .catch((error) => console.error(`Error: ${error}`));
};

const getRemovedCount = async () => {
  browser.runtime
    .sendMessage({
      msg: "request-counter",
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

const counterListener = (request, sender, sendRes) => {
  if (request.msg === "counter-updated") {
    tabCountElement.innerText = `${request.tabCounter}`;
    totalCountElement.innerText = `${request.totalCounter}`;
  } else if (request.msg === "sponsored-check-update") {
    checkSponsored.checked = request.state;
  } else if (request.msg === "suggested-check-update") {
    checkSuggested.checked = request.state;
  }
};

const getUserPreference = async () => {
  const sponsored = await browser.storage.local.get("removeSponsored");
  checkSponsored.checked = sponsored.removeSponsored;
  const suggested = await browser.storage.local.get("removeSuggested");
  checkSuggested.checked = suggested.removeSuggested;
  checkSponsored.addEventListener("change", sponsoredOnChange);
  checkSuggested.addEventListener("change", suggestedOnChange);
};

async function runApp() {
  await setCurrentTab();
  // Fetch stored variables
  getRemovedCount();
  getUserPreference();
  // Set up events listeners
  browser.runtime.onMessage.addListener(counterListener);
  // Set up on click events
  removeButton.onclick = removeSponsors;
}

runApp();
