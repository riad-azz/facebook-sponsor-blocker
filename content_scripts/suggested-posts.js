// ------------ helpers imports ------------

/* global debugLogger */
/* global hideElement */


const SuggestedPostSelector = ""

/* exported handleSuggestedPosts */
const handleSuggestedPosts = async (post, isBlocking = true) => {
  const isSuggested = !!post.querySelector(SuggestedPostSelector);
  if (!isSuggested) return false;

  if (!isBlocking) {
    debugLogger(
      `Suggested post removal skipped : ${isBlocking}`
    );
    return true;
  }

  hideElement(post);
  debugLogger("Found and removed a suggested post", post);
  return true;
};