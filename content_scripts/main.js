//  ------------ constants imports ------------

/* global FeedSelector */

// ------------ helpers imports ------------

/* global waitForElement */
/* global getStorageValues */
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

  var blockRules = {
    blockSponsored: true,
    blockSuggested: true,
    blockSuggestedReels: true,
    blockSuggestedGroups: true,
  };

  /**
   * Initializes the feed blocker and sets up the necessary event listeners.
   * This function listens for changes in the block rules and updates the
   * necessary variables and elements accordingly. It also retrieves the
   * stored block rules from the browser's storage and sets the initial
   * values for the block rules and blocked count.
   *
   * @return {Promise<void>} A promise that resolves once the feed blocker is initialized.
   */
  const initFeedBlocker = async () => {
    const handleBlockRulesChange = (changes, changedKeys) => {
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
    };

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
  };

  /**
   * Updates the badge text, used for displaying the current tab count.
   *
   * @param {string} text - The new text for the badge.
   */
  const updateBadgeText = (text) => {
    browser.runtime.sendMessage({
      code: "UPDATE_BADGE_TEXT",
      text: text,
    });
  };

  /**
   * Increase the blocked count and update it in local storage.
   *
   * @return {Promise<void>}
   */
  const increaseBlockedCount = async () => {
    tabCount += 1;
    blockedCount += 1;
    browser.storage.local.set({ blockedCount });
  };

  /**
   * Scans the feed post element and checks if it matches any block rules.
   *
   * @param {object} element - The feed post element to be scanned.
   * @return {boolean} Returns true if the post was removed, otherwise false.
   */
  const scanFeedPost = (element) => {
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
  };

  /**
   * Scans the feed posts and increases the blocked count if a post is removed.
   *
   * @param {Array} posts - The array of feed posts to be scanned.
   * @return {undefined} This function does not return a value.
   */
  const scanFeedPosts = async (posts) => {
    for (const post of posts) {
      const isRemoved = scanFeedPost(post);
      if (isRemoved) {
        increaseBlockedCount();
        updateBadgeText(tabCount.toString());
      }
    }
  };

  /**
   * Observes the feed element for changes and scans new feed posts.
   *
   * @return {Promise<void>} - A promise that resolves once the observation is set up.
   */
  const observeFeed = async () => {
    // Wait for the feed element and set it globally
    feedElement = await waitForElement(FeedSelector, document, true);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          scanFeedPosts(mutation.addedNodes);
        }
      });
    });

    observer.observe(feedElement, { childList: true });

    scanFeedPosts(feedElement.children);
  };

  const runFeedBlocker = async () => {
    await initFeedBlocker();
    await observeFeed();
  };

  // Run the feed blocker
  runFeedBlocker();
})();
