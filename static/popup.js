const tabCountElement = document.querySelector('.fsb-tab-count');
const totalCountElement = document.querySelector('.fsb-total-count');

const getCurrentTab = async () => {
  currentTab = null;

  function handleResponse(tabs) {
    currentTab = tabs[0].id;
  }

  function handleError(error) {
    console.error(`Error: ${error}`);
  }

  const fetching = browser.tabs.query({currentWindow: true, active: true});
  await fetching.then(handleResponse, handleError)

  return currentTab;
}

const getRemovedCount = async () => {

  function handleResponse(response) {
    tabCountElement.innerText = `${response.tabCounter}`;
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
  if(request.msg === "counter-updated"){
    tabCountElement.innerText = `${request.tabCounter}`;
    totalCountElement.innerText = `${request.totalCounter}`;
  }
}

function runApp(){
  getRemovedCount();
  browser.runtime.onMessage.addListener(counterListener);
}

runApp();