// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */


const SuggestedReelsSelector = "a[href='/reels/create/']";

/* exported handleSuggestedReels */
const handleSuggestedReels = (post, isBlocking = true) => {
  const isSuggestedReels = !!post.querySelector(SuggestedReelsSelector);
  if (!isSuggestedReels) return false;

  if (!isBlocking) {
    debugLogger(
      `Suggested reels removal skipped : ${isBlocking}`
    );
    return true;
  }

  hideElement(post);
  debugLogger("Found and removed suggested reels:", post);
  return true;
};
