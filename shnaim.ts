import * as fs from "fs";
import * as path from "path";
import gematriya from "gematriya";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exit } from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OutputFileDir = path.join(__dirname, "out");
const BookTitlesEnglish = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"];
const BookTitlesHebrew = ["בראשית", "שמות", "ויקרא", "במדבר", "דברים"];
const AliyotNames = ["", "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי"];

var parshiot: string[][] = readParshiot();
var aliyot: Aliyah[] = readAliyot();

type ChumashChapter = string[];
type PerushChapter = string[] | string[][];
type Book = {
  title: string;
  chumashtext: ChumashChapter[];
  perushtext: PerushChapter[];
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

const Perushim: Perush[] = [
  {
    perushname: "Onkelos",
    inputfilename: (bookname: string) => `Onkelos ${bookname} - he - Onkelos ${bookname}.json`,
    outputfilename: "אחד מקרא אחד תרגום"
  },
  {
    perushname: "Rashi",
    inputfilename: (bookname: string) => `Rashi on ${bookname} - he - merged.json`,
    outputfilename: 'אחד מקרא אחד רש״י'
  }
];

function readBook(perush: Perush, bookname: string, title: string): Book {
  const chumashtext = readChumash(bookname);
  const perushtext = readPerush(perush, bookname);
  return { title, chumashtext, perushtext };
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

function readPerush(perush: Perush, bookname: string): PerushChapter[] {
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

function printParsha(outputfilepath: string, booknum: number, chapter: number, verse: number): void {
  const aliyah = getAliyah(booknum, chapter, verse);
  if (aliyah?.aliyah === 1) {
    print(outputfilepath, `<h2 id="parsha.${aliyah.parsha}">${aliyah.parsha}</h2>`);
    AliyotNames.forEach((aliyahName, aliyahIndex) => {
      aliyahIndex <= 7 && print(outputfilepath, `<a href="#aliyah.${aliyah.parsha}.${aliyahIndex}">${aliyahName}</a>`);
    });
  }
}

function printAliyah(outputfilepath: string, booknum: number, chapter: number, verse: number): void {
  const aliyah = getAliyah(booknum, chapter, verse);
  if (aliyah)
    print(outputfilepath, `<h3 id="aliyah.${aliyah.parsha}.${aliyah.aliyah}">${AliyotNames[aliyah.aliyah]}${aliyah.aliyah2 ? " (" + AliyotNames[aliyah.aliyah2] + ")" : ""}</h3>`);
}

function printVerse(outputfilepath: string, verseIndex: number, chumashVerse: string, perushVerse: string | string[]): void {
  const chumashSplit = chumashVerse.match(/^([\s\S]*?)(&nbsp;.*$|$)/);

  print(outputfilepath, `<span class="verse">`);
  print(outputfilepath, `<span class="verse-number">${gematriya(verseIndex + 1)}.</span>`);
  print(outputfilepath, `<span class="chumash">${chumashSplit ? chumashSplit[1] : ""}</span>`);
  if (Array.isArray(perushVerse) && perushVerse.length > 0) {
    print(outputfilepath, `<span class="perush">[`);
    for (const perushPart of perushVerse)
      print(outputfilepath, perushPart);
    print(outputfilepath, `]</span>`);
  }
  else
    print(outputfilepath, `<span class="perush">[${perushVerse}]</span>`);
  if (chumashSplit && chumashSplit[2])
    print(outputfilepath, `<span class="chumash-trail">${chumashSplit[2]}</span>`);
  print(outputfilepath, `</span>`);
}

function printChapter(outputfilepath: string, booknum: number, chapterIndex: number, chumashChapter: ChumashChapter, perushChapter: PerushChapter): void {
  chumashChapter.forEach((chumashVerse, verseIndex) => {
    printParsha(outputfilepath, booknum, chapterIndex, verseIndex);
    printAliyah(outputfilepath, booknum, chapterIndex, verseIndex);
    if (verseIndex === 0)
      print(outputfilepath, `<span class="chapter">[פרק ${gematriya(chapterIndex + 1)}]</span>`);
    var perushVerse = perushChapter[verseIndex];
    printVerse(outputfilepath, verseIndex, chumashVerse, perushVerse);
  });
}

function printBook(outputfilepath: string, title: string, booknum: number, chumashChapters: ChumashChapter[], perushChapters: PerushChapter[]): void {
  print(outputfilepath, `<h1 id="book.${title}">${title}</h1>`);
  parshiot[booknum].forEach((parshaname) => {
    print(outputfilepath, `<a href="#parsha.${parshaname}">${parshaname}</a>`);
  })
  chumashChapters.forEach((chumashChapter, chapterIndex) => {
    var perushChapter = perushChapters[chapterIndex];
    printChapter(outputfilepath, booknum, chapterIndex, chumashChapter, perushChapter);
  })
}

function print(outputfilepath: string, content: string, first?: boolean): void {
  if (first) {
    try {
      fs.mkdirSync(OutputFileDir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST')
        throw err;
    };
  };

  fs.writeFileSync(outputfilepath, content + "\n", first ? {} : { flag: 'a' });
}

function printHtmlFile(perush: Perush): void {

  const outputfilepath = path.join(OutputFileDir, perush.outputfilename + ".html");

  print(outputfilepath, '<!DOCTYPE html>', true);
  print(outputfilepath, '<html>');
  print(outputfilepath, '<head>');
  print(outputfilepath, `<title>${perush.outputfilename}</title>`);
  print(outputfilepath, '<style>');
  print(outputfilepath, fs.readFileSync(path.join(__dirname, "src", "styles.css"), "utf-8"));
  print(outputfilepath, '</style>');
  print(outputfilepath, '</head>');
  print(outputfilepath, '<body>');
  print(outputfilepath, `<div dir="rtl" lang="he">`);
  print(outputfilepath, `<h1 id="top">${perush.outputfilename}</h1>`);
  const books = BookTitlesEnglish.map((book, index) => readBook(perush, book, BookTitlesHebrew[index]));
  books.forEach((book) => {
    print(outputfilepath, `<a href="#book.${book.title}">${book.title}</a>`);
  })
  books.forEach((book, bookindex) => {
    printBook(outputfilepath, book.title, bookindex, book.chumashtext, book.perushtext);
  })
  print(outputfilepath, `</div>`);
  print(outputfilepath, '</body>');
  print(outputfilepath, '</html>');
}

Perushim.forEach((perush) => {
  printHtmlFile(perush);
});
