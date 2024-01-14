// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

const SuggestedGroupsSelector = "a[href='/groups/discover/']";

/* exported handleSuggestedGroups */
const handleSuggestedGroups = async (post, isBlocking = true) => {
  const isSuggestedGroups = !!post.querySelector(SuggestedGroupsSelector);
  if (!isSuggestedGroups) return false;

  if (!isBlocking) {
    debugLogger(`Suggested groups removal skipped : ${isBlocking}`);
    return true;
  }

  hideElement(post);
  debugLogger("Found and removed suggested groups", post);
  return true;
};