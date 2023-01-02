// ---- DEV VARS ----
const DEBUG = false;
// ---- APP VARS ----
// Constant vars
const timelineSelector = '[role="main"]';
const postsSelector = '.x1lliihq'
const shadowParentSelector = 'div[style="position: absolute; top: -10000px;"]';
// TIMELINE OBSERVER
const timelineObserverConfig = { attributes: true, childList: true, subtree: true };
const handleTimeline = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList' & mutation.addedNodes.length > 0) {
      for (post of timeline.querySelectorAll(postsSelector)) {
        handlePost(post);
      }
      break;
    }
  }
};
const timelineObserver = new MutationObserver(handleTimeline);
// URL CHANGE OBSERVER
const locationObserverConfig = { childList: true, subtree: true };
const handleLocation = (mutations) => {
  mutations.forEach((mutation) => {
    if (currentLocation != document.location.href) {
      currentLocation = document.location.href;
      if (document.location.href != "https://www.facebook.com/") {
        // STOP TIMELINE OBSERVER
        timelineObserver.disconnect();
        return;
      }
      // START THE TIMELINE OBSERVER
      observeTimeline();
    }
  });
}
const locationObserver = new MutationObserver(handleLocation);
// Mutable vars
let timeline;
let shadowParent;
let currentLocation = location.href;
// ---- Background communication ----
// Start the tab counter
const startTabCounter = async () => {
  browser.runtime.sendMessage({
    msg: "start-counter",
  });
  if (DEBUG) {
    console.log("Tab counter ready request sent from content.js");
  }
}
// UPDATE BADGE TEXT
const updateBadgeText = async () => {
  browser.runtime.sendMessage({
    msg: "update-counter",
  });
  if (DEBUG) {
    console.log("Badge update request sent from content.js");
  }
}

// ---- Function dedicated for  finding and removing sponsored posts ----
const handlePost = async (element) => {
  // Check if post has sponsor text holder
  const useElement = element.querySelector(`use[*|href]`);
  if (!useElement) return;
  // Extract element id
  const post_id = useElement.getAttribute("xlink:href").slice(1)
  if (!post_id) return;
  // Search for shadowroot with same id
  const shadowElements = await waitForElementId(post_id);
  if (!shadowElements) return;
  for (x of shadowElements) {
    if (x.textContent != 'Sponsored') continue;
    // FOR DEBUG ONLY
    if (DEBUG) {
      console.log(x.textContent);
      console.log(element);
      console.log(post_id);
      console.log("found a sponsored post");
      console.log(`Sponsored post deleted, ID : ${post_id}`);
    }
    // Remove the sponsored post
    if (x.isConnected) x.id = "";
    if (element.isConnected) element.style.display = "none";
    await updateBadgeText();
    return;
  }
}

// ---- Utils ----

async function waitForElementId(post_id) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const elements = shadowParent.querySelectorAll(`[id=${post_id}]`);

      if (elements) {
        clearInterval(interval);
        resolve(elements);
      }
    }, 10);
  });
}

async function waitForElementSelector(selector) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const element = document.querySelector(selector)

      if (element) {
        if (DEBUG) {
          // FOR DEBUG ONLY
          console.log(`Found waited element : ${element}`)
        }
        clearInterval(interval);
        resolve(element);
      }
    }, 50);
  });
}

// ---- Observers Functions ----
const observeLocation = () => {
  // GET BODY ELEMENT
  const bodyList = document.querySelector('body');
  // START URL OBSERVER
  locationObserver.observe(bodyList, locationObserverConfig);
}

const observeTimeline = async () => {
  // Load timeline and shadowParent Elements
  timeline = await waitForElementSelector(timelineSelector);
  shadowParent = await waitForElementSelector(shadowParentSelector);
  // Check if any sponsored appeared before load was finished
  for (post of timeline.querySelectorAll(postsSelector)) {
    handlePost(post);
  }
  // Observe timeline
  timelineObserver.observe(timeline, timelineObserverConfig);
}


function runApp() {
  // Activate Extension button
  startTabCounter();
  // Start Observers
  observeTimeline();
  observeLocation();
}

runApp();