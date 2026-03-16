import * as fs from "fs";
import * as path from "path";
import gematriya from "gematriya";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exit } from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OutputFileName = "אחד מקרא אחד תרגום.html"
const OutputFileDir = path.join(__dirname, "out");
const OutputFilePath = path.join(__dirname, "out", OutputFileName);
const BookTitlesEnglish = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"];
const BookTitlesHebrew = ["בראשית", "שמות", "ויקרא", "במדבר", "דברים"];
const AliyotNames = ["", "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי"];

var parshiot: string[][] = readParshiot();
var aliyot: Aliyah[] = readAliyot();

type Chapter = string[];
type Book = {
  title: string;
  chumash: Chapter[];
  perush: Chapter[];
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

type Perush = {
  perushname: string;
  inputfilename: (bookname: string) => string;
  outputfilename: string;
}

const perushim = [
  {
    perushname: "Onkelos",
    inputfilename: (bookname: string) => `Onkelos ${bookname} - he - Onkelos ${bookname}.json`,
    outputfilename: "אחד מקרא אחד תרגום.html"
  },
  {
    perushname: "Rashi",
    inputfilename: (bookname: string) => `Rashi on ${bookname} - he - Rashi Chumash, Metsudah Publications, 2009.json`,
    outputfilename: 'אחד מקרא אחד רש״י.html'
  }
];

function readBook(bookname: string, title: string): Book {
  const chumash = readChumash(bookname);
  const perush = readPerush(perushim[0], bookname); // Assuming Onkelos is the first perush
  return { title, chumash, perush };
}

function readJSON(filename: string): any {
  const filePath = path.join(__dirname, "src", filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent);
}

function readChumash(bookname: string): any {
  const filename = `${bookname} - he - Miqra according to the Masorah.json`;
  return readJSON(filename).text;
}

function readPerush(perush: Perush, bookname: string): Chapter[] {
  const filename = perush.inputfilename(bookname);
  return readJSON(filename).text;
}

function readAliyot(): any {
  return readJSON("aliyot.json");
}

function readParshiot(): any {
  return readJSON("parshiot.json");
}

function getAliyah(booknum: number, chapter: number, verse: number): Aliyah | null {
  return aliyot.find((aliyah) => aliyah.booknum === booknum + 1 && aliyah.chapter === chapter + 1 && aliyah.verse === verse + 1) || null;
}

function printParsha(booknum: number, chapter: number, verse: number): void {
  const aliyah = getAliyah(booknum, chapter, verse);
  if (aliyah?.aliyah === 1) {
    print(`<h2 id="parsha.${aliyah.parsha}">${aliyah.parsha}</h2>`);
    AliyotNames.forEach((aliyahName, aliyahIndex) => {
      aliyahIndex <= 7 && print(`<a href="#aliyah.${aliyah.parsha}.${aliyahIndex}">${aliyahName}</a>`);
    });
  }
}

function printAliyah(booknum: number, chapter: number, verse: number): void {
  const aliyah = getAliyah(booknum, chapter, verse);
  if (aliyah)
    print(`<h3 id="aliyah.${aliyah.parsha}.${aliyah.aliyah}">${AliyotNames[aliyah.aliyah]}${aliyah.aliyah2 ? " (" + AliyotNames[aliyah.aliyah2] + ")" : ""}</h3>`);
}

function printVerse(verseIndex: number, chumashVerse: string, perushVerse: string): void {
  const chumashSplit = chumashVerse.match(/^([\s\S]*?)(&nbsp;.*$|$)/);

  print(`<span class="verse">`);
  print(`<span class="verse-number">${gematriya(verseIndex + 1)}.</span>`);
  print(`<span class="chumash">${chumashSplit ? chumashSplit[1] : ""}</span>`);
  print(`<span class="perush">[${perushVerse}]</span>`);
  if (chumashSplit && chumashSplit[2])
    print(`<span class="chumash-trail">${chumashSplit[2]}</span>`);
  print(`</span>`);
}

function printChapter(booknum: number, chapterIndex: number, chumashChapter: Chapter, perushChapter: Chapter): void {
  chumashChapter.forEach((chumashVerse, verseIndex) => {
    printParsha(booknum, chapterIndex, verseIndex);
    printAliyah(booknum, chapterIndex, verseIndex);
    if (verseIndex === 0)
      print(`<span class="chapter">[פרק ${gematriya(chapterIndex + 1)}]</span>`);
    var perushVerse = perushChapter[verseIndex];
    printVerse(verseIndex, chumashVerse, perushVerse);
  });
}

function printBook(title: string, booknum: number, chumashChapters: Chapter[], perushChapters: Chapter[]): void {
  print(`<h1 id="book.${title}">${title}</h1>`);
  parshiot[booknum].forEach((parshaname) => {
    print(`<a href="#parsha.${parshaname}">${parshaname}</a>`);
  })
  chumashChapters.forEach((chumashChapter, chapterIndex) => {
    var perushChapter = perushChapters[chapterIndex];
    printChapter(booknum, chapterIndex, chumashChapter, perushChapter);
  })
}

function print(content: string, first?: boolean): void {
  if (first) {
    try {
      fs.mkdirSync(OutputFileDir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST')
        throw err;
    };
  };

  fs.writeFileSync(OutputFilePath, content + "\n", first ? {} : { flag: 'a' });
}

print('<!DOCTYPE html>', true);
print('<html>');
print('<head>');
print('<title>אחד מקרא אחד תרגום</title>');
print('<style>');
print(fs.readFileSync(path.join(__dirname, "src", "styles.css"), "utf-8"));
print('</style>');
print('</head>');
print('<body>');
print(`<div dir="rtl" lang="he">`);
const books = BookTitlesEnglish.map((book, index) => readBook(book, BookTitlesHebrew[index]));
books.forEach((book) => {
  print(`<a href="#book.${book.title}">${book.title}</a>`);
})
books.forEach((book, bookindex) => {
  printBook(book.title, bookindex, book.chumash, book.perush);
})
print(`</div>`);
print('</body>');
print('</html>');
