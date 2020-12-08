const video = document.getElementById("video");
let hold = document.getElementById("hold");
let mood = document.getElementById("mood");
let accurancy = document.getElementById("accurat");
let textMood = document.getElementById("textMood");
let closest;
let old;
let oldTime;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then(
      (stream) => (video.srcObject = stream),
      (err) => console.log(err)
    );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  let checkMood = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    if (detections[0]) {
      let expression = checkExpression(detections[0].expressions);
      if ((await expression).accuracy > 95) {
        if(old && old == await (await expression).expression){
          if((Date.now() -  oldTime) > 5000){
            //window.location = "/msgroom?room=" + old
            console.log("/msgroom?room=" + old)
          }
        }else{
          changeTheme(await expression);
        }
      }
    }
  }, 100);
});

async function checkExpression(expression) {
  let numbers = [
    expression.angry,
    expression.disgusted,
    expression.fearful,
    expression.happy,
    expression.neutral,
    expression.sad,
    expression.surprised,
  ];
  let expressions = [
    "angry",
    "disgusted",
    "fearful",
    "happy",
    "neutral",
    "sad",
    "surprised",
  ];

  closest = numbers.reduce((a, b) => {
    return Math.abs(b - 1) < Math.abs(a - 1) ? b : a;
  });

  let largest = numbers.findIndex(ifRight);
  let accurat = (numbers[largest] * 100).toFixed(1);
  return { expression: expressions[largest], accuracy: accurat };
}

function ifRight(input) {
  return closest == input;
}

function changeTheme(expression) {
  document.getElementById("loading").style = "display:none";
  loadCSS(expression.expression);
  setMoodTest(expression);
  old = expression.expression;
  oldTime = Date.now();
}

function setMoodTest(expression) {
  switch (expression.expression) {
    case "angry":
      textMood.innerText = "Why so mad bro?";
      break;
    case "disgusted":
      textMood.innerText = "What is so digusting bro?";
      break;
    case "fearful":
      textMood.innerText = "Why so scared bro?";
      break;
    case "happy":
      textMood.innerText = "Why so happy bro?";
      break;
    case "neutral":
      textMood.innerText = "";
      break;
    case "sad":
      textMood.innerText = "Why so sad bro?";
      break;
    case "surprised":
      textMood.innerText = "Oh Oh, McSurprisedSurprised";
      break;
    default:
      textMood.innerText = "";
      break;
  }
}

function loadCSS(theme) {
  let link = document.getElementById("customCSS");

  if (!link) {
    // Get HTML head element
    let head = document.getElementsByTagName("HEAD")[0];

    // Create new link Element
    link = document.createElement("link");

    // set the attributes for link element
    link.rel = "stylesheet";

    link.type = "text/css";

    link.id = "customCSS";

    // Append link element to HTML head
    head.appendChild(link);
  }

  link.href = `./themes/${theme}.css`;
}
