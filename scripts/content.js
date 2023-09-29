// ---- DEV UTILS ----
const DEBUG = true;

// Constant variables
const sponsorWordsFilter = [
  "Sponsored",
];

// Mutable variables
let body;
let removing = false;
let isBlockSponsored = true;
let isBlockSuggested = true;
let isBlockSuggestedReels = true;
let currentLocation = document.location.href;

// Selector variables
const suggestedSelector = "div.xcnsx8t";
const postsSelector = "div > div > div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z";
const tagSelector = ".x1rg5ohu.x6ikm8r.x10wlt62.x16dsc37.xt0b8zv";
const textSelector = "span > span > span";
const useSelector = "use[*|href]";
const suggestedReelsSelector = "a[href='/reels/create/']";

// ---- UTILS ----

const debugLogger = (...args) => {
  // Show debugging info in the console only if DEBUG is set to true
  if (DEBUG) {
    console.log(...args);
  }
};

const sendMessageToBackground = async (title, ...args) => {
  browser.runtime.sendMessage({ title, ...args });
  debugLogger(`Message sent to background script: ${title}`);
};

const handleMessages = (request) => {
  switch (request.title) {
    case 'BLOCK_SPONSORED_UPDATED':
      isBlockSponsored = request.value;
      debugLogger("Block Sponsored updated in content.js:", isBlockSponsored);
      break;
    case 'BLOCK_SUGGESTED_UPDATED':
      isBlockSuggested = request.value;
      debugLogger("Block Suggested updated in content.js:", isBlockSuggested);
      break;
    case 'BLOCK_SUGGESTED_REELS_UPDATED':
      isBlockSuggestedReels = request.value;
      debugLogger("Block Reels updated in content.js:", isBlockSuggestedReels);
      break;
    default:
      console.log("Unknown message received in content.js:", request.title);
  }
  // If the value is true, scan all posts and remove previously skipped elements
  if (request.value) {
    scanAllPosts();
  }
};

const waitForElementSelector = async (
  selector,
  parent = document,
  infinite = false
) => {
  // Get element asynchronously
  return new Promise((resolve, reject) => {
    let tries = 150;
    const interval = setInterval(function () {
      if (tries <= 0) {
        debugLogger(`Failed to find waited element with selector`, selector);
        clearInterval(interval);
        resolve(null);
      }
      const element = parent.querySelector(selector);
      if (element) {
        debugLogger(`Found waited element with selector:`, selector);
        debugLogger(element);
        clearInterval(interval);
        resolve(element);
      } else if (!infinite) {
        debugLogger(`Element not found ${tries} tries left`, selector);
        tries -= 1;
      }
    }, 100);
  });
};


const deleteInnerHtml = (element) => {
  if (element.isConnected) {
    element.innerHTML = "";
  }
};

const hideElement = (element) => {
  if (element.isConnected) {
    element.className = "";
    element.style.display = "none";
  }
};

const hideBlockedElement = (element) => {
  if (element.isConnected) {
    hideElement(element);
    sendMessageToBackground('UPDATE_COUNTER');
  }
};

const isMainFeedLocation = (currentUrl) => {
  const feedRegex = /^https:\/\/www\.facebook\.com\/\?.*/;
  return currentUrl === "https://www.facebook.com/" || feedRegex.test(currentUrl);
};

const isSponsoredPost = (combination) => {
  const numRegex = /\d/;
  const spaceRegex = /\s/;
  return (
    !numRegex.test(combination) &&
    !spaceRegex.test(combination) &&
    combination.length > 1
  );
};

// ---- SUGGESTED REELS REMOVAL LOGIC ----
const handleSuggestedReels = async (post) => {
  const isReels = !!post.querySelector(suggestedReelsSelector);
  if (!isReels) return false;

  if (!isBlockSuggestedReels) {
    debugLogger(
      `Suggested reels removal skipped because it's disabled :  ${isBlockSuggestedReels}`
    );
    return true;
  }

  hideBlockedElement(post);
  debugLogger("Found and removed suggested reels:", post);
  return true;
};

// ---- SUGGESTED POSTS REMOVAL LOGIC ----
const handleSuggestedPost = async (post) => {
  const isSuggested = !!post.querySelector(suggestedSelector);
  if (!isSuggested) return false;

  if (!isBlockSuggested) {
    debugLogger(
      `Suggested post removal skipped because it's disabled :  ${isBlockSuggested}`
    );
    return true;
  }

  hideBlockedElement(post);
  debugLogger("Found and removed a suggested post", post);
  return true;
};

// ---- SPONSORED POSTS REMOVAL LOGIC ----
const checkSponsoredPostLegacy = (post) => {
  const useElement = post.querySelector(useSelector);
  if (!useElement) return false;

  const postId = useElement.getAttribute("xlink:href").slice(1);
  if (!postId) return false;

  const textElement = document.querySelector(`#${postId}`);
  if (!textElement) return false;

  const textParent = textElement.parentElement;
  if (!textParent) return false;

  const postTag = textParent.textContent.trim();
  if (sponsorWordsFilter.includes(postTag)) {
    if (isBlockSponsored) {
      deleteInnerHtml(textParent);
    }
    debugLogger("Legacy sponsored posts detector model was used");
    return true;
  }

  return false;
};

const checkSponsoredPost = (post) => {
  const tagElement = post.querySelector(tagSelector);
  if (!tagElement) {
    // debugLogger("Tag element not found on post:", post);
    return false;
  }

  if (sponsorWordsFilter.includes(tagElement.textContent)) {
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
  const combination = textArray.join("").trim();
  const isSponsored = isSponsoredPost(combination);

  if (isSponsored) {
    debugLogger("Latest sponsored posts detector model was used");
    return true;
  }

  return false;
};

const handleSponsoredPost = async (post) => {
  let isSponsored = false;
  isSponsored = checkSponsoredPost(post);
  if (!isSponsored) {
    isSponsored = checkSponsoredPostLegacy(post);
  }

  if (!isSponsored) return false;


  if (!isBlockSponsored) {
    debugLogger(
      `Sponsored post removal skipped because it's disabled :  ${isBlockSponsored}`
    );
    return true;
  }

  hideBlockedElement(post);
  debugLogger("Found and removed a sponsored post:", post);
  return true;
};

// ---- POSTS HANDLER ----

// Check if a post is Sponsored or Suggested
const scanSinglePost = async (element) => {
  // Check if Suggested reels
  const isReels = await handleSuggestedReels(element);
  if (isReels) return;

  // Check if Suggested
  const isSuggested = await handleSuggestedPost(element);
  if (isSuggested) return;

  // Check if Sponsored
  const isSponsored = await handleSponsoredPost(element);
  if (isSponsored) return;
};

// Check current feed for Sponsored & Suggested posts.
const scanAllPosts = async () => {
  if (removing) return;
  removing = true;

  for (const post of body.querySelectorAll(postsSelector)) {
    scanSinglePost(post);
  }
  removing = false;
};

// ---- OBSERVERS ----

// Location observer
const handleLocation = () => {
  if (currentLocation !== document.location.href) {
    // Update current location URL
    currentLocation = document.location.href;
    debugLogger(`Location changed from ${currentLocation} to ${document.location.href}`);


    // Only observe the main feed (facebook home page)
    const isCorrectLocation = isMainFeedLocation(currentLocation);
    if (isCorrectLocation) {
      observeFeed();
    } else {
      feedObserver.disconnect();
    }
  }
};
const locationObserver = new MutationObserver(handleLocation);

// Feed observer
const handleFeed = (mutations) => {
  for (const mutation of mutations) {
    if ((mutation.type === "childList") & (mutation.addedNodes.length > 0)) {
      scanAllPosts();
      break;
    }
  }
};
const feedObserver = new MutationObserver(handleFeed);

// ---- Observers Functions ----
const observeFeed = () => {
  // Initial Scan
  scanAllPosts();
  // Listen feed changes and perform a scan whenever new elements are added
  feedObserver.observe(body, {
    attributes: true,
    childList: true,
    subtree: true,
  });
};

const observeLocation = async () => {
  // Listen page changes and check if the URL changed
  locationObserver.observe(body, { childList: true, subtree: true });
};

const loadStoredVariables = async () => {
  const { blockSponsored, blockSuggested, blockReels: blockSuggestedReels } =
    await browser.storage.local.get([
      "blockSponsored",
      "blockSuggested",
      "blockSuggestedReels",
    ]);
  isBlockSponsored = blockSponsored ?? true;
  isBlockSuggested = blockSuggested ?? true;
  isBlockSuggestedReels = blockSuggestedReels ?? true;
};

// ---- START THE EXTENSION ----
async function runApp() {
  // Start the counter for blocked posts in active tab
  await sendMessageToBackground('START_TAB_COUNTER');
  // Set blocker configs
  await loadStoredVariables();
  // Set body element to check for DOM changes
  body = await waitForElementSelector("body");
  // Start Observers
  observeFeed();
  observeLocation();
  // Listen for background script messages
  browser.runtime.onMessage.addListener(handleMessages);
}

runApp();
