const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount));

async function runApp() {
  // Get timeline element
  const timeline = await waitForTimeline();
  await wait(500);
  // Observer
  const config = { attributes: true, childList: true, subtree: true };
  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList' & mutation.addedNodes.length > 0){
        for (element of mutation.addedNodes) {
          // Check if added element is a post
          const dots = element.querySelector("[aria-haspopup='menu']");
          if (!dots) return;
          // Check if its the Reels section
          const isReels = element.querySelector("[aria-label='Reels']");
          if (isReels) return;
          // Get Sponsor section span
          const timeItem = element.querySelector("span[class='x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x676frb x1nxh6w3 x1sibtaa xo1l8bm xi81zsa x1yc453h']");
          if(!timeItem) return;
          const spansCount = timeItem.querySelectorAll("span");
          if (spansCount.length != 16) return;
          // FOR DEBUG ONLY
          // console.log(linkItem.href);
          // console.log(element);
          // console.log("Found Sponsor Post");
          element.remove();
        }
      }
    }
  };
  const observer = new MutationObserver(callback);
  observer.observe(timeline, config);
}

async function waitForTimeline() {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const timeline = document.querySelector(`[role="main"]`);

      if (timeline) {
        clearInterval(interval);
        resolve(timeline);
      }
    }, 50);
  });
}

runApp();
