const DEBUG = true;

/* exported debugLogger */
/**
 * Log debugging information to the console.
 * The information is only logged if the DEBUG flag is set to true.
 *
 * @param {...any} args - The arguments to be logged.
 */
function debugLogger(...args) {
  // Show debugging info in the console only if DEBUG is set to true
  if (DEBUG) {
    console.debug(...args);
  }
}

/* exported deleteInnerHtml */
function deleteInnerHtml(element) {
  if (element.isConnected) {
    element.innerHTML = "";
  }
}

/**
 * Marks an element as blocked by adding the "blocked-by-fsb" class.
 *
 * @param {Object} element - The element to be marked as blocked.
 */
function markAsBlocked(element) {
  if (element.isConnected) {
    element.classList.add("blocked-by-fsb");
  }
}

/**
 * Checks if the given element is already blocked.
 *
 * @param {Object} element - The element to check.
 * @return {boolean} Returns true if the element is already blocked, false otherwise.
 */
function isAlreadyBlocked(element) {
  if (element.isConnected) {
    const hasClass = element.classList.contains("blocked-by-fsb");
    const hasStyle = element.style.display === "none";
    return hasClass && hasStyle;
  }

  return false;
}

/* exported hideElement */
/**
 * Hides the specified element by removing its CSS class and setting its display style to "none".
 *
 * @param {HTMLElement} element - The element to hide.
 */
async function hideElement(element) {
  if (element.isConnected) {
    element.style.display = "none";
    markAsBlocked(element);
    return true;
  }

  return false;
}

/* exported waitForElement */
/**
 * Wait for an element with the given selector to appear in the DOM.
 *
 * @param {string} selector - The selector of the element to wait for.
 * @param {HTMLElement} parent - The parent element to search within. Defaults to the document.
 * @param {boolean} infinite - Whether to wait indefinitely or give up after a certain number of tries. Defaults to false.
 * @returns {Promise<HTMLElement|null>} - A promise that resolves to the found element, or null if it was not found.
 */
async function waitForElement(selector, parent = document, infinite = false, delay = 500) {
  return new Promise((resolve) => {
    let remainingTries = 150;
    const interval = setInterval(() => {
      if (remainingTries <= 0) {
        clearInterval(interval);
        resolve(null);
      }
      const element = parent.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else if (!infinite) {
        remainingTries--;
      }
    }, delay);
  });
}

/* exported getStorageValues */
/**
 * Retrieves values from local storage based on the provided keys.
 *
 * @param {Array<string>} keys - The keys for the values to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the retrieved values.
 */
async function getStorageValues(keys) {
  // Retrieve values from local storage
  const values = await browser.storage.local.get(keys);

  // Return the retrieved values
  return values;
}

/* exported listenToStorageChange */
/**
 * Handle storage change event.
 * @typedef Changes
 * @property {Record<string, {newValue: any, oldValue: any}>} changes - The object of the change event.
 * @typedef ChangedKeys
 * @property {string[]} changedKeys - The array of changed keys.
 * @param {Function} callback - The callback function to be called when storage changes.
 *
 */
function listenToStorageChange(callback) {
  browser.storage.onChanged.addListener((changes, area) => {
    const changedKeys = Object.keys(changes);
    callback(changes, changedKeys);
  });
}
