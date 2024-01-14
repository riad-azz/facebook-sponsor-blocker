// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

const SuggestedPostSelector = "";

/* exported handleSuggestedPosts */
/**
 * Handles suggested posts.
 *
 * @param {Element} post - The post element.
 * @param {boolean} [isBlocking=true] - Whether to block the suggested post or not.
 * @return {boolean} Returns true if the suggested post was detected, otherwise false.
 */
const handleSuggestedPosts = async (post, isBlocking = true) => {
  const _isSuggestedPost = !!post.querySelector(SuggestedPostSelector);
  if (!_isSuggestedPost) return false;

  if (!isBlocking) {
    debugLogger(`Suggested post removal skipped : ${isBlocking}`);
    return true;
  }

  hideElement(post);
  debugLogger("Found and removed a suggested post", post);
  return true;
};
