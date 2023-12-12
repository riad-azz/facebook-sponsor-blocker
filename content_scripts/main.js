//  ------------ constants imports ------------

/* global PostSelectors */
/* global ContentMessages */
/* global sponsorWordsFilter */

// ------------ helpers imports ------------

/* global debugLogger */
/* global waitForElement */
/* global getStorageValues */
/* global listenToStorageChange */

// Mutable variables
let body;
let removing = false;

const blockRules = {
  blockSponsored: true,
  blockSuggested: true,
  blockSuggestedReels: true,
};


const initRulesConfigs = async () => {
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
  await initRulesConfigs();
}


runApp()