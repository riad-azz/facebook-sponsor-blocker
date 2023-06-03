// ---- DEV UTILS ----
const DEBUG = false;

// Custom console log
const debugLogger = (...args) => {
  // Show debugging info in the console only if DEBUG is set to true
  if (DEBUG) {
    console.log(...args);
  }
};

// ---- APP VARS ----

// Constant variables
const removeSponsoredPosts = true;
const removeSuggestedPosts = true;
const sponsorWordsFilter = [
  "स्पॉन्सर्ड",
  "مُموَّل",
  "赞助内容",
  "広告",
  "دارای پشتیبانی مالی",
  "La maalgeliyey",
  "Geborg",
  "Reklam",
  "Ditaja",
  "Kanthi Sponsor",
  "Paeroniet",
  "Patrocinat",
  "Spunsurizatu",
  "Noddwyd",
  "Babestua",
  "May Sponsor",
  "Yoɓanaama",
  "Sponsorizât",
  "Stuðlað",
  "Urraithe",
];

// Mutable variables
let timeline;
let removing = false;
let currentLocation = document.location.href;

// Selector variables
const mainSelector =
  ".x9f619.x1n2onr6.x1ja2u2z.x78zum5.x1iyjqo2.xs83m0k.xeuugli.xl56j7k.x1qjc9v5.xozqiw3.x1q0g3np.x1iplk16.x1xfsgkm.xqmdsaz.x1mtsufr.x1w9j1nh[role='main']";
const timelineSelector = ".x1hc1fzr.x1unhpq9.x6o7n8i";
const postsSelector = "div > div > div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z";
const suggestedSelector = "div.xcnsx8t";
const tagSelector = "div > div > span > span > span > span > a";
const textSelector = "span > span > span";
// ---- BACKGROUND SCRIPT COMMUNICATION ----

// Start the current tab counter
const startTabCounter = async () => {
  await browser.runtime.sendMessage({ title: "start-tab-counter" });
  debugLogger("Tab counter ready request sent from content.js");
};

// Update the extension badge counter text
const updateCounter = async () => {
  browser.runtime.sendMessage({ title: "update-counter" });
  debugLogger("Badge update request sent from content.js");
};

// ---- SUGGESTED POSTS REMOVAL LOGIC ----
const handleSuggestedPost = async (post) => {
  const isSuggested = post.querySelector(suggestedSelector);
  if (!isSuggested) {
    return false;
  }
  if (!removeSuggestedPosts) {
    debugLogger(
      `Suggested posts removal is disabled : ${removeSuggestedPosts}`
    );
    return false;
  }

  removeElement(post);
  return true;
};

// ---- SPONSORED POSTS REMOVAL LOGIC ----
const handleSponsoredPost = async (post) => {
  // sponsor check by anchor text
  const tagElement = post.querySelector(tagSelector);
  if (!tagElement) {
    // debugLogger("Tag element not found on post:", post);
    return false;
  }

  if (sponsorWordsFilter.includes(tagElement.textContent)) {
    removeElement(post);
    return true;
  }

  // sponsor check combination
  const textElement = tagElement.querySelector(textSelector);
  if (!textElement) {
    // debugLogger("Text element not found on post:", post);
    return false;
  }
  const combinationElements = textElement.querySelectorAll("span");
  const validElements = Array.from(combinationElements).filter((child) => {
    const computedStyle = window.getComputedStyle(child);
    const positionStyle = computedStyle.getPropertyValue("position");
    return positionStyle === "relative";
  });

  const textArray = Array.from(validElements).map((node) => node.textContent);
  const combination = textArray.join("");
  const isSponsored = isSponsoredPost(combination);
  if (isSponsored) {
    debugLogger("Word combination:", combination);
    removeElement(post);
    return true;
  }

  return false;
};

// ---- POSTS HANDLER ----

// Check if a post is Sponsored or Suggested
const scanSinglePost = async (element) => {
  // Check if Suggested
  if (!removeSuggestedPosts) {
    debugLogger(
      `Suggested post check skipped because it's disabled :  ${removeSponsoredPosts}`
    );
  } else {
    const isSuggested = await handleSuggestedPost(element);
    if (isSuggested) {
      debugLogger("Found and removed a suggested post", element);
      return true;
    }
  }

  // Check if Sponsored
  if (!removeSponsoredPosts) {
    debugLogger(
      `Sponsored post check skipped because it's disabled :  ${removeSponsoredPosts}`
    );
  } else {
    const isSponsored = await handleSponsoredPost(element);
    if (isSponsored) {
      debugLogger("Found and removed a sponsored post:", element);
      return true;
    }
  }

  return false;
};

