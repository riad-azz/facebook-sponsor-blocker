// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

const SuggestedGroupsSelector = "a[href='/groups/discover/']";

/* exported handleSuggestedGroups */
/**
 * Handles suggested groups.
 *
 * @param {Element} post - The post element.
 * @param {boolean} [isBlocking=true] - Whether to block the suggested groups or not.
 * @return {boolean} Returns true if the suggested groups was detected, otherwise false.
 */
const handleSuggestedGroups = async (post, isBlocking = true) => {
  const _isSuggestedGroups = !!post.querySelector(SuggestedGroupsSelector);
  if (!_isSuggestedGroups) return false;

  if (!isBlocking) {
    debugLogger(`Suggested groups removal skipped : ${isBlocking}`);
    return true;
  }

  hideElement(post);
  debugLogger("Found and removed suggested groups", post);
  return true;
};
