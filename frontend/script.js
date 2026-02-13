const API_BASE = "http://127.0.0.1:8000";

const chatBox = document.getElementById("chatBox");

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Upload Resume
async function uploadResume() {
  const fileInput = document.getElementById("resumeFile");
  const status = document.getElementById("uploadStatus");

  if (!fileInput.files.length) {
    status.innerText = "❌ Please select a PDF";
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  const res = await fetch(`${API_BASE}/upload-resume/`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  status.innerText = "✅ Resume uploaded successfully";

  addMessage("Resume uploaded. Starting interview...", "bot");

  // Start interview
  startInterview();
}

// Start Interview
async function startInterview() {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "start" }),
  });

  const data = await res.json();
  addMessage(data.question, "bot");
}

// Send Answer
async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  const res = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();

  if (data.feedback) {
    addMessage(`Score: ${data.score}/10\n${data.feedback}`, "bot");
  }

  if (data.next_question) {
    addMessage(data.next_question, "bot");
  }
}

// Interview Summary
async function getSummary() {
  const res = await fetch(`${API_BASE}/interview-summary/`);
  const data = await res.json();

  addMessage("📊 Interview Summary:", "bot");
  addMessage(JSON.stringify(data, null, 2), "bot");
}
