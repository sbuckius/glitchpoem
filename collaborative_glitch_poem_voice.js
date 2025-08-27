let input1, input2, input3, submitButton, resetButton, downloadButton, speakButton;
let userLines = [];
let poem = "";
let db;
let hasSpokenPoem = false;
let scrollY = 0;
let maxScroll = 0;
let scrollSpeed = 2;

function setup() {
  createCanvas(800, 600);
  textAlign(LEFT, TOP);
  textSize(18);

  // Firebase setup
 const firebaseConfig = {

  apiKey: "AIzaSyAZ5MHtr6L_fKOkqM4P4NbLOitzT3jtxTI",

  authDomain: "glitchpoem-f4b78.firebaseapp.com",

  projectId: "glitchpoem-f4b78",

  storageBucket: "glitchpoem-f4b78.firebasestorage.app",

  messagingSenderId: "505391583548",

  appId: "1:505391583548:web:673ed8982f22c68df5ce39",

  measurementId: "G-T01DMQ08FZ"

};

  firebase.initializeApp(firebaseConfig);
  db = firebase.database();

  db.ref("poemLines").on("value", gotData, showErr);

  // Inputs
  input1 = createInput().attribute("placeholder", "First word");
  input1.position(100, 80);
  input2 = createInput().attribute("placeholder", "Second word");
  input2.position(250, 80);
  input3 = createInput().attribute("placeholder", "Third word");
  input3.position(400, 80);

  submitButton = createButton("Add to Poem");
  submitButton.position(580, 80);
  submitButton.mousePressed(submitWords);

  resetButton = createButton("🔄 Reset Poem");
  resetButton.position(580, 120);
  resetButton.mousePressed(resetPoem);

  downloadButton = createButton("💾 Download Poem");
  downloadButton.position(580, 140);
  downloadButton.mousePressed(downloadPoem);

  speakButton = createButton("🔊 Read Aloud");
  speakButton.position(580, 170);
  speakButton.mousePressed(() => speakPoem(userLines.join(", ")));
}

function draw() {
  background(245);

  fill(20);
  textSize(22);
  textAlign(CENTER);
  text("You + Glitches", width / 2, 40);

  textSize(10);
  textAlign(LEFT);
  text("Type three phrases about glitches including:", width / 8, 120);
text("1) an example of when you encounter them ", width / 8, 130);
  text("2) how they make you feel", width / 8, 140);
  text("3) a word to describe them.", width / 8, 150);
  drawPoemBox();
}

function submitWords() {
  let w1 = input1.value().trim();
  let w2 = input2.value().trim();
  let w3 = input3.value().trim();
  if (w1 && w2 && w3) {
    let phrase = `${w1} ${w2} ${w3}`;
    db.ref("poemLines").push(phrase);
    input1.value('');
    input2.value('');
    input3.value('');
  }
}

function resetPoem() {
  if (confirm("Reset the poem for everyone?")) {
    db.ref("poemLines").remove();
    userLines = [];
    poem = "";
    hasSpokenPoem = false;
    scrollY = 0;
  }
}

function gotData(data) {
  let entries = data.val();
  if (!entries) {
    userLines = [];
    poem = "";
    return;
  }

  userLines = Object.values(entries);
  updatePoem();
}

function updatePoem() {
  poem = "";
  for (let i = 0; i < userLines.length; i++) {
    poem += userLines[i] + ((i + 1) % 3 === 0 ? "\n" : ", ");
  }

  if (userLines.length >= 24 && !hasSpokenPoem) {
    speakPoem(userLines.join(", "));
    hasSpokenPoem = true;
  }
}

function speakPoem(text) {
  speechSynthesis.cancel(); // Stop any ongoing speech

  let speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.9;
  speech.pitch = 1.1;
  speech.lang = "en-US";

  // Wait for voices to be loaded
  let setVoice = () => {
    let voices = speechSynthesis.getVoices();
    let preferred = voices.find(v => v.name.includes("Google") || v.lang === "en-US");
    if (preferred) speech.voice = preferred;
    speechSynthesis.speak(speech);
  };

  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = setVoice;
  } else {
    setVoice();
  }
}

function drawPoemBox() {
  let boxX = 80;
  let boxY = 160;
  let boxW = width - 160;
  let boxH = height - 200;

  fill(255);
  stroke(200);
  rect(boxX, boxY, boxW, boxH);

  fill(30);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(18);
  textLeading(30);

  let lines = poem.split("\n");
  let lineHeight = textAscent() + textDescent() + 10;
  maxScroll = max(0, lines.length * lineHeight - boxH);

  push();
  translate(boxX + 10, boxY + 10);
  let yOffset = -scrollY;
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], 0, yOffset);
    yOffset += lineHeight;
  }
  pop();

  if (keyIsDown(DOWN_ARROW)) scrollY = min(scrollY + scrollSpeed, maxScroll);
  if (keyIsDown(UP_ARROW)) scrollY = max(scrollY - scrollSpeed, 0);
}

function showErr(err) {
  console.error("Firebase error:", err);
}

function downloadPoem() {
  if (!poem.trim()) {
    alert("There's no poem to download yet!");
    return;
  }

  let blob = new Blob([poem], { type: "text/plain" });
  let url = URL.createObjectURL(blob);
  let link = createA(url, "poem.txt");
  link.attribute("download", "collaborative_poem.txt");
  link.hide();
  link.elt.click();
  URL.revokeObjectURL(url);
}
