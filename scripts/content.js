// ---- DEV UTILS ----
const DEBUG = true;

// Constant variables
const sponsorWordsFilter = [
  "Sponsored",
  "स्पॉन्सर्ड",
  "مُموَّل",
  "赞助内容",
  "広告",
  "دارای پشتیبانی مالی",
  "La maalgeliyey",
  "Geborg",
  "Reklam",
  "Ditaja",
  "Kanthi Sponsor",
  "Paeroniet",
  "Patrocinat",
  "Spunsurizatu",
  "Noddwyd",
  "Babestua",
  "May Sponsor",
  "Yoɓanaama",
  "Sponsorizât",
  "Stuðlað",
  "Urraithe",
  "Sponsored", // English
  "Patrocinado", // Spanish
  "Sponsorisé", // French
  "Gesponsert", // German
  "Sponsorizzato", // Italian
  "Patrocinado", // Portuguese
  "Спонсируемый", // Russian
  "スポンサード", // Japanese
  "赞助", // Chinese (Simplified)
  "प्रायोजित", // Hindi
  "스폰서", // Korean
  "Gesponsord", // Dutch
  "Sponsor", // Swedish
  "Sponsorerede", // Danish
  "Sponset", // Norwegian
  "Sponsoroidut", // Finnish
  "Sponsorowane", // Polish
  "Sponsorlu", // Turkish
  "Χορηγούμενο", // Greek
  "Sponzorováno", // Czech
  "Támogatott", // Hungarian
  "Sponsorizat", // Romanian
  "Disponsori", // Indonesian
  "Được tài trợ", // Vietnamese
  "ผู้สนับสนุน", // Thai
  "Ditaja", // Malay
  "ממומן", // Hebrew
  "Спонсоровано", // Ukrainian
  "Спонсорирано", // Bulgarian
  "Patrocinat", // Catalan
  "Sponsoreret", // Danish
  "Sponsorált", // Hungarian
  "Χορηγούμενη", // Greek
  "Sponsorowane", // Polish
  "Подпомогнат", // Macedonian
  "Sponsorisht", // Albanian
  "Patrocinat", // Romanian
  "Sponsrad", // Swedish
  "Sponzorirano", // Slovenian
  "Patrocinat", // Occitan
  "Sponsoroitu", // Finnish
  "Sponsrad", // Swedish
  "Sponzorirano", // Bosnian
  "Sponsorerad", // Swedish
  "Sponsort", // Luxembourgish
  "Esponsorizado", // Galician
  "Patrocinado", // Asturian
  "פּאַטראָספירט", // Yiddish
  "ಸ್ಪಾನ್ಸರ್", // Kannada
  "முகாமையான", // Tamil
  "স্পন্সরযোগ্য", // Bengali
  "స్పాన్సర్", // Telugu
  "സ്പോൺസർഡ്", // Malayalam
  "ස්පෝන්සර්", // Sinhala
  "سپانسر", // Pashto
  "پنچانگی", // Urdu
  "سپانسر", // Kashmiri
  "سپانسر", // Sindhi
  "পৰমৰ্শক", // Assamese
  "স্পনসর", // Bengali
  "ସ୍ପନସରଡ୍", // Odia
  "স্পনসরকৃত", // Assamese
  "স্পনসরকৃত", // Bengali
  "સ્પોન્સર", // Gujarati
  "સ્પોન્સરડ", // Gujarati
  "संवर्धित", // Marathi
  "स्पोन्सर्ड", // Nepali
  "সৰ্বদলীয়", // Assamese
  "সহায়িত", // Bengali
  "ପ୍ରଯୋଜିତ", // Odia
  "பொறுப்பு", // Tamil
  "ప్రొత్సాహించబడిన", // Telugu
  "ಬೆಂಬಲಿತ", // Kannada
  "പ്രായോജിച്ചത്", // Malayalam
  "සහභාගී", // Sinhala
  "خاندهار", // Pashto
  "نیازمند", // Urdu
  "سامارا", // Kashmiri
  "سپونسرډ", // Pashto
  "ସଂରକ୍ଷିତ", // Odia
  "স্বাস্থ্যকর", // Bengali
  "સંરક્ષિત", // Gujarati
  "संगठित", // Marathi
  "प्रायोजित", // Nepali
  "પોતાનીને", // Gujarati
  "தனித்துவ", // Tamil
  "అమలు", // Telugu
  "ನಿರಪೇಕ್ಷ", // Kannada
  "സ്വന്തമായ", // Malayalam
  "වෙනුවෙන්", // Sinhala
  "تحت", // Pashto
  "زیر", // Urdu
  "وستوئید", // Kashmiri
  "دریځیږی", // Pashto
  "ରୂପରେ", // Odia
  "উজ্জ্বল", // Bengali
  "ઉજ્જવળ", // Gujarati
  "निरंकुश", // Marathi
  "प्रायोजित", // Nepali
  "પુરાવાં", // Gujarati
  "அணுகல்", // Tamil
  "గొత్తు", // Telugu
  "ಹಕ್ಕುದಾರರು", // Kannada
  "അനുസരിച്ച്", // Malayalam
  "වරක්", // Sinhala
  "په", // Pashto
  "مطابق", // Urdu
  "جيبنه", // Kashmiri
  "پامیګر", // Pashto
  "ମଧ୍ୟ", // Odia
  "উপর", // Bengali
  "પર", // Gujarati
  "सामग्री", // Marathi
  "प्रायोजित", // Nepali
  "પર", // Gujarati
  "மேல்", // Tamil
  "పైన", // Telugu
  "ಮೇಲೆ", // Kannada
  "പതിപ്പിക്കപ്പെട്ട", // Malayalam
  "සඳහා", // Sinhala
  "دی", // Pashto
  "کی", // Urdu
  "حسب", // Arabic
  "آژانس", // Persian
  "ترویجی", // Persian
  "تبلیغی", // Persian
  "حمایتی", // Persian
  "حمایتی", // Persian
  "تبلیغاتی", // Persian
  "تبلیغاتی", // Persian
  "تبلیغاتی", // Persian
  "ترویجی", // Persian
  "دعاوی", // Persian
  "تبلیغی", // Persian
];

