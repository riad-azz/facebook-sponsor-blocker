// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

const SuggestedReelsSelector = "a[href='/reels/create/']";

/* exported handleSuggestedReels */
/**
 * Handles suggested reels.
 *
 * @param {Element} post - The post element.
 * @param {boolean} [isBlocking=true] - Whether to block the suggested reels or not.
 * @return {boolean} Returns true if the suggested reels was detected, otherwise false.
 */
const handleSuggestedReels = (post, isBlocking = true) => {
  const _isSuggestedReels = !!post.querySelector(SuggestedReelsSelector);
  if (!_isSuggestedReels) return false;

  if (!isBlocking) {
    debugLogger(`Suggested reels removal skipped : ${isBlocking}`);
    return true;
  }

  hideElement(post);
  debugLogger("Found and removed suggested reels:", post);
  return true;
};
