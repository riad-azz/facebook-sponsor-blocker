// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

/* exported handleSuggestedGroups */
/**
 * Handles suggested groups.
 *
 * @param {Element} post - The post element.
 * @param {boolean} [isBlocking=true] - Whether to block the suggested groups or not.
 * @return {boolean} Returns true if the suggested groups was removed, otherwise false.
 */
const handleSuggestedGroups = (post, isBlocking = true) => {
  const SELECTOR = "a[href='/groups/discover/']";

  const isSuggestedGroups = !!post.querySelector(SELECTOR);
  if (!isSuggestedGroups) {
    return false;
  }

  if (!isBlocking) {
    debugLogger(`Suggested groups removal skipped : ${isBlocking}`);
    return false;
  }

  hideElement(post);
  debugLogger("Found and removed suggested groups", post);
  return true;
};
