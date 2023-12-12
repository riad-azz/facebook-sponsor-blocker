/* exported PostSelectors */
const PostSelectors = {
  Post: "div > div > div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z",
  SponsoredUse: "use[*|href]",
  SponsoredTag: ".x1rg5ohu.x6ikm8r.x10wlt62.x16dsc37.xt0b8zv",
  SponsoredText: "span > span > span",
  SuggestedReel: "a[href='/reels/create/']",
  SuggestedPost:
    "div.x1pi30zi.x1swvt13 > div.xdrs2t1.x1q0q8m5.xso031l.x1l90r2v.xyamay9.x1n2onr6 span",
};

/* exported ContentMessages */
const ContentMessages = {
  BLOCK_SPONSORED_UPDATED: "BLOCK_SPONSORED_UPDATED",
  BLOCK_SUGGESTED_UPDATED: "BLOCK_SUGGESTED_UPDATED",
  BLOCK_SUGGESTED_REELS_UPDATED: "BLOCK_SUGGESTED_REELS_UPDATED",
};

/* exported sponsorWordsFilter */
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