// Manually check current feed for Sponsored & Suggested posts.
const scanAllPosts = async () => {
  if (removing) return;
  removing = true;
  if (!timeline) {
    debugLogger("Didn't scan all posts because timeline is null", timeline);
    return;
  }
  for (post of timeline.querySelectorAll(postsSelector)) {
    scanSinglePost(post);
  }
  removing = false;
};

// ---- UTILS ----
const isMainFeedLocation = (currentUrl) => {
  const feedRegex = /^https:\/\/www\.facebook\.com\/\?.*/;
  if (
    currentUrl !== "https://www.facebook.com/" &&
    !feedRegex.test(currentUrl)
  ) {
    return false;
  }
  return true;
};

const setTimeline = async () => {
  // Logic for getting the feed timeline

  const currentUrl = document.location.href;
  const validUrl = isMainFeedLocation(currentUrl);
  if (!validUrl) {
    debugLogger("Skipped searching for main feed in :", currentUrl);
    return;
  }

  const mainElement = await waitForElementSelector(mainSelector);
  if (mainElement) {
    timeline = mainElement.querySelector(timelineSelector);
  } else {
    debugLogger("Main feed not found in :", currentUrl);
    return;
  }

  if (timeline) {
    debugLogger("Timeline found:", timeline);
  } else {
    debugLogger("Timeline not found in :", currentUrl);
  }
};

const removeElement = async (element) => {
  if (element.isConnected) {
    element.className = "";
    element.style.display = "none";
    updateCounter();
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

const waitForElementSelector = async (selector) => {
  // Get element asynchronously
  return new Promise((resolve, reject) => {
    let tries = 30;
    const interval = setInterval(function () {
      if (tries <= 0) {
        clearInterval(interval);
        resolve(null);
      }
      const element = document.querySelector(selector);
      if (element) {
        debugLogger(`Found waited element with selector:`, selector);
        debugLogger(element);
        clearInterval(interval);
        resolve(element);
      } else {
        debugLogger(`Element not found ${tries} tries left`, selector);
        tries -= 1;
      }
    }, 1000);
  });
};

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

// ---- OBSERVERS ----

// Location observer
const locationObserverConfig = { childList: true, subtree: true };
const handleLocation = (mutations, observer) => {
  if (currentLocation != document.location.href) {
    debugLogger(
      "Location changed from",
      currentLocation,
      "to",
      document.location.href
    );

    currentLocation = document.location.href;
    const validUrl = isMainFeedLocation(currentLocation);
    if (!validUrl) {
      // STOP TIMELINE OBSERVER
      timelineObserver.disconnect();
      return;
    }
    // START THE TIMELINE OBSERVER
    observeTimeline();
  }
};
const locationObserver = new MutationObserver(handleLocation);

// Timeline observer
const timelineObserverConfig = {
  attributes: true,
  childList: true,
  subtree: true,
};
const handleTimeline = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if ((mutation.type === "childList") & (mutation.addedNodes.length > 0)) {
      for (post of timeline.querySelectorAll(postsSelector)) {
        scanSinglePost(post);
      }
      break;
    }
  }
};
const timelineObserver = new MutationObserver(handleTimeline);

// ---- Observers Functions ----
const observeTimeline = async () => {
  // Get and set the timeline Elements
  if (!timeline) {
    await setTimeline();
  }
  // Scan and remove any posts that were loaded before the extensions
  if (timeline) {
    scanAllPosts();
    timelineObserver.observe(timeline, timelineObserverConfig);
  }
};

const observeLocation = async () => {
  // URL CHANGE OBSERVER
  const bodyList = document.querySelector("body");
  locationObserver.observe(bodyList, locationObserverConfig);
};

// ---- MAIN ----
async function runApp() {
  // Activate Extension button
  await startTabCounter();
  // Start Observers
  observeTimeline();
  observeLocation();
}

runApp();
