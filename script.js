// ---------------- TIME ----------------
const timeStr = document.querySelector("#lockTime");
const dateStr = document.querySelector("#lockDate");
const descTime = document.querySelector("#desktopTime");

function updateTime() {
  const now = new Date();

  if (timeStr) timeStr.innerHTML = now.toLocaleTimeString();
  if (descTime) descTime.innerHTML = now.toLocaleTimeString();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (dateStr) {
    dateStr.innerHTML = new Intl.DateTimeFormat("en-US", options).format(now);
  }
}

updateTime();
setInterval(updateTime, 1000);

// ---------------- LOCK SCREEN ----------------
const lockScreen = document.querySelector(".lockScreen");
const desktop = document.querySelector(".desktop");

function unlockScreen() {
  if (!lockScreen) return;

  lockScreen.style.transform = "translateY(-100%)";
  lockScreen.style.opacity = "0";

  setTimeout(() => {
    lockScreen.style.display = "none";
  }, 400);

  if (desktop) desktop.style.display = "flex";
}

if (lockScreen) {
  lockScreen.addEventListener("click", unlockScreen);
}

// ---------------- APPS REGISTRY ----------------
const apps = {
  notepad: {
    title: "Notepad",
    icon: "📝",
    width: 420,
    height: 300,
    content: `
      <textarea 
      style="width:100%;height:100%;background:#111;color:#fff;border:none;resize:none"
      placeholder="Start typing..."></textarea>
    `,
  },
};

// ---------------- CREATE DESKTOP ICONS ----------------
const IconCon = document.querySelector(".desktopIcons");

if (IconCon) {
  for (const appId in apps) {
    const app = apps[appId];

    const icon = document.createElement("div");
    icon.className = "icon";
    icon.dataset.app = appId;

    icon.innerHTML = `
      <div class="iconImage">${app.icon}</div>
      <div class="iconLabel">${app.title}</div>
    `;

    IconCon.appendChild(icon);
  }
}

// ---------------- WINDOW SYSTEM ----------------
const windowContainer = document.querySelector(".windowContainer");

let zIndexCounter = 1000;

function openApp(appId) {
  const app = apps[appId];
  if (!app || !windowContainer) return;

  const win = document.createElement("div");
  win.className = "window";

  win.style.width = app.width + "px";
  win.style.height = app.height + "px";
  win.style.left = "120px";
  win.style.top = "120px";
  win.style.zIndex = ++zIndexCounter;

  win.innerHTML = `
    <div class="actionBar">
      <span class="title">${app.title}</span>
      <ul class="actions">
        <li class="maximize">□</li>
        <li class="closeWindow">×</li>
      </ul>
    </div>

    <div class="content">
      ${app.content}
    </div>
  `;

  // close
  win.querySelector(".closeWindow").onclick = () => win.remove();

  // maximize
  win.querySelector(".maximize").onclick = () => {
    if (win.classList.contains("maximized")) {
      win.style.width = app.width + "px";
      win.style.height = app.height + "px";
      win.classList.remove("maximized");
    } else {
      win.style.width = "100vw";
      win.style.height = "100vh";
      win.style.left = "0";
      win.style.top = "52px";
      win.classList.add("maximized");
    }
  };

  // focus
  win.addEventListener("mousedown", () => {
    win.style.zIndex = ++zIndexCounter;
  });

  // dragging
  const bar = win.querySelector(".actionBar");

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener("mousedown", (e) => {
    isDragging = true;

    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  windowContainer.appendChild(win);
}

// open / close about screen
const logo = document.querySelector(".osLogo");
const closeBtn = document.querySelector(".about .content .close");
const about = document.querySelector(".about");
if (logo) {
  logo.addEventListener("click", () => {
    if (about) about.style.display = "flex";
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    if (about) about.style.display = "none";
  });
}
 
// ---------------- PROMPT COMMAND SYSTEM ----------------

const promptInput = document.querySelector(".promptBox textarea");

const commandWords = ["open", "launch", "start", "run", "ope", "opn"];

function normalizeCommand(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "");
}

function findAppFromText(text) {
  const words = text.split(" ");

  for (const appId in apps) {
    const app = apps[appId];

    const titleWords = app.title.toLowerCase().split(" ");

    for (const word of words) {
      if (titleWords.includes(word) || appId.includes(word)) {
        return appId;
      }
    }
  }

  return null;
}

const responseOverlay = document.getElementById("responseOverlay");
const responseBody = document.getElementById("responseBody");
const responseClose = document.getElementById("responseClose");

// ai respnse show
function showAIResponse(message, autoClose = true) {
  if (!responseOverlay || !responseBody) return;

  responseOverlay.style.display = "flex";

  responseBody.innerHTML = message;

  if (autoClose) {
    setTimeout(() => {
      responseOverlay.style.display = "none";
    }, 2000);
  }
}
// handle prmpt
function handlePromptInput(input) {
  const text = normalizeCommand(input);

  if (!text) {
    showAIResponse("⚠️ Please enter a command or instruction.");
    return;
  }

  const words = text.split(" ");

  const hasCommand = commandWords.some((word) => words.includes(word));

  if (!hasCommand) {
    showAIResponse("⚠️ Command not recognized");
    return;
  }

  const appId = findAppFromText(text);

  if (appId) {
    const app = apps[appId];

    showAIResponse("Opening <b>" + app.title + "</b>...");

    setTimeout(() => {
      openApp(appId);
    }, 600);
  } else {
    const availableApps = Object.values(apps).map(app => app.title).join(', ');
    showAIResponse(`❌ App not found. Try opening one of these: ${availableApps}`);
  }
}

//  handle prompt 

// when click button 

const sendBtn = document.querySelector('.promptBtnSend');

sendBtn.addEventListener('click',()=>{
  const command = promptInput.value;

  promptInput.value = "";

  handlePromptInput(command);
})

// when press eneter key
if (promptInput) {
  promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const command = promptInput.value;

      promptInput.value = "";

      handlePromptInput(command);
    }
  });
}
