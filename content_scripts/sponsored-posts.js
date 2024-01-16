// ------------ constants imports ------------

/* global sponsorWordsFilter */

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
function handleSponsoredPosts(post, isBlocking = true) {
  const isSponsoredPost = checkSponsoredPost(post);
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
}

/**
 * Checks if a post is a sponsored post.
 *
 * @param {HTMLElement} post - The post to be checked.
 * @return {boolean} True if the post is a sponsored post, false otherwise.
 */
function checkSponsoredPost(post) {
  if (sponsoredCheckDirectText(post)) {
    return true;
  }

  if (sponsoredCheckShadowRoot(post)) {
    return true;
  }

  if (sponsoredPlayThePuzzle(post)) {
    return true;
  }

  return false;
}

/**
 * Checks if a post is sponsored by inspecting the DOM elements.
 *
 * @param {HTMLElement} post - The post object to be checked.
 * @return {boolean} Returns true if the post is sponsored, otherwise false.
 */
function sponsoredCheckShadowRoot(post) {
  const useElement = post.querySelector("use");
  if (!useElement) {
    return false;
  }

  const svgElementId = useElement.getAttribute("xlink:href");
  if (!svgElementId) {
    return false;
  }

  function checkSvgParentText() {
    const svgElement = document.querySelector(svgElementId);
    if (!svgElement) {
      return false;
    }

    const svgElementParent = svgElement.parentElement;
    if (svgElementParent) {
      const svgTextContent = svgElementParent.textContent.trim();
      return sponsorWordsFilter.includes(svgTextContent);
    }

    return false;
  }

  function checkTextElement() {
    let svgNumber = null;
    const svgIdRegex = /SvgT(\d+)/;
    const idMatch = svgIdRegex.exec(svgElementId);

    if (idMatch && idMatch[1]) {
      svgNumber = parseInt(idMatch[1], 10);
    } else {
      return false;
    }

    // We add one because thats how facebook does it
    // when the text element is inside the svg element
    // the svg text child id has the parent id plus one to its number
    const nestedTextId = `#SvgT${svgNumber + 1}`;
    const textElement =
      document.querySelector(`text${svgElementId}`) ||
      document.querySelector(`text${nestedTextId}`);
    if (!textElement) {
      return false;
    }

    const textContent = textElement.textContent.trim();
    return sponsorWordsFilter.includes(textContent);
  }

  if (checkSvgParentText()) {
    return true;
  }

  if (checkTextElement()) {
    return true;
  }

  return false;
}

/**
 * Checks if a post is sponsored by inspecting the DOM elements.
 *
 * @param {HTMLElement} post - The post object to be checked.
 * @return {boolean} Returns true if the post is sponsored, otherwise false.
 */
function sponsoredCheckDirectText(post) {
  const SELECTOR = "span > span > span > a";

  const textElement = post.querySelector(SELECTOR);
  if (!textElement) {
    return false;
  }

  const textContent = textElement.textContent.trim();
  return sponsorWordsFilter.includes(textContent);
}

/**
 * Checks if a post is sponsored by inspecting the DOM elements.
 *
 * @param {HTMLElement} post - The post object to be checked.
 * @return {boolean} Returns true if the post is sponsored, otherwise false.
 */
function sponsoredPlayThePuzzle(post) {
  // Lets play Facebook's find the sponsored word puzzle!

  // First grab the element that holds the possible
  // sponsored word elements.
  const puzzleContainer = post.querySelector(
    "span > span > span > a > span > span > span"
  );

  // Oops! looks like there is no puzzle to play :(
  if (!puzzleContainer) {
    return false;
  }

  // Now let's get an array of the possible elements
  const puzzleElements = puzzleContainer.childNodes;

  // Then we filter out the elements that are not valid
  // the valid elements have the position style set to relative
  const validPuzzleElements = Array.from(puzzleElements).filter(
    (c) => window.getComputedStyle(c).position === "relative"
  );

  // We sort the elements by their order
  const solvedWordArray = [...validPuzzleElements].sort(
    (a, b) =>
      Number(window.getComputedStyle(a).order) -
      Number(window.getComputedStyle(b).order)
  );

  // Finally we join the elements together and remove any white space
  const solvedWord = solvedWordArray.join("").trim();

  // Yay we found the puzzle solution!! now lets check if its Sponsored.
  return sponsorWordsFilter.includes(solvedWord);
}