// Mutable variables
let body;
let removing = false;
let isBlockSponsored = true;
let isBlockSuggested = true;
let currentLocation = document.location.href;

// Selector variables
const suggestedSelector = "div.xcnsx8t";
const postsSelector = "div > div > div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z";
const tagSelector = ".x1rg5ohu.x6ikm8r.x10wlt62.x16dsc37.xt0b8zv";
const textSelector = "span > span > span";
const useSelector = "use[*|href]";

// ---- UTILS ----

const debugLogger = (...args) => {
  // Show debugging info in the console only if DEBUG is set to true
  if (DEBUG) {
    console.log(...args);
  }
};

const startTabCounter = async () => {
  await browser.runtime.sendMessage({ title: "start-tab-counter" });
  debugLogger("Tab counter ready request sent from content.js");
};

const updateCounter = async () => {
  browser.runtime.sendMessage({ title: "update-counter" });
  debugLogger("Badge counter update request sent from content.js");
};

const handleMessages = (request) => {
  if (request.title === "block-sponsored-updated") {
    isBlockSponsored = request.value;
    if (isBlockSponsored) {
      scanAllPosts();
    }
    debugLogger("Block Sponsored updated in content.js:", isBlockSuggested);
  } else if (request.title === "block-suggested-updated") {
    isBlockSuggested = request.value;
    if (isBlockSuggested) {
      scanAllPosts();
    }
    debugLogger("Block Suggested updated in content.js:", isBlockSuggested);
  }
};

const waitForElementSelector = async (
  selector,
  parent = document,
  infinite = false
) => {
  // Get element asynchronously
  return new Promise((resolve, reject) => {
    let tries = 150;
    const interval = setInterval(function () {
      if (tries <= 0) {
        debugLogger(`Failed to find waited element with selector`, selector);
        clearInterval(interval);
        resolve(null);
      }
      const element = parent.querySelector(selector);
      if (element) {
        debugLogger(`Found waited element with selector:`, selector);
        debugLogger(element);
        clearInterval(interval);
        resolve(element);
      } else if (!infinite) {
        debugLogger(`Element not found ${tries} tries left`, selector);
        tries -= 1;
      }
    }, 100);
  });
};

const removeElement = async (element) => {
  if (element.isConnected) {
    element.className = "";
    element.style.display = "none";
    updateCounter();
  }
};

const isMainFeedLocation = (currentUrl) => {
  const feedRegex = /^https:\/\/www\.facebook\.com\/\?.*/;
  if (
    currentUrl !== "https://www.facebook.com/" &&
    !feedRegex.test(currentUrl)
  ) {
    return false;
  }
  return true;
};

const isSponsoredPost = (combination) => {
  const numRegex = /\d/;
  if (numRegex.test(combination)) return false;

  const spaceRegex = /\s/;
  if (spaceRegex.test(combination)) return false;

  if (combination.length <= 1) return false;

  return true;
};

// ---- SUGGESTED POSTS REMOVAL LOGIC ----
const handleSuggestedPost = async (post) => {
  const isSuggested = post.querySelector(suggestedSelector);
  if (!isSuggested) {
    return false;
  }
  if (!isBlockSuggested) {
    debugLogger(`Suggested posts removal is disabled : ${isBlockSuggested}`);
    return false;
  }

  removeElement(post);
  return true;
};

// ---- SPONSORED POSTS REMOVAL LOGIC ----
const legacySponsoredPostRemoval = (post) => {
  const useElement = post.querySelector(useSelector);
  if (!useElement) return false;

  const postId = useElement.getAttribute("xlink:href").slice(1);
  if (!postId) return false;

  const textElement = document.querySelector(`text[id='${postId}']`);
  if (!textElement) return false;

  const postTag = textElement.textContent;
  if (sponsorWordsFilter.includes(postTag)) {
    textElement.id = "";
    removeElement(post);
    debugLogger("Legacy removal model was used");
    return true;
  }

  return false;
};

const sponsoredPostRemoval = (post) => {
  const tagElement = post.querySelector(tagSelector);
  if (!tagElement) {
    // debugLogger("Tag element not found on post:", post);
    return false;
  }

  if (sponsorWordsFilter.includes(tagElement.textContent)) {
    removeElement(post);
    return true;
  }

  // sponsor check combination
  const textElement = tagElement.querySelector(textSelector);
  if (!textElement) {
    // debugLogger("Text element not found on post:", post);
    return false;
  }
  const combinationElements = textElement.querySelectorAll("span");
  const validElements = Array.from(combinationElements).filter((child) => {
    const computedStyle = window.getComputedStyle(child);
    const positionStyle = computedStyle.getPropertyValue("position");
    return positionStyle === "relative";
  });

  const textArray = Array.from(validElements).map((node) => node.textContent);
  const combination = textArray.join("");
  const isSponsored = isSponsoredPost(combination);
  if (isSponsored) {
    removeElement(post);
    debugLogger("Latest removal model was used");
    return true;
  }
};

const handleSponsoredPost = async (post) => {
  const isSponsored = sponsoredPostRemoval(post);
  if (!isSponsored) {
    const legacyIsSponsored = legacySponsoredPostRemoval(post);
    if (!legacyIsSponsored) {
      return false;
    }
  }
  return true;
};

// ---- POSTS HANDLER ----

// Check if a post is Sponsored or Suggested
const scanSinglePost = async (element) => {
  // Check if Suggested
  if (!isBlockSuggested) {
    debugLogger(
      `Suggested post check skipped because it's disabled :  ${isBlockSuggested}`
    );
  } else {
    const isSuggested = await handleSuggestedPost(element);
    if (isSuggested) {
      debugLogger("Found and removed a suggested post", element);
      return true;
    }
  }

  // Check if Sponsored
  if (!isBlockSponsored) {
    debugLogger(
      `Sponsored post check skipped because it's disabled :  ${isBlockSponsored}`
    );
  } else {
    const isSponsored = await handleSponsoredPost(element);
    if (isSponsored) {
      debugLogger("Found and removed a sponsored post:", element);
      return true;
    }
  }

  return false;
};

// Check current feed for Sponsored & Suggested posts.
const scanAllPosts = async () => {
  if (removing) return;
  removing = true;

  for (post of body.querySelectorAll(postsSelector)) {
    scanSinglePost(post);
  }
  removing = false;
};

// ---- OBSERVERS ----

// Location observer
const handleLocation = (mutations, observer) => {
  if (currentLocation != document.location.href) {
    debugLogger(
      "Location changed from",
      currentLocation,
      "to",
      document.location.href
    );

    currentLocation = document.location.href;
    const validUrl = isMainFeedLocation(currentLocation);
    if (!validUrl) {
      // STOP FEED OBSERVER
      feedObserver.disconnect();
      return;
    }
    // START THE FEED OBSERVER
    observeFeed();
  }
};
const locationObserver = new MutationObserver(handleLocation);

// Feed observer
const handleFeed = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if ((mutation.type === "childList") & (mutation.addedNodes.length > 0)) {
      scanAllPosts();
      break;
    }
  }
};
const feedObserver = new MutationObserver(handleFeed);

// ---- Observers Functions ----
const observeFeed = async () => {
  scanAllPosts();
  feedObserver.observe(body, {
    attributes: true,
    childList: true,
    subtree: true,
  });
};

const observeLocation = async () => {
  // URL CHANGE OBSERVER
  locationObserver.observe(body, { childList: true, subtree: true });
};

const loadStoredVariables = async () => {
  const { blockSponsored, blockSuggested } = await browser.storage.local.get([
    "blockSponsored",
    "blockSuggested",
  ]);
  isBlockSponsored = blockSponsored ?? true;
  isBlockSuggested = blockSuggested ?? true;
};

// ---- START THE EXTENSION ----
async function runApp() {
  // Start the counter for blocked posts in active tab
  await startTabCounter();
  // Set blocker configs
  await loadStoredVariables();
  // Set body element to check for DOM changes
  body = await waitForElementSelector("body");
  // Start Observers
  observeFeed();
  observeLocation();
  // Listen for background script messages
  browser.runtime.onMessage.addListener(handleMessages);
}

runApp();
