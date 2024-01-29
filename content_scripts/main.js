//  ------------ constants imports ------------

/* global MESSAGE_CODE */
/* global FeedSelector */
/* global WatchFeedSelector */

// ------------ helpers imports ------------

/* global debugLogger */
/* global waitForElement */
/* global getStorageValues */
/* global isAlreadyBlocked */
/* global listenToStorageChange */

//  ------------ Blockers imports ------------

/* global handleSuggestedReels */
/* global handleSuggestedGroups */
/* global handleSuggestedPosts */
/* global handleSponsoredPosts */

(async () => {
  var tabCount = 0;
  var blockedCount = 0;
  var feedElement = null;
  var isSearchingFeed = false;
  var isSearchingWatchFeed = false;
  var watchFeedElement = null;
  var currentLocation = document.location.href;

  var blockRules = {
    blockSponsored: true,
    blockSuggested: true,
    blockSuggestedReels: true,
    blockSuggestedGroups: true,
  };

  function handleFeedObserver(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        scanFeedPosts(mutation.addedNodes);
      }
    });
  }

  const feedObserver = new MutationObserver(handleFeedObserver);

  function handleWatchFeedObserver(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        scanFeedPosts(mutation.addedNodes);
      }
    });
  }

  const watchFeedObserver = new MutationObserver(handleWatchFeedObserver);

  /**
   * Initializes the feed blocker and sets up the necessary event listeners.
   * This function listens for changes in the block rules and updates the
   * necessary variables and elements accordingly. It also retrieves the
   * stored block rules from the browser's storage and sets the initial
   * values for the block rules and blocked count.
   *
   * @return {Promise<void>} A promise that resolves once the feed blocker is initialized.
   */
  async function initFeedBlocker() {
    function handleBlockRulesChange(changes, changedKeys) {
      // Update blockedCount if it changed
      if ("blockedCount" in changedKeys) {
        blockedCount = changes.blockedCount.newValue;
      }

      // Check if any of the changed keys are in the blockRules object
      const isBlockRulesUpdate = changedKeys.some((key) => key in blockRules);

      // If no blockRules were updated, return
      if (!isBlockRulesUpdate) {
        return;
      }

      // Update the blockRules object with the new values for the changed keys
      for (const key of changedKeys) {
        if (key in blockRules) {
          blockRules[key] = changes[key].newValue;
        }
      }

      // Scan previous posts if block rules were updated
      if (feedElement) {
        scanFeedPosts(feedElement.children);
      }

      // Scan watch feed if block rules were updated
      if (watchFeedElement) {
        scanFeedPosts(watchFeedElement.children);
      }
    }

    // Get stored block rules
    const storedRules = await getStorageValues([
      "blockedCount",
      "blockSponsored",
      "blockSuggested",
      "blockSuggestedReels",
      "blockSuggestedGroups",
    ]);

    // Set initial blocked count
    blockedCount = storedRules.blockedCount ?? true;

    // Set initial block rules
    blockRules.blockSponsored = storedRules.blockSponsored ?? true;
    blockRules.blockSuggested = storedRules.blockSuggested ?? true;
    blockRules.blockSuggestedReels = storedRules.blockSuggestedReels ?? true;
    blockRules.blockSuggestedGroups = storedRules.blockSuggestedGroups ?? true;

    // Listen for block rules changes
    listenToStorageChange(handleBlockRulesChange);
  }

  /**
   * Updates the badge text, used for displaying the current tab count.
   *
   * @param {string} text - The new text for the badge.
   */
  async function updateBadgeText(text) {
    await browser.runtime.sendMessage({
      code: MESSAGE_CODE.UPDATE_BADGE_TEXT,
      text: text,
    });
  }

  /**
   * Increase the blocked count and update it in local storage.
   *
   * @return {Promise<void>}
   */
  async function increaseBlockedCount() {
    tabCount += 1;
    blockedCount += 1;
    await browser.storage.local.set({ blockedCount });
  }

  /**
   * Scans the feed post element and checks if it matches any block rules.
   *
   * @param {object} element - The feed post element to be scanned.
   * @return {boolean} Returns true if the post was removed, otherwise false.
   */
  function scanFeedPost(element) {
    // Check if Suggested reels
    if (handleSuggestedReels(element, blockRules.blockSuggestedReels)) {
      return true;
    }

    // Check if Suggested groups
    if (handleSuggestedGroups(element, blockRules.blockSuggestedGroups)) {
      return true;
    }

    // Check if Suggested posts
    if (handleSuggestedPosts(element, blockRules.blockSuggested)) {
      return true;
    }

    // Check if Sponsored posts
    if (handleSponsoredPosts(element, blockRules.blockSponsored)) {
      return true;
    }

    return false;
  }

  /**
   * Scans the feed posts and increases the blocked count if a post is removed.
   *
   * @param {Array} posts - The array of feed posts to be scanned.
   * @return {undefined} This function does not return a value.
   */
  function scanFeedPosts(posts) {
    for (const post of posts) {
      // Check if already blocked
      if (isAlreadyBlocked(post)) continue;

      // Scan the post and remove it if it fits the block rules
      const isRemoved = scanFeedPost(post);

      // Increase the blocked count and update the badge text
      if (isRemoved) {
        increaseBlockedCount();
        updateBadgeText(tabCount.toString());
      }
    }
  }

  /**
   * Asynchronously sets the feed element.
   * 
   * @return {Promise<void>} A Promise that resolves when the feed element is set.
   */
  async function setFeedElement() {
    if (isSearchingFeed) return;

    try {
      isSearchingFeed = true;
      feedElement = await waitForElement(FeedSelector, document, true);
      debugLogger("Feed element found", feedElement);

      // Scan the feed posts to clean any posts that escaped
      scanFeedPosts(feedElement.children);
    } finally {
      isSearchingFeed = false;
    }
  }

  /**
   * Set the watch feed element asynchronously.
   *
   * @return {Promise<void>} Resolves when the watch feed element is set.
   */
  async function setWatchFeedElement() {
    if (isSearchingWatchFeed) return;

    try {
      isSearchingWatchFeed = true;
      watchFeedElement = await waitForElement(WatchFeedSelector, document, true, 2000);
      debugLogger("Watch feed element found", watchFeedElement);

      // Scan the feed posts to clean any posts that escaped
      scanFeedPosts(watchFeedElement.children);
    } finally {
      isSearchingWatchFeed = false;
    }
  }

  /**
   * Observes the feed element for changes and scans new feed posts.
   *
   * @return {Promise<void>} - A promise that resolves once the observation is set up.
   */
  async function observeFeed() {
    // Disconnect the previous observer if it exists
    feedObserver.disconnect()

    // Wait for the feed element and set it globally
    await setFeedElement();

    if (feedElement) {

      feedObserver.observe(feedElement, { childList: true });
    }
  }


  /**
 * Observes the feed element for changes and scans new feed posts.
 *
 * @return {Promise<void>} - A promise that resolves once the observation is set up.
 */
  async function observeWatchFeed() {
    // Disconnect the previous observer if it exists
    watchFeedObserver.disconnect()

    // Wait for the watch feed element and set it globally
    await setWatchFeedElement();

    if (watchFeedElement) {
      watchFeedObserver.observe(watchFeedElement, { childList: true });
    }
  }

  function observeLocation() {

    function handleLocationObserver() {
      if (currentLocation !== document.location.href) {
        // Update current location URL
        currentLocation = document.location.href;
      }

      // Refresh the feed element if it's not connected
      if (!feedElement?.isConnected) {
        observeFeed();
      }


      // Refresh the watch feed element if it's not connected
      if (!watchFeedElement?.isConnected) {
        observeWatchFeed()
      }

    }

    const locationObserver = new MutationObserver(handleLocationObserver);
    locationObserver.observe(document, { childList: true, subtree: true });
  }

  async function runFeedBlocker() {
    await initFeedBlocker();
    observeFeed()
    observeWatchFeed()
    observeLocation()
  }

  // Run the feed blocker
  runFeedBlocker();
})();
