// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */

const SponsoredPostSelector = ""

/* exported handleSponsoredPosts */
const handleSponsoredPosts = async (post, isBlocking = true) => {
  const isSuggestedGroups = !!post.querySelector(SponsoredPostSelector);
  if (!isSuggestedGroups) return false;

  if (!isBlocking) {
    debugLogger(`Sponsored post removal skipped : ${isBlocking}`);
    return true;
  }

  hideElement(post);
  debugLogger("Found and removed a sponsored post", post);
  return true;
};