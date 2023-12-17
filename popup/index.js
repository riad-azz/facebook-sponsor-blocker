// ------------ helpers imports ------------

/* global getStorageValues */
/* global listenToStorageChange */

(async () => {
  // ------------ Block rules inputs ------------
  const sponsoredCheckbox = document.getElementById("sponsored-checkbox");
  const suggestedCheckbox = document.getElementById("suggested-checkbox");
  const suggestedReelsCheckbox = document.getElementById(
    "suggested-reels-checkbox"
  );
  // ------------ Blocked count display ------------
  const totalCountElement = document.getElementById("fsb-total-count");

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

  const runPopupScript = async () => {
    const { blockedCount = 0, blockSuggested, blockSponsored, blockSuggestedReels } =
      await getStorageValues([
        "blockedCount",
        "blockSponsored",
        "blockSuggested",
        "blockSuggestedReels",
      ]);

    // Set initial block rules values
    sponsoredCheckbox.checked = blockSponsored ?? true;
    suggestedCheckbox.checked = blockSuggested ?? true;
    suggestedReelsCheckbox.checked = blockSuggestedReels ?? true;
    // Observe block rules input changes
    sponsoredCheckbox.addEventListener("change", handleSponsored);
    suggestedCheckbox.addEventListener("change", handleSuggested);
    suggestedReelsCheckbox.addEventListener("change", handleSuggestedReels);

    // Update total count
    totalCountElement.innerText = `${blockedCount}`;
    // Listen for changes in total count
    listenToStorageChange((changes) => {
      if ("blockedCount" in changes) {
        const blockedCount = changes.blockedCount.newValue;
        totalCountElement.innerText = `${blockedCount}`;
      }
    });
  };


  // Run the popup
  runPopupScript();
})();