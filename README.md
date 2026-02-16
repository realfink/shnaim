Here are more detailed, step-by-step instructions to create your EPUB ebook titled **אחד מקרא ואחד תרגום** (Hebrew Tanakh + Targum Onkelos, verse-by-verse, limited to the Torah / Chumash). The process relies on Sefaria.org for sourcing the texts (public domain editions with nikud/ta'amim for Hebrew and proper Aramaic/Hebrew script for Onkelos), then structuring and converting to EPUB.

### Step 1: Obtain the Texts from Sefaria (Recommended: JSON format)
Sefaria provides free downloads and an open API. The easiest way for bulk is per-book downloads in JSON.

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

Alternative if download not visible: Use API manually (no key needed):
- Fetch full book: `https://www.sefaria.org/api/v3/texts/Genesis?version=he|Miqra%20according%20to%20the%20Masorah&context=0`
- For Onkelos: `https://www.sefaria.org/api/v3/texts/Onkelos_Genesis?context=0`
- Save responses as .json files (use browser dev tools or tools like curl/Postman).

### Step 2: Prepare Parshiot and Aliyot Structure
You need verse ranges for organization.

1. Standard parshiot (weekly portions) are fixed — use this Hebrew list (you can hardcode it):
   - בְּרֵאשִׁית, נֹחַ, לֶךְ לְךָ, וַיֵּרָא, חַיֵּי שָׂרָה, תּוֹלְדֹת, וַיֵּצֵא, וַיִּשְׁלַח, וַיֵּשֶׁב, מִקֵּץ, וַיִּגַּשׁ, וַיְחִי
   - שְׁמוֹת, וָאֵרָא, בֹּא, בְּשַׁלַּח, יִתְרוֹ, מִּשְׁפָּטִים, תְּרוּמָה, תְּצַוֶּה, כִּי תִשָּׂא, וַיַּקְהֵל, פְקוּדֵי
   - וַיִּקְרָא, צַו, שְׁמִינִי, תַּזְרִיעַ, מְּצֹרָע, אַחֲרֵי מוֹת, קְדֹשִׁים, אֱמֹר, בְּהַר, בְּחֻקֹּתַי
   - בַּמִּדְבָּר, נָשֹׂא, בְּהַעֲלֹתְךָ, שְׁלַח לְךָ, קֹרַח, חֻקַּת, בָּלָק, פִּינְחָס, מַּטּוֹת, מַסְעֵי
   - דְּבָרִים, וָאֶתְחַנַּן, עֵקֶב, רְאֵה, שֹׁפְטִים, כִּי תֵצֵא, כִּי תָבוֹא, נִצָּבִים, וַיֵּלֶךְ, הַאֲזִינוּ, וְזֹאת הַבְּרָכָה

2. For aliyot (7 per parsha, plus maftir sometimes): Get exact verse ranges from reliable sources:
   - Visit https://www.hebcal.com/sedrot/ (or https://www.sefaria.org/topics/parashat-hashavua) → select year or view standard divisions.
   - Or use Wikipedia "Weekly Torah portion" table (Hebrew column for names, verse ranges).
   - Example: בְּרֵאשִׁית – עליה א: 1:1–2:3; עליה ב: 2:4–19; etc.
   - Hardcode these ranges into a mapping (book → parsha → aliyah → start/end ref like "Genesis.1.1"–"Genesis.2.3").

### Step 3: Build the Content (Merge Hebrew + Onkelos)
Use Python (easiest for processing JSON) or manual if small scale.

1. **Install Python** (if needed) + libraries: `pip install json` (built-in).
2. Write/use a script to:
   - Load Hebrew JSON and Onkelos JSON for each book.
   - Traverse chapters → verses.
   - For each verse: output Hebrew verse number (גימטריה/Hebrew numerals: א, ב, ג... using a function or library like `hebrew_numbers`), Hebrew text, then Onkelos text.
   - Group by parsha/aliyah headings using your range map.
   - Add chapter headings (e.g., פרק א) when a new chapter starts.

   Basic pseudocode example:
   ```python
   import json

   def hebrew_num(n):
       # Simple function or use library to convert 1→א, 2→ב etc.
       pass

   # Load jsons, merge verse-by-verse
   for verse_num in range(1, num_verses+1):
       print(f'<p dir="rtl"><b>{hebrew_num(verse_num)}</b> {hebrew_text[verse_num-1]}<br>{onkelos_text[verse_num-1]}</p>')
   ```

3. Output as structured HTML:
   - Use `<h1>` for ספר (book), `<h2>` for פרשה, `<h3>` for עליה, `<h4>` for פרק if needed.
   - Wrap in `<div dir="rtl" lang="he">` for proper right-to-left.
   - Add basic CSS: `body {font-family: 'David', 'Ezra SIL', serif; direction: rtl; text-align: right;}`
   - Ensure Unicode Hebrew displays correctly (nikud/ta'amim are supported in EPUB).

### Step 4: Create the EPUB File
Use **Calibre** (free, cross-platform: https://calibre-ebook.com/download).

1. Install Calibre.
2. Create a new book:
   - Click "Add books" → "Create empty book".
   - Edit metadata: Title = אחד מקרא ואחד תרגום, Authors = (your name or "מקרא ותרגום אונקלוס"), Language = Hebrew.
3. Add your content:
   - Option A: Paste the full merged HTML into one big "chapter" (Edit book → insert HTML file).
   - Option B: Split into multiple HTML files (one per parsha or book) for better navigation.
   - Add table of contents: Use Calibre's "Edit book" → Tools → Set semantics → Table of Contents (based on headings).
4. Add cover (optional): Search for a simple Torah-themed image or create text-based.
5. Convert:
   - Select book → Convert books → Output format: EPUB.
   - In Look & Feel → enable "Heuristic processing" if needed for RTL fixes.
   - In Page Setup → set margins if desired.
6. For Kindle compatibility:
   - Convert EPUB to AZW3 or MOBI (Kindle prefers these).
   - Test on Kindle device/app: Hebrew RTL + nikud/ta'amim usually render well in modern Kindles.

### Step 5: Testing & Refinements
- Open EPUB in Calibre viewer or Sigil (free EPUB editor) to check RTL, fonts, verse alignment.
- On Kindle: sideload via USB/email → verify no reversed text or missing nikud.
- If alignment issues: Use simple <p> with <br> or CSS tables for verse pairs.

This should produce a clean, navigable ebook organized exactly as requested. If you're not comfortable coding the merge, start with one parsha (e.g., בְּרֵאשִׁית) manually in a Word/Google Doc (RTL mode), then import to Calibre.

If you need a sample Python snippet for one book, a specific parsha's verse ranges, or help troubleshooting a step, provide more details!