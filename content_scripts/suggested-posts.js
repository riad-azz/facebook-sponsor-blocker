// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

/* exported handleSuggestedPosts */
/**
 * Handles suggested posts.
 *
 * @param {Element} post - The post element.
 * @param {boolean} [isBlocking=true] - Whether to block the suggested post or not.
 * @return {boolean} Returns true if the suggested post was removed, otherwise false.
 */
const handleSuggestedPosts = (post, isBlocking = true) => {
  const SELECTOR = "aaaaaaaaaaaaaaaa";

  const isSuggestedPost = !!post.querySelector(SELECTOR);
  if (!isSuggestedPost) {
    return false;
  }

  if (!isBlocking) {
    debugLogger(`Suggested post removal skipped : ${isBlocking}`);
    return false;
  }

  hideElement(post);
  debugLogger("Found and removed a suggested post", post);
  return true;
};
