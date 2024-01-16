// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

/* exported handleSuggestedReels */
/**
 * Handles suggested reels.
 *
 * @param {Element} post - The post element.
 * @param {boolean} [isBlocking=true] - Whether to block the suggested reels or not.
 * @return {boolean} Returns true if the suggested reels was removed, otherwise false.
 */
function handleSuggestedReels(post, isBlocking = true) {
  const SELECTOR = "a[href='/reels/create/']";

  const isSuggestedReels = !!post.querySelector(SELECTOR);
  if (!isSuggestedReels) {
    return false;
  }

  if (!isBlocking) {
    debugLogger(`Suggested reels removal skipped : ${isBlocking}`);
    return false;
  }

  hideElement(post);
  debugLogger("Found and removed suggested reels:", post);
  return true;
}
