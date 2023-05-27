// ---- DEV VARS ----
const DEBUG = false;
const wait = (amount = 0) =>
  new Promise((resolve) => setTimeout(resolve, amount));
// ---- APP VARS ----
// Constant vars
const removeSponsoredPosts = true;
const removeSuggestedPosts = true;
const timelineSelector = '[role="main"]';
const postsSelector = "div > div > div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z";
const suggestedSelector = "div.xcnsx8t";
const anchorSelector = "div > div > span > span > span > span > a";
const combinationFilter = [
  "स्पॉन्सर्ड",
  "مُموَّل",
  "赞助内容",
  "広告",
  "دارای پشتیبانی مالی",
];
// Mutable vars
let timeline;
let removing = false;
let currentLocation = document.location.href;
// Start the tab counter
const startTabCounter = async () => {
  await browser.runtime.sendMessage({ title: "start-tab-counter" });
  if (DEBUG) {
    console.log("Tab counter ready request sent from content.js");
  }
};
// UPDATE BADGE TEXT
const updateCounter = async () => {
  browser.runtime.sendMessage({ title: "update-counter" });
  if (DEBUG) {
    console.log("Badge update request sent from content.js");
  }
};

// ---- Suggested posts handler ----
const handleSuggestedPost = async (post) => {
  const isSuggested = post.querySelector(suggestedSelector);
  if (!isSuggested) {
    return false;
  } else if (!removeSuggestedPosts) {
    if (DEBUG) {
      console.log(
        `Suggested posts removal is disabled : ${removeSuggestedPosts}`
      );
    }
    return false;
  }
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
      console.log(
        `Sponsored posts removal is disabled :  ${removeSponsoredPosts}`
      );
    }
    return false;
  }

  // sponsor check by anchor text
  const anchorElement = post.querySelector(anchorSelector);
  if (!anchorElement) {
    if (DEBUG) {
      console.log(post);
      console.log("Anchor element not found");
    }
    return false;
  }

  if (combinationFilter.includes(anchorElement.textContent)) {
    removeElement(post);
    return true;
  }

  // sponsor check combination
  const tagElement = anchorElement.querySelector("span > span > span");
  if (!tagElement) {
    if (DEBUG) {
      console.log(post);
      console.log("Tag element not found");
    }
    return false;
  }
  const tagChildren = tagElement.querySelectorAll("span");
  const validChildren = Array.from(tagChildren).filter((child) => {
    const computedStyle = window.getComputedStyle(child);
    const positionStyle = computedStyle.getPropertyValue("position");
    return positionStyle === "relative";
  });

  const textArray = Array.from(validChildren).map((node) => node.textContent);
  const combination = textArray.join("");
  const isSponsored = isSponsoredPost(combination);
  if (isSponsored) {
    console.log("combination: ", combination);
    handlePostRemoval(post);
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

const handlePostRemoval = (post) => {
  if (DEBUG) {
    console.log(post);
    console.log("found a sponsored post");
  }

  // Remove the sponsored post
  removeElement(post);
};

// ---- UTILS ----
const removeElement = async (element) => {
  if (element.isConnected) {
    element.remove();
    await updateCounter();
  }
};

const isSponsoredPost = (combination) => {
  const numRegex = /\d/;
  if (numRegex.test(combination)) return false;

  const spaceRegex = /\s/;
  if (spaceRegex.test(combination)) return false;

  if (combination.length <= 1) return false;

  return true;
};

const scanAllPosts = async () => {
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

async function waitForElementSelector(selector) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const element = document.querySelector(selector);
      if (element) {
        if (DEBUG) {
          // FOR DEBUG ONLY
          console.log(`Found waited element :`, element);
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
  // Load timeline Elements
  await setTimeline();
  // Remove posts manually after observer is ready
  scanAllPosts();
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
      scanAllPosts();
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
  await startTabCounter();
  // Start Observers
  observeTimeline();
  observeLocation();
}

runApp();
