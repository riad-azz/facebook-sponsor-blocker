// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

/* exported handleSponsoredPosts */
/**
 * Handles sponsored posts.
 *
 * @param {Element} post - The post element.
 * @param {boolean} [isBlocking=true] - Whether to block the sponsored posts or not.
 * @return {boolean} Returns true if the sponsored post was removed, otherwise false.
 */
const handleSponsoredPosts = (post, isBlocking = true) => {
  const SELECTOR = "aaaaaaaaaaaaaaaa";

  const isSponsoredPost = !!post.querySelector(SELECTOR);
  if (!isSponsoredPost) {
    return false;
  }

  if (!isBlocking) {
    debugLogger(`Sponsored post removal skipped : ${isBlocking}`);
    return false;
  }

  hideElement(post);
  debugLogger("Found and removed a sponsored post", post);
  return true;
};
