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
function handleSuggestedPosts(post, isBlocking = true) {
  const SELECTOR =
    "div.x1pi30zi.x1swvt13 > div.xdrs2t1.x1q0q8m5.xso031l.x1l90r2v.xyamay9.x1n2onr6 span";

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
}
