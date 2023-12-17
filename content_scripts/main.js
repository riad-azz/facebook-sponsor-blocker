//  ------------ constants imports ------------

/* global PostSelectors */
/* global ContentMessages */
/* global sponsorWordsFilter */

// ------------ helpers imports ------------

/* global debugLogger */
/* global waitForElement */
/* global getStorageValues */
/* global listenToStorageChange */

const blockRules = {
  blockSponsored: true,
  blockSuggested: true,
  blockSuggestedReels: true,
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
  };

  // Get stored block rules
  const storedRules = await getStorageValues([
    "blockSponsored",
    "blockSuggested",
    "blockSuggestedReels",
  ]);
  blockRules.blockSponsored = storedRules.blockSponsored ?? true;
  blockRules.blockSuggested = storedRules.blockSuggested ?? true;
  blockRules.blockSuggestedReels = storedRules.blockSuggestedReels ?? true;

  // Listen for block rules changes
  listenToStorageChange(handleBlockRulesChange);
}

const runApp = async () => {
  await initBlockRules();
}

const observeFeed = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        console.log(mutation.addedNodes)
      }
    });
  })

  observer.observe(document, { childList: true });
}

runApp()