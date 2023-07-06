// ---- TEST UTILS ----

// Test if the badge counter increment is working
const testUpdateCounter = async (times = 3, timer = 3000) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      updateCounter();
      times -= 1;
      if (times <= 0) {
        console.log("Test finished");
        clearInterval(interval);
        resolve(0);
      }
    }, timer);
  });
};

// Get and set the current tab id
const setCurrentTab = async () => {
  let currentTab;
  await browser.tabs
    .query({ currentWindow: true, active: true })
    .then((tabs) => (currentTab = tabs[0].id))
    .catch((error) => console.error(`Error: ${error}`));

  return currentTab;
};
