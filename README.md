# Achad Mikra Achad Targum

I started doing שניים מקרא שניים תרגום during the preceding week. On Shabbat afternoon, I read the next parsha, and during the week, I do אחד מקרא אחד תרגום. Since I couldn't find any printed books that provide what I do, I created this file to allow me to do it with my Kindle.

The source files (in the src directory) were downloaded from Sefaria.

1. Go to https://www.sefaria.org/texts (or directly to a book, e.g., https://www.sefaria.org/Genesis).
2. For each of the Five Books (Genesis / בְּרֵאשִׁית, Exodus / שְׁמוֹת, Leviticus / וַיִּקְרָא, Numbers / בַּמִּדְבָּר, Deuteronomy / דְּבָרִים):
   - Open the book page (e.g., https://www.sefaria.org/Genesis).
   - Scroll to the bottom or open the "About this Text" / resource panel (click the "i" icon or "About" link if visible).
   - Look for **Download Text** section (usually at bottom of About panel).
   - Select:
     - Version for Hebrew: Choose "Miqra according to the Masorah" or "Tanach with Ta'amei Hamikra" (includes full nikud + ta'amim/cantillation marks).
     - Format: **JSON** (best for structured verse-by-verse processing).
   - Download → Repeat for Targum Onkelos version of the same book (e.g., https://www.sefaria.org/Onkelos_Genesis → About → Download → select the Onkelos version → JSON).
3. You will get 10 JSON files (5 Hebrew + 5 Onkelos).
   - Hebrew JSON structure example: `{ "text": { "he": [ [ "בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים ...", ... ], ... ] } }` — arrays by chapter, then verses.
   - Onkelos similar, with Aramaic text in Hebrew script, usually punctuated.

Send the html file in the out directory to your Kindle: https://www.amazon.com/sendtokindle

Best to download the Hadasim CLM font (open sourced) from the Internet, install it on the Kindle, and select it as your default font: https://www.amazonforum.com/s/question/0D56Q00009ey6v6SAA/adding-fonts-to-the-reader-kindle-paperwhite-11th-generation
