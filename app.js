const API_BASE = "https://careerreadyai-backend.onrender.com";

// Helper: switch between screens
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Demo "account" stored entirely in localStorage (frontend-only fake login)

const USER_KEY = "careerReadyAI.demoUser";

function getDemoUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setDemoUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// LOGIN LOGIC (frontend-only)
const loginButton = document.getElementById("login-button");
const loginError = document.getElementById("login-error");
const forgotPasswordBtn = document.getElementById("forgot-password");

loginButton.addEventListener("click", () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const existingUser = getDemoUser();

  if (!email || !password) {
    loginError.textContent = "Please enter both email and password.";
    return;
  }

  // First time: "create" a local demo account
  if (!existingUser) {
    setDemoUser({
      email,
      password,
      createdAt: new Date().toISOString(),
    });
    loginError.textContent =
      "Demo account created. Enter 123456 on the next screen to finish sign-in.";
  } else if (existingUser.email !== email || existingUser.password !== password) {
    loginError.textContent = "Incorrect email or password for this demo account.";
    return;
  } else {
    loginError.textContent = "";
  }

  showScreen("screen-2fa");
});

// "Forgot password" is just a demo explanation
if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", () => {
    const email = document.getElementById("login-email").value.trim();
    const user = getDemoUser();

    if (!user || !email || email !== user.email) {
      loginError.textContent =
        "Demo reset: enter the same email you used when you first logged in.";
      return;
    }

    alert(
      `Demo only: in a real system we would email a reset link to ${email}. ` +
        "For this prototype, your password stays the same as you originally set. (${user.password})"
    );
  });
}

// 2FA LOGIC (dummy: correct code = 123456)

const verify2FAButton = document.getElementById("verify-2fa-button");
const twofaError = document.getElementById("twofa-error");
const backToLoginButton = document.getElementById("back-to-login-button");

verify2FAButton.addEventListener("click", () => {
  const code = document.getElementById("code-2fa").value.trim();
  if (code === "123456") {
    twofaError.textContent = "";
    showScreen("screen-resume");
  } else {
    twofaError.textContent = "Invalid code. Use 123456 for the demo.";
  }
});

backToLoginButton.addEventListener("click", () => {
  showScreen("screen-login");
});

// LOGOUT
document.getElementById("logout-button").addEventListener("click", () => {
  document.getElementById("login-email").value = "";
  document.getElementById("login-password").value = "";
  document.getElementById("code-2fa").value = "";

  // Clear resume + feedback UI
  const resumeInput = document.getElementById("resume-text");
  if (resumeInput) resumeInput.value = "";
  const resumeError = document.getElementById("resume-error");
  if (resumeError) resumeError.textContent = "";
  const feedbackContainer = document.getElementById("feedback-container");
  if (feedbackContainer) feedbackContainer.classList.add("hidden");
  const feedbackText = document.getElementById("feedback-text");
  if (feedbackText) feedbackText.innerHTML = "";

  showScreen("screen-login");
});


// LOGOUT
document.getElementById("logout-button").addEventListener("click", () => {
  document.getElementById("login-email").value = "";
  document.getElementById("login-password").value = "";
  document.getElementById("code-2fa").value = "";

  resumeTextInput.value = "";
  resumeError.textContent = "";
  feedbackText.innerHTML = "";
  feedbackContainer.classList.add("hidden");

  showScreen("screen-login");
});

// AI FEEDBACK
const aiButton = document.getElementById("ai-feedback-button");
const feedbackContainer = document.getElementById("feedback-container");
const feedbackText = document.getElementById("feedback-text");
const resumeTextInput = document.getElementById("resume-text");
const resumeError = document.getElementById("resume-error");

// AI FEEDBACK (real GPT via backend)
aiButton.addEventListener("click", async () => {
  const resumeText = resumeTextInput.value.trim();

  if (!resumeText) {
    resumeError.textContent =
      "Please paste your resume text before requesting feedback.";
    return;
  }

  resumeError.textContent = "";
  aiButton.disabled = true;
  aiButton.textContent = "Asking AI...";

  try {
    const resp = await fetch(`${API_BASE}/api/resume-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "pasted_resume.txt",
        text: resumeText,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || "Request failed.");
    }

    feedbackText.innerHTML = data.feedbackHtml;
    feedbackContainer.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    resumeError.textContent =
      "Sorry, AI feedback failed. " + (err.message || "");
  } finally {
    aiButton.disabled = false;
    aiButton.textContent = "Get AI Feedback";
  }
});

// OPEN STUDY & SCHEDULE TOOLS (button)
const openIntakeButton = document.getElementById("open-intake-button");

if (openIntakeButton) {
  openIntakeButton.addEventListener("click", () => {
    showScreen("screen-intake");
  });
}

// BACK from Study & Schedule Setup → Resume screen
const backToResumeButton = document.getElementById("back-to-resume");
if (backToResumeButton) {
  backToResumeButton.addEventListener("click", () => {
    showScreen("screen-resume");
  });
}


// Initialize: show login screen
showScreen("screen-login");