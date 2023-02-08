const tabCountElement = document.querySelector('.fsb-tab-count');
const totalCountElement = document.querySelector('.fsb-total-count');
const tabCountParent = tabCountElement.parentElement;
const checkSponsored = document.querySelector('#sponsored-posts');
const checkSuggested = document.querySelector('#suggested-posts');
const removeButton = document.querySelector('.fsb-button');


const getCurrentTab = async () => {
  currentTab = null;

  function handleResponse(tabs) {
    currentTab = tabs[0].id;
  }

  function handleError(error) {
    console.error(`Error: ${error}`);
  }

  const fetching = browser.tabs.query({ currentWindow: true, active: true });
  await fetching.then(handleResponse, handleError)

  return currentTab;
}


const sponsoredOnChange = async (event) => {
  const tabId = await getCurrentTab();
  if (!tabId) return;
  await browser.storage.local.set({ "removeSponsored": checkSponsored.checked });

  browser.runtime.sendMessage({
    tabId: tabId,
    msg: "request-check-sponsored",
    state: checkSponsored.checked,
  });
}

const suggestedOnChange = async (event) => {
  const tabId = await getCurrentTab();
  if (!tabId) return;
  await browser.storage.local.set({ "removeSuggested": checkSuggested.checked });

  browser.runtime.sendMessage({
    tabId: tabId,
    msg: "request-check-suggested",
    state: checkSuggested.checked,
  });
}

const removeSponsors = async () => {
  function handleResponse(response) {
    console.log("Sponsored posts removed successfully");
  }

  function handleError(error) {
    console.error(`Error: ${error}`);
  }

  const tabId = await getCurrentTab();
  const sending = browser.runtime.sendMessage({
    msg: "request-remove",
    tabId: tabId
  });

  await sending.then(handleResponse, handleError);

}

const getRemovedCount = async () => {

  function handleResponse(response) {
    if (response.tabCounter !== undefined) {
      tabCountElement.innerText = `${response.tabCounter}`;
    } else {
      tabCountParent.style.display = 'none';
    }
    totalCountElement.innerText = `${response.totalCounter}`;
  }

  function handleError(error) {
    console.error(`Error: ${error}`);
  }

  const tabId = await getCurrentTab();
  const sending = browser.runtime.sendMessage({
    msg: "request-counter",
    tabId: tabId
  });

  await sending.then(handleResponse, handleError);
}

const counterListener = (request, sender, sendRes) => {
  if (request.msg === "counter-updated") {
    tabCountElement.innerText = `${request.tabCounter}`;
    totalCountElement.innerText = `${request.totalCounter}`;
  } else if (request.msg === "sponsored-check-update") {
    checkSponsored.checked = request.state;
  } else if (request.msg === "suggested-check-update") {
    checkSuggested.checked = request.state;
  }
}

async function runApp() {
  getRemovedCount();
  const sponsored = await browser.storage.local.get("removeSponsored");
  checkSponsored.checked = sponsored.removeSponsored;
  const suggested = await browser.storage.local.get("removeSuggested");
  checkSuggested.checked = suggested.removeSuggested;
  checkSponsored.addEventListener('change', sponsoredOnChange);
  checkSuggested.addEventListener('change', suggestedOnChange);
  removeButton.onclick = removeSponsors;
  browser.runtime.onMessage.addListener(counterListener);
}

runApp();