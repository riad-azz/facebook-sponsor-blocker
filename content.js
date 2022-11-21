// const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount));
const DEBUG = true;
// Get timeline element
let timeline;
let shadowParent;
let currentUrl = location.href;
const config = { attributes: true, childList: true, subtree: true };
// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList' & mutation.addedNodes.length > 0) {
      for (element of mutation.addedNodes) {
        // Check if added element is a post
        try {
          const dots = element.querySelector("[aria-haspopup='menu']");
          if (!dots) return;
          removeSponsor(element, shadowParent);
        } catch (error) { return; }
      }
    }
  }
};
const observer = new MutationObserver(callback);

async function getElements() {
  timeline = await waitForTimeline();
  shadowParent = await waitForShadowParent();
}

async function runApp() {
  // Load Elements
  await getElements()
  // Start Observer
  observer.observe(timeline, config);
}

async function removeSponsor(element, shadowParent) {
  // Check if post has sponsor text holder
  const useElement = element.querySelector(`use[*|href]`);
  if (!useElement) return;
  // Extract element id
  const post_id = useElement.getAttribute("xlink:href")
  if (!post_id) return;
  // Search for shadowroot with same id
  const shadowElements = await waitForShadowElements(shadowParent);
  for (x of shadowElements) {
    const shadowID = "#" + x.getAttribute("id")
    if (shadowID !== post_id) continue;
    if (x.textContent != 'Sponsored') continue;
    console.log(shadowID);
    // FOR DEBUG ONLY
    if (DEBUG) {
      console.log(x.textContent);
      console.log(element);
      console.log("found the post");
    }
    x.remove();
    element.remove()
    break;
  }
}

async function waitForShadowElements(shadowParent) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const elements = shadowParent.querySelectorAll("[id*=gid]");
      if (DEBUG) {
        console.log('Searching for elements')
      }
      if (elements) {
        if (DEBUG) {
          console.log('Found elements')
        }
        clearInterval(interval);
        resolve(elements);
      }
    }, 10);
  });
}

async function waitForShadowParent() {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const element = document.querySelector('div[style="position: absolute; top: -10000px;"]');

      if (element) {
        if (DEBUG) {
          console.log(`Found shadow parent ${element}`)
        }
        clearInterval(interval);
        resolve(element);
      }
    }, 50);
  });
}

async function waitForTimeline() {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const timeline = document.querySelector('[role="main"]');

      if (timeline) {
        if (DEBUG) {
          console.log(`Found timeline ${timeline}`)
        }
        clearInterval(interval);
        resolve(timeline);
      }
    }, 50);
  });
}

async function waitForBody() {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const element = document.querySelector("body")

      if (element) {
        if (DEBUG) {
          console.log(`Found body ${element}`)
        }
        clearInterval(interval);
        resolve(element);
      }
    }, 50);
  });
}


async function checkURL() {
  const bodyList = await waitForBody();
  const urlObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (currentUrl != document.location.href) {
        currentUrl = document.location.href;
        if(DEBUG){
        console.log("url changed");
        console.log(document.location.href);
        }
        if(document.location.href != "https://www.facebook.com/"){
          // STOP OBSERVER
          observer.disconnect();
          return;
        }
        // RESTART THE APP
        runApp();
      }
    });
  });

  var config = {
    childList: true,
    subtree: true
  };

  urlObserver.observe(bodyList, config);
}

runApp();
checkURL();