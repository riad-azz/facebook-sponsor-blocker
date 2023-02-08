const tabCountElement = document.querySelector('.fsb-tab-count');
const totalCountElement = document.querySelector('.fsb-total-count');
const tabCountParent = tabCountElement.parentElement;
const removeButton = document.querySelector('.fsb-button')


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
  }
}

function runApp() {
  getRemovedCount();
  removeButton.onclick = removeSponsors;
  browser.runtime.onMessage.addListener(counterListener);
}

runApp();