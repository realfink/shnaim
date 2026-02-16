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
  perek: number;
  pasuk: number;
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
  return aliyot.find((aliyah) => aliyah.booknum === booknum + 1 && aliyah.perek === chapter + 1 && aliyah.pasuk === verse + 1) || null;
}

function printParsha(booknum: number, chapter: number, verse: number): void {
  const aliyah = getAliyah(booknum, chapter, verse);
  if (aliyah?.aliyah === 1)
    print(`<h2 id="parsha.${aliyah.parsha}">${aliyah.parsha}</h2>`);
}

function printAliyah(booknum: number, chapter: number, verse: number): void {
  const aliyah = getAliyah(booknum, chapter, verse);
  if (aliyah)
    print(`<h3 id="aliyah.${aliyah.parsha}.${aliyah.aliyah}">${AliyotNames[aliyah.aliyah]}</h3>`);
}

function printVerse(booknum: number, chapterIndex: number, verseIndex: number, chumashVerse: string, onkelosVerse: string): void {
  printParsha(booknum, chapterIndex, verseIndex);
  printAliyah(booknum, chapterIndex, verseIndex);

  print(`<span class="verse">`);
  print(`<span class="verse-number">${gematriya(verseIndex + 1)}.</span>`);
  print(`<span class="chumash">${chumashVerse}</span>`);
  print(`<span class="onkelos">${onkelosVerse}</span>`);
  print(`</span>`);
}

function printChapter(booknum: number, chapterIndex: number, chumashChapter: Chapter, onkelosChapter: Chapter): void {
  print(`<h4>פרק ${gematriya(chapterIndex + 1)}</h2>`);
  chumashChapter.forEach((chumashVerse, verseIndex) => {
    var onkelosVerse = onkelosChapter[verseIndex];
    printVerse(booknum, chapterIndex, verseIndex, chumashVerse, onkelosVerse);
  });
}
function printBook(title: string, booknum: number, chumashChapters: Chapter[], onkelosChapters: Chapter[]): void {
  print(`<h1 id="book.${title}">${title}</h1>`);
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
print('  <link rel="stylesheet" href="shnaim.css">');
print('</head>');
print('<body>');
print(`  <div dir="rtl" lang="he">`);
const books = Books.map((book, index) => readBook(book, bookTitles[index]));
books.forEach((book, bookindex) => {
  printBook(book.title, bookindex, book.chumash, book.onkelos);
})
print(`  </div>`);
print('</body>');
print('</html>');
