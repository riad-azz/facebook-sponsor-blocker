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
  const suggestedGroupsCheckbox = document.getElementById(
    "suggested-groups-checkbox"
  );

  // ------------ Blocked count display ------------
  const totalCountElement = document.getElementById("fsb-total-count");

  // Listen for sponsored checkbox changes
  function sponsoredCheckboxListener(event) {
    const value = event.target.checked;
    browser.storage.local.set({ blockSponsored: value });
  }

  // Listen for suggested checkbox changes
  function suggestedCheckboxListener(event) {
    const value = event.target.checked;
    browser.storage.local.set({ blockSuggested: value });
  }

  // Listen for reels checkbox changes
  function suggestedReelsCheckboxListener(event) {
    const value = event.target.checked;
    browser.storage.local.set({ blockSuggestedReels: value });
  }

  // Listen for groups checkbox changes
  function suggestedGroupsCheckboxListener(event) {
    const value = event.target.checked;
    browser.storage.local.set({ blockSuggestedGroups: value });
  }

  async function runPopupScript() {
    const {
      blockedCount = 0,
      blockSuggested,
      blockSponsored,
      blockSuggestedReels,
      blockSuggestedGroups,
    } = await getStorageValues([
      "blockedCount",
      "blockSponsored",
      "blockSuggested",
      "blockSuggestedReels",
      "blockSuggestedGroups",
    ]);

    // Set initial block rules values
    sponsoredCheckbox.checked = blockSponsored ?? true;
    suggestedCheckbox.checked = blockSuggested ?? true;
    suggestedReelsCheckbox.checked = blockSuggestedReels ?? true;
    suggestedGroupsCheckbox.checked = blockSuggestedGroups ?? true;

    // Observe block rules input changes
    sponsoredCheckbox.addEventListener("change", sponsoredCheckboxListener);
    suggestedCheckbox.addEventListener("change", suggestedCheckboxListener);
    suggestedReelsCheckbox.addEventListener(
      "change",
      suggestedReelsCheckboxListener
    );
    suggestedGroupsCheckbox.addEventListener(
      "change",
      suggestedGroupsCheckboxListener
    );

    // Update total count
    totalCountElement.innerText = `${blockedCount}`;
    // Listen for changes in total count
    listenToStorageChange((changes) => {
      if ("blockedCount" in changes) {
        const blockedCount = changes.blockedCount.newValue;
        totalCountElement.innerText = `${blockedCount}`;
      }
    });
  }

  // Run the popup
  runPopupScript();
})();
