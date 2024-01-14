//  ------------ constants imports ------------

/* global PostSelectors */
/* global FeedSelector */

// ------------ helpers imports ------------

/* global debugLogger */
/* global waitForElement */
/* global getStorageValues */
/* global listenToStorageChange */

//  ------------ Blockers imports ------------

/* global handleSuggestedPosts */
/* global handleSuggestedReels */
/* global handleSuggestedGroups */

(async () => {
  var feedElement = null;

  var blockRules = {
    blockSponsored: true,
    blockSuggested: true,
    blockSuggestedReels: true,
    blockSuggestedGroups: true,
  };

  const initBlockRules = async () => {
    const handleBlockRulesChange = (changes, changedKeys) => {
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
      "blockSponsored",
      "blockSuggested",
      "blockSuggestedReels",
      "blockSuggestedGroups",
    ]);

    blockRules.blockSponsored = storedRules.blockSponsored ?? true;
    blockRules.blockSuggested = storedRules.blockSuggested ?? true;
    blockRules.blockSuggestedReels = storedRules.blockSuggestedReels ?? true;
    blockRules.blockSuggestedGroups = storedRules.blockSuggestedGroups ?? true;

    // Listen for block rules changes
    listenToStorageChange(handleBlockRulesChange);
  }

  const scanFeedPost = (element) => {
    // Check if Suggested reels
    const isSuggestedReels = handleSuggestedReels(element, blockRules.blockSuggestedReels);
    if (isSuggestedReels) return;

    // Check if Suggested groups
    const isSuggestedGroups = handleSuggestedGroups(element, blockRules.blockSuggestedGroups);
    if (isSuggestedGroups) return;

  };

  const scanFeedPosts = async (posts) => {
    for (const post of posts) {
      scanFeedPost(post);
    }
  };


  const observeFeed = async () => {
    // Wait for the feed element and set it globally
    feedElement = await waitForElement(FeedSelector, document, true);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          scanFeedPosts(mutation.addedNodes);
        }
      });
    })

    observer.observe(feedElement, { childList: true });

    scanFeedPosts(feedElement.children);
  }


  const runFeedBlocker = async () => {
    await initBlockRules();
    await observeFeed();
  }

  // Run the feed blocker
  runFeedBlocker()
})()