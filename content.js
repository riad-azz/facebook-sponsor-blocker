const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount));

async function runApp() {
  // Get timeline element
  const timeline = await waitForTimeline();
  await wait(500);
  // Removed sponsored posts from timeline

  // Add listener to handle future posts
  timeline.addEventListener('DOMNodeInserted', (event) => {
    const element = event.target
    // Check if added element is a post
    const dots = element.querySelector("[aria-haspopup='menu']");
    if (!dots) return;
    // Check if comment section is active
    const comment = element.getElementsByTagName("form")[0];
    if (comment) return;
    // Check if its the Reels section
    const isReels = element.querySelector("[aria-label='Reels']")
    if (isReels) return;
    // Check if its a Group post
    const isGroup = element.querySelector("b")
    if(isGroup) return;
    // THIS IS FOR DEBUG ONLY
    // console.log(element);
    // console.log("Found Sponsor Post");
    element.remove();
  });
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
