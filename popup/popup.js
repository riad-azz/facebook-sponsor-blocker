
// ------------ helpers imports ------------

/* global getStorageValues */
/* global listenToStorageChange */

// ------------ element references ------------
const totalCountElement = document.getElementById("fsb-total-count");
const sponsoredCheckbox = document.getElementById("sponsored-checkbox");
const suggestedCheckbox = document.getElementById("suggested-checkbox");
const suggestedReelsCheckbox = document.getElementById(
  "suggested-reels-checkbox"
);

const getBlockedCount = async () => {
  try {
    const { blockedCount = 0 } =
      await browser.storage.local.get("blockedCount");
    totalCountElement.innerText = `${blockedCount}`;
  } catch (error) {
    console.log("Failed to get tab count in popup.js:", error);
  }
};

// Listen for sponsored checkbox changes
const handleSponsored = async (event) => {
  const value = event.target.checked;
  browser.storage.local.set({ blockSponsored: value });
};

// Listen for suggested checkbox changes
const handleSuggested = async (event) => {
  const value = event.target.checked;
  browser.storage.local.set({ blockSuggested: value });
};

// Listen for reels checkbox changes
const handleSuggestedReels = async (event) => {
  const value = event.target.checked;
  browser.storage.local.set({ blockSuggestedReels: value });
};

const loadStoredVariables = async () => {
  const { blockSuggested, blockSponsored, blockSuggestedReels } =
    await getStorageValues([
      "blockSponsored",
      "blockSuggested",
      "blockSuggestedReels",
    ]);
  sponsoredCheckbox.checked = blockSponsored ?? true;
  suggestedCheckbox.checked = blockSuggested ?? true;
  suggestedReelsCheckbox.checked = blockSuggestedReels ?? true;
};


const runApp = async () => {
  await loadStoredVariables();
  await getBlockedCount();
  // Observe input changes
  sponsoredCheckbox.addEventListener("change", handleSponsored);
  suggestedCheckbox.addEventListener("change", handleSuggested);
  suggestedReelsCheckbox.addEventListener("change", handleSuggestedReels);

  listenToStorageChange((changes) => {
    if ("blockedCount" in changes) {
      const blockedCount = changes.blockedCount.newValue;
      totalCountElement.innerText = `${blockedCount}`;
    }
  });
}

runApp();