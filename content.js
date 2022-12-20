// DEV VARS
const DEBUG = false;
// APP VARS
const postsClass = ".x1lliihq"
let timeline;
let shadowParent;
let currentUrl = location.href;
// UPDATE BADGE TEXT
function updateBadgeText(){
  browser.runtime.sendMessage({
    msg: "sponsor-removed", 
    data: {
        subject: "",
        content: "",
    }
  });
  if(DEBUG){
    console.log("Badge update request sent from content.js");
  }
}

function enableBadge(){
  browser.runtime.sendMessage({
    msg: "enable-badge", 
    data: {
        subject: "",
        content: "",
    }
  });
  if(DEBUG){
    console.log("Badge enable request sent from content.js");
  }
}
// TIMELINE OBSERVER
const config = { attributes: true, childList: true, subtree: true };
// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList' & mutation.addedNodes.length > 0) {
      for (post of timeline.querySelectorAll(postsClass)) {
        removeSponsor(post, shadowParent);
      }
      break;
    }
  }
};
const observer = new MutationObserver(callback);

async function getElements() {
  timeline = await waitForTimeline();
  shadowParent = await waitForShadowParent();
}

async function runApp() {
  // Load timeline and shadowParent Elements
  await getElements()
  // Check if any sponsored appeared before load was finished
  for (post of timeline.querySelectorAll(postsClass)) {
    removeSponsor(post, shadowParent);
  }
  // Start Observer
  observer.observe(timeline, config);
}

async function removeSponsor(element, shadowParent) {
  // Check if post has sponsor text holder
  const useElement = element.querySelector(`use[*|href]`);
  if (!useElement) return;
  // Extract element id
  const post_id = useElement.getAttribute("xlink:href").slice(1)
  if (!post_id) return;
  // Search for shadowroot with same id
  const shadowElements = await waitForShadowElements(shadowParent, post_id);
  if (!shadowElements) return;
  for (x of shadowElements) {
    if (x.textContent != 'Sponsored') continue;
    // FOR DEBUG ONLY
    if (DEBUG) {
      console.log(x.textContent);
      console.log(element);
      console.log(post_id);
      console.log("found a sponsored post");
    } else {
      console.log(`Sponsored post deleted, ID : ${post_id}`);
    }
    if (x.isConnected) {
      await x.remove();
    }
    if (element.isConnected) {
      await element.remove()
      updateBadgeText();
    }
    break;
  }
}

async function waitForShadowElements(shadowParent, post_id) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const elements = shadowParent.querySelectorAll(`[id=${post_id}]`);
      if (DEBUG) {
        // FOR DEBUG ONLY
        console.log('Searching for elements');
      }
      if (elements) {
        if (DEBUG) {
          // FOR DEBUG ONLY
          console.log('Found elements');
          console.log(elements);
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
          // FOR DEBUG ONLY
          console.log(`Found shadow parent`);
          console.log(element);
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
          // FOR DEBUG ONLY
          console.log(`Found timeline`);
          console.log(timeline);
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
          // FOR DEBUG ONLY
          console.log(`Found body ${element}`)
        }
        clearInterval(interval);
        resolve(element);
      }
    }, 50);
  });
}


async function checkURL() {
  // GET BODY ELEMENT
  const bodyList = await waitForBody();
  // URL CHANGE OBSERVER
  const urlObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (currentUrl != document.location.href) {
        currentUrl = document.location.href;
        if (DEBUG) {
          // FOR DEBUG ONLY
          console.log("url changed");
          console.log(document.location.href);
        }
        if (document.location.href != "https://www.facebook.com/") {
          // STOP TIMELINE OBSERVER
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

enableBadge();
checkURL();
runApp();