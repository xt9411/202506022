// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

let circleX = 320; // 圓的初始 X 座標
let circleY = 240; // 圓的初始 Y 座標
const circleRadius = 50; // 圓的半徑

let isDragging = false; // 判斷是否正在拖曳圓
let trail = []; // 儲存圓的軌跡

const options = ["2D繪圖", "3D動畫", "教學原理", "程式設計", "影像編輯"];
let circles; // 提前宣告 circles 變數

let score = 0; // 記分板分數
let gameOver = false; // 遊戲結束狀態
let touchedCircles = new Set(); // 記錄已被綠色圓圈碰觸的圓

let isGameStarted = false; // 判斷遊戲是否開始
const button = { x: 320, y: 240, width: 150, height: 50, label: "開始" };

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 確保 random 函數可用，並初始化 circles
  circles = options.map((option, index) => ({
    x: random(50, width - 50),
    y: random(50, height - 50),
    radius: 50,
    vx: random(-1, 1),
    vy: random(-1, 1),
    label: option,
  }));

  // 新增 "統計學" 和 "核物理學" 圓形
  circles.push(
    {
      x: random(50, width - 50),
      y: random(50, height - 50),
      radius: 50,
      vx: random(-1, 1),
      vy: random(-1, 1),
      label: "統計學",
    },
    {
      x: random(50, width - 50),
      y: random(50, height - 50),
      radius: 50,
      vx: random(-1, 1),
      vy: random(-1, 1),
      label: "物理學",
    }
  );

  // Start detecting hands
  try {
    handPose.detectStart(video, gotHands);
  } catch (error) {
    console.error("HandPose initialization failed:", error);
  }
}

function draw() {
  if (!isGameStarted) {
    // 顯示半透明遮罩
    fill(0, 0, 0, 150); // 半透明黑色
    rect(0, 0, width, height);

    // 顯示按鈕
    fill(255); // 白色
    rectMode(CENTER);
    rect(button.x, button.y, button.width, button.height, 10); // 圓角矩形
    fill(0); // 黑色文字
    textAlign(CENTER, CENTER);
    textSize(20);
    text(button.label, button.x, button.y);

    // 檢查是否有手指觸碰到按鈕
    if (hands.length > 0) {
      for (let hand of hands) {
        if (hand.confidence > 0.1) {
          let indexFinger = hand.keypoints[8]; // 食指
          if (
            indexFinger.x > button.x - button.width / 2 &&
            indexFinger.x < button.x + button.width / 2 &&
            indexFinger.y > button.y - button.height / 2 &&
            indexFinger.y < button.y + button.height / 2
          ) {
            isGameStarted = true; // 開始遊戲
          }
        }
      }
    }
    return; // 暫停遊戲功能
  }

  if (gameOver) {
    // 遊戲結束畫面
    background(0); // 黑色背景
    fill(255); // 白色文字
    textAlign(CENTER, CENTER);
    textSize(32);
    text(`分數: ${score}`, width / 2, height / 2);
    return;
  }

  // 繪製攝影機影像作為背景
  image(video, 0, 0);

  // 顯示左上角文字
  fill(255); // 白色
  textAlign(LEFT, TOP);
  textSize(16);
  text("TKUET\n請選擇是教科系學科的項目", 10, 10);

  // 顯示右上角計分板
  textAlign(RIGHT, TOP);
  textSize(16);
  text(`分數: ${score}`, width - 10, 10);

  // 繪製軌跡
  noFill();
  stroke(0, 0, 255); // 藍色
  strokeWeight(2);
  beginShape();
  for (let pos of trail) {
    vertex(pos.x, pos.y);
  }
  endShape();

  // 繪製綠色圓
  fill(0, 255, 0); // 綠色
  noStroke();
  ellipse(circleX, circleY, circleRadius * 2, circleRadius * 2);

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    let isTouching = false;

    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 檢查食指 (keypoints[8]) 是否接觸到圓
        let indexFinger = hand.keypoints[8];
        let distance = dist(indexFinger.x, indexFinger.y, circleX, circleY);

        if (distance < circleRadius) {
          // 如果接觸到，讓圓的位置跟隨食指移動
          circleX = indexFinger.x;
          circleY = indexFinger.y;

          // 新增圓的位置到軌跡
          trail.push({ x: circleX, y: circleY });

          isTouching = true;
        }
      }
    }

    // 更新拖曳狀態
    isDragging = isTouching;
  }

  // 如果手指離開圓，停止新增軌跡
  if (!isDragging && trail.length > 0) {
    trail = trail.slice(0); // 保留現有軌跡
  }

  // 繪製並移動選項圓形
  for (let i = circles.length - 1; i >= 0; i--) {
    let circle = circles[i];

    // 更新圓的位置
    circle.x += circle.vx;
    circle.y += circle.vy;

    // 碰到邊框反彈
    if (circle.x - circle.radius < 0 || circle.x + circle.radius > width) {
      circle.vx *= -1;
    }
    if (circle.y - circle.radius < 0 || circle.y + circle.radius > height) {
      circle.vy *= -1;
    }

    // 檢查是否與綠色圓重疊
    let distance = dist(circle.x, circle.y, circleX, circleY);
    if (distance < circle.radius + circleRadius) {
      // 根據圓的文字更新分數
      if (["2D繪圖", "3D動畫", "教學原理", "程式設計", "影像編輯"].includes(circle.label)) {
        if (!touchedCircles.has(circle.label)) {
          score = min(score + 1, 5); // 分數最高為 5
          touchedCircles.add(circle.label);
        }
      } else if (["統計學", "物理學"].includes(circle.label)) {
        score = max(score - 2, 0); // 分數最低為 0
      }

      // 移除圓
      circles.splice(i, 1);
      continue;
    }

    // 繪製圓形
    fill(255, 0, 0); // 紅色
    noStroke();
    ellipse(circle.x, circle.y, circle.radius * 2, circle.radius * 2);

    // 顯示選項文字
    fill(255); // 白色
    textAlign(CENTER, CENTER);
    textSize(14);
    text(circle.label, circle.x, circle.y);
  }

  // 檢查遊戲結束條件
  if (touchedCircles.size === 5) {
    gameOver = true;
  }
}