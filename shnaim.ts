import * as fs from "fs";
import * as path from "path";
import gematriya from "gematriya";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputFilePath = path.join(__dirname, "shnaim.html");
const Books = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"];
const bookTitles = ["בראשית", "שמות", "ויקרא", "במדבר", "דברים"];
const AliyotNames = ["", "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי", "מפטיר"];
const parshiot = [
  ["בראשית", "נח", "לך לך", "וירא", "חיי שרה", "תולדות", "ויצא", "וישלח", "וישב", "מקץ", "ויחי"],
  ["שמות", "וארא", "בא", "בשלח", "יתרו", "משפטים", "תרומה", "תצוה", "כי תשא", "ויקהל", "פקודי"],
  ["ויקרא", "צו", "שמיני", "תזריע", "מצורע", "אחרי מות", "קדושים", "אמור", "בהר", "בחוקותי"],
  ["במדבר", "נשא", "בהעלותך", "שלח", "קרח", "קרח", "חוקת", "בלק", "פנחס", "מטות", "מסעי"],
  ["דברים", "ואתחנן", "עקב", "ראה", "שופטים", "כי תצא", "כי תבוא", "ניצבים", "וילך", "האזינו", "וזאת הברכה"]
];
var aliyot: Aliyah[] = [];

type Chapter = string[];
type Book = {
  title: string;
  chumash: Chapter[];
  onkelos: Chapter[];
}

type Aliyah = {
  book: string;
  booknum: number;
  parsha: string;
  aliyah: number;
  aliyah2: number;
  chapter: number;
  verse: number;
}

function readBook(book: string, title: string): Book {
  const chumash = readChumash(book);
  const onkelos = readOnkelos(book);
  return { title, chumash, onkelos };
}

function readJSON(filename: string): any {
  const filePath = path.join(__dirname, "src", filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent);
}

function readChumash(title: string): any {
  const filename = `${title} - he - Miqra according to the Masorah.json`;
  return readJSON(filename).text;
}

function readOnkelos(title: string): Chapter[] {
  const filename = `Onkelos_${title}.json`;
  return readJSON(filename).versions[0].text;
}

function readAliyot(): any {
  return readJSON("aliyot.json");
}

function getAliyah(booknum: number, chapter: number, verse: number): Aliyah | null {
  return aliyot.find((aliyah) => aliyah.booknum === booknum + 1 && aliyah.chapter === chapter + 1 && aliyah.verse === verse + 1) || null;
}

function printParsha(booknum: number, chapter: number, verse: number): void {
  const aliyah = getAliyah(booknum, chapter, verse);
  if (aliyah?.aliyah === 1) {
    print(`<h2 id="parsha.${aliyah.parsha}">${aliyah.parsha}</h2>`);
    AliyotNames.forEach( (aliyahName, aliyahIndex) => {
        print(`<a href="#aliyah.${aliyah.parsha}.${aliyahIndex}">${aliyahName}</a>`);
    });
  }
}

function printAliyah(booknum: number, chapter: number, verse: number): void {
  const aliyah = getAliyah(booknum, chapter, verse);
  if (aliyah)
    print(`<h3 id="aliyah.${aliyah.parsha}.${aliyah.aliyah}">${AliyotNames[aliyah.aliyah]}${aliyah.aliyah2 ? " (" + AliyotNames[aliyah.aliyah2] + ")" : ""}</h3>`);
}

function printVerse(booknum: number, chapterIndex: number, verseIndex: number, chumashVerse: string, onkelosVerse: string): void {
  printParsha(booknum, chapterIndex, verseIndex);
  printAliyah(booknum, chapterIndex, verseIndex);

  const chumashSplit = chumashVerse.match(/^([\s\S]*?)(&nbsp;.*$|$)/);

  print(`<span class="verse">`);
  print(`<span class="verse-number">${gematriya(verseIndex + 1)}.</span>`);
  print(`<span class="chumash">${chumashSplit ? chumashSplit[1] : ""}</span>`);
  print(`<span class="onkelos">${onkelosVerse}</span>`);
  if (chumashSplit && chumashSplit[2])
    print(`<span class="chumash-trail">${chumashSplit[2]}</span>`);
  print(`</span>`);
}

function printChapter(booknum: number, chapterIndex: number, chumashChapter: Chapter, onkelosChapter: Chapter): void {
  print(`<span class="chapter">פרק ${gematriya(chapterIndex + 1)}</span>`);
  chumashChapter.forEach((chumashVerse, verseIndex) => {
    var onkelosVerse = onkelosChapter[verseIndex];
    printVerse(booknum, chapterIndex, verseIndex, chumashVerse, onkelosVerse);
  });
}
function printBook(title: string, booknum: number, chumashChapters: Chapter[], onkelosChapters: Chapter[]): void {
  print(`<h1 id="book.${title}">${title}</h1>`);
  parshiot[booknum].forEach((parshaname) => {
    print(`<a href="#parsha.${parshaname}">${parshaname}</a>`);
  })
  chumashChapters.forEach((chumashChapter, chapterIndex) => {
    var onkelosChapter = onkelosChapters[chapterIndex];
    printChapter(booknum, chapterIndex, chumashChapter, onkelosChapter);
  })
}

function print(content: string): void {
  fs.writeFileSync(outputFilePath, content + "\n", { flag: 'a' });
}

aliyot = readAliyot();
print('<!DOCTYPE html>');
print('<html>');
print('<head>');
print('  <link rel="stylesheet" href="styles.css">');
print('</head>');
print('<body>');
print(`  <div dir="rtl" lang="he">`);
const books = Books.map((book, index) => readBook(book, bookTitles[index]));
books.forEach((book) => {
  print(`<a href="#book.${book.title}">${book.title}</a>`);
})
books.forEach((book, bookindex) => {
  printBook(book.title, bookindex, book.chumash, book.onkelos);
})
print(`  </div>`);
print('</body>');
print('</html>');
