// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

const SponsoredPostSelector = "";

/* exported handleSponsoredPosts */
/**
 * Handles sponsored posts.
 *
 * @param {Element} post - The post element.
 * @param {boolean} [isBlocking=true] - Whether to block the sponsored posts or not.
 * @return {boolean} Returns true if the sponsored post was detected, otherwise false.
 */
const handleSponsoredPosts = async (post, isBlocking = true) => {
  const _isSponsoredPost = !!post.querySelector(SponsoredPostSelector);
  if (!_isSponsoredPost) return false;

  if (!isBlocking) {
    debugLogger(`Sponsored post removal skipped : ${isBlocking}`);
    return true;
  }

  hideElement(post);
  debugLogger("Found and removed a sponsored post", post);
  return true;
};
