// ---- DEV VARS ----
const DEBUG = false;
const wait = (amount = 0) =>
  new Promise((resolve) => setTimeout(resolve, amount));
// ---- APP VARS ----
// Constant vars
const timelineSelector = '[role="main"]';
const postsSelector = "div > div > div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z";
const shadowParentSelector = 'div[style="position: absolute; top: -10000px;"]';
const suggestedSelector = "div.xcnsx8t";
// Mutable vars
let timeline;
let shadowParent;
let removing = false;
let removeSponsoredPosts = true;
let removeSuggestedPosts = true;
let currentLocation = document.location.href;
// ---- Background communication ----
// Listen to messages
const handleBackground = (request) => {
  if (request.msg === "request-remove") {
    manualPostsRemoval();
  } else if (request.msg === "request-check-sponsored") {
    if (DEBUG) {
      console.log(`sponsored removed : ${request.state}`);
    }
    removeSponsoredPosts = request.state;
  } else if (request.msg === "request-check-suggested") {
    if (DEBUG) {
      console.log(`suggested removed : ${request.state}`);
    }
    removeSuggestedPosts = request.state;
  }
};
// Start the tab counter
const setUpTab = async () => {
  const response = await browser.runtime.sendMessage({
    msg: "start-counter",
  });
  if (DEBUG) {
    console.log("Tab counter ready request sent from content.js");
    console.log(response);
    console.log("sponsored", removeSponsoredPosts);
    console.log("suggested", removeSuggestedPosts);
  }
  removeSponsoredPosts = response.removeSponsored;
  removeSuggestedPosts = response.removeSuggested;
};
// UPDATE BADGE TEXT
const updateCounter = async () => {
  browser.runtime.sendMessage({
    msg: "update-counter",
  });
  if (DEBUG) {
    console.log("Badge update request sent from content.js");
  }
};

// ---- Suggested posts handler ----
const handleSuggestedPost = async (post) => {
  if (!removeSuggestedPosts) {
    if (DEBUG) {
      console.log(`Did not remove suggested posts ${removeSuggestedPosts}`);
    }
    return false;
  }
  const isSuggested = post.querySelector(suggestedSelector);
  if (!isSuggested) return false;
  if (DEBUG) {
    console.log(post);
    console.log("Found and removed a suggested post");
  }
  removeElement(post);
  return true;
};

// ---- Sponsored posts handler ----
const handleSponsoredPosts = async (post) => {
  if (!removeSponsoredPosts) {
    if (DEBUG) {
      console.log(`Did not remove sponsored posts ${removeSponsoredPosts}`);
    }
    return false;
  }
  // Newest sponsor check by class
  if (post.classList.contains("sponsored_ad")) {
    // FOR DEBUG ONLY
    if (DEBUG) {
      console.log(post);
      console.log("found a sponsored post");
      console.log(`Sponsored post deleted, ID : ${post_id}`);
    }
    // Remove the sponsored post
    removeElement(post);
    return true;
  }
  // Check if post has sponsor text holder
  const useElement = post.querySelector(`use[*|href]`);
  if (!useElement) return false;
  // Extract element id
  const post_id = useElement.getAttribute("xlink:href").slice(1);
  if (!post_id) return false;
  // Search for shadowroot with same id
  const shadowElements = await waitForElementId(post_id);
  if (!shadowElements) return false;
  for (x of shadowElements) {
    if (x.textContent != "Sponsored") continue;
    // FOR DEBUG ONLY
    if (DEBUG) {
      console.log(x.textContent);
      console.log(post);
      console.log(post_id);
      console.log("found a sponsored post");
      console.log(`Sponsored post deleted, ID : ${post_id}`);
    }
    // Remove the sponsored post
    if (x.isConnected) x.id = "";
    removeElement(post);
    return true;
  }

  return false;
};

// ---- Posts handler ----
const handlePost = async (element) => {
  // Check if Suggested
  await handleSuggestedPost(element);
  // Check if Sponsored
  await handleSponsoredPosts(element);
};

// ---- UTILS ----
const removeElement = async (element) => {
  if (element.isConnected) {
    const parent = element.parentNode;
    const parentTwo = parent?.parentNode;
    const parentRoot = parentTwo?.parentNode;
    if (parentRoot) {
      parentRoot.remove();
      await updateCounter();
    }
  }
};

const manualPostsRemoval = async () => {
  if (removing) return;
  removing = true;
  if (!timeline) await setTimeline();
  // Check if any sponsored appeared before load was finished
  for (post of timeline.querySelectorAll(postsSelector)) {
    handlePost(post);
  }
  removing = false;
};

const setTimeline = async () => {
  timeline = await waitForElementSelector(timelineSelector);
};

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
      const element = document.querySelector(selector);
      if (element) {
        if (DEBUG) {
          // FOR DEBUG ONLY
          console.log(`Found waited element : ${element}`);
        }
        clearInterval(interval);
        resolve(element);
      }
    }, 500);
  });
}

// ---- TEST UTILS ----
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

// ---- Observers Functions ----
const observeTimeline = async () => {
  // Load timeline and shadowParent Elements
  await setTimeline();
  shadowParent = await waitForElementSelector(shadowParentSelector);
  // Remove posts manually after observer is ready
  manualPostsRemoval();
  timelineObserver.observe(timeline, timelineObserverConfig);
};
const observeLocation = async () => {
  // URL CHANGE OBSERVER
  const bodyList = document.querySelector("body");
  locationObserver.observe(bodyList, locationObserverConfig);
};
// ---- OBSERVERS ----
// Location observer
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
      // EXTRA CHECK FOR POSTS AFTER URL CHANGE
      manualPostsRemoval();
    }
  });
};
const locationObserver = new MutationObserver(handleLocation);
// Timeline observer
const timelineObserverConfig = {
  attributes: true,
  childList: true,
  subtree: true,
};
const handleTimeline = async (mutationList, observer) => {
  if (!timeline) await setTimeline();
  for (const mutation of mutationList) {
    if ((mutation.type === "childList") & (mutation.addedNodes.length > 0)) {
      for (post of timeline.querySelectorAll(postsSelector)) {
        handlePost(post);
      }
      break;
    }
  }
};
const timelineObserver = new MutationObserver(handleTimeline);

// ---- MAIN ----
async function runApp() {
  // Activate Extension button
  await setUpTab();
  // Start Observers
  if (currentLocation === "https://www.facebook.com/") {
    observeTimeline();
  }
  observeLocation();
  // Start Background Listener
  browser.runtime.onMessage.addListener(handleBackground);
}

runApp();
