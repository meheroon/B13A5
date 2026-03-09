const allIssuesUrl = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const singleIssueUrl = "https://phi-lab-server.vercel.app/api/v1/lab/issue/";
const searchIssueUrl = "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";

const issuesContainer = document.getElementById("issuesContainer");
const issueCount = document.getElementById("issueCount");
const spinner = document.getElementById("spinner");
const emptyMessage = document.getElementById("emptyMessage");

const allBtn = document.getElementById("allBtn");
const openBtn = document.getElementById("openBtn");
const closedBtn = document.getElementById("closedBtn");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const logoutBtn = document.getElementById("logoutBtn");

const issueModal = document.getElementById("issueModal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalOverlay = document.getElementById("modalOverlay");

let allIssues = [];
let currentIssues = [];

function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    window.location.href = "./index.html";
  }
}

function showSpinner() {
  spinner.classList.remove("hidden");
}

function hideSpinner() {
  spinner.classList.add("hidden");
}

function setActiveTab(activeButton) {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((button) => button.classList.remove("active"));
  activeButton.classList.add("active");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function updateIssueCount(issues) {
  issueCount.textContent = `${issues.length} issues`;
}

function createLabels(labels) {
  if (!labels || labels.length === 0) {
    return `<span class="badge">No label</span>`;
  }

  return labels
    .map((label) => `<span class="badge">${label}</span>`)
    .join("");
}

function renderIssues(issues) {
  issuesContainer.innerHTML = "";
  updateIssueCount(issues);

  if (issues.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }

  emptyMessage.classList.add("hidden");

  issues.forEach((issue) => {
    const card = document.createElement("div");
    card.className = `issue-card ${issue.status.toLowerCase()}`;
    card.innerHTML = `
      <h3>${issue.title}</h3>
      <p>${issue.description.length > 100 ? issue.description.slice(0, 100) + "..." : issue.description}</p>
      <div class="issue-meta">
        <span><strong>Status:</strong> 
          <span class="${issue.status === "open" ? "badge status-badge-open" : "badge status-badge-closed"}">
            ${issue.status}
          </span>
        </span>
        <span><strong>Author:</strong> ${issue.author}</span>
        <span><strong>Priority:</strong> ${issue.priority}</span>
        <span><strong>Created:</strong> ${formatDate(issue.createdAt)}</span>
      </div>
      <div class="badge-row">
        ${createLabels(issue.labels)}
      </div>
    `;

    card.addEventListener("click", function () {
      loadSingleIssue(issue.id);
    });

    issuesContainer.appendChild(card);
  });
}

async function loadAllIssues() {
  try {
    showSpinner();
    const response = await fetch(allIssuesUrl);
    const result = await response.json();

    allIssues = result.data || [];
    currentIssues = [...allIssues];
    renderIssues(currentIssues);
  } catch (error) {
    issuesContainer.innerHTML = `<p class="empty-message">Failed to load issues.</p>`;
  } finally {
    hideSpinner();
  }
}

function filterIssuesByStatus(status) {
  if (status === "all") {
    currentIssues = [...allIssues];
  } else {
    currentIssues = allIssues.filter(
      (issue) => issue.status.toLowerCase() === status
    );
  }

  renderIssues(currentIssues);
}

async function handleSearch() {
  const searchText = searchInput.value.trim();

  if (searchText === "") {
    currentIssues = [...allIssues];
    renderIssues(currentIssues);
    return;
  }

  try {
    showSpinner();
    const response = await fetch(`${searchIssueUrl}${searchText}`);
    const result = await response.json();

    currentIssues = result.data || [];
    renderIssues(currentIssues);
  } catch (error) {
    issuesContainer.innerHTML = `<p class="empty-message">Search failed.</p>`;
  } finally {
    hideSpinner();
  }
}

async function loadSingleIssue(id) {
  try {
    showSpinner();
    const response = await fetch(`${singleIssueUrl}${id}`);
    const result = await response.json();
    const issue = result.data;

    showModal(issue);
  } catch (error) {
    alert("Failed to load issue details.");
  } finally {
    hideSpinner();
  }
}

function showModal(issue) {
  modalBody.innerHTML = `
    <h2 class="modal-title">${issue.title}</h2>
    <p class="modal-description">${issue.description}</p>

    <div class="badge-row" style="margin-bottom: 18px;">
      <span class="${issue.status === "open" ? "badge status-badge-open" : "badge status-badge-closed"}">${issue.status}</span>
      <span class="badge">${issue.priority}</span>
      ${createLabels(issue.labels)}
    </div>

    <div class="modal-grid">
      <div class="modal-info">
        <strong>Issue ID</strong>
        <span>${issue.id}</span>
      </div>

      <div class="modal-info">
        <strong>Author</strong>
        <span>${issue.author || "Not available"}</span>
      </div>

      <div class="modal-info">
        <strong>Assignee</strong>
        <span>${issue.assignee ? issue.assignee : "No assignee"}</span>
      </div>

      <div class="modal-info">
        <strong>Created At</strong>
        <span>${formatDate(issue.createdAt)}</span>
      </div>

      <div class="modal-info">
        <strong>Updated At</strong>
        <span>${formatDate(issue.updatedAt)}</span>
      </div>

      <div class="modal-info">
        <strong>Status</strong>
        <span>${issue.status}</span>
      </div>
    </div>
  `;

  issueModal.classList.remove("hidden");
}

function closeModal() {
  issueModal.classList.add("hidden");
}

function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  window.location.href = "./index.html";
}

allBtn.addEventListener("click", function () {
  setActiveTab(allBtn);
  filterIssuesByStatus("all");
});

openBtn.addEventListener("click", function () {
  setActiveTab(openBtn);
  filterIssuesByStatus("open");
});

closedBtn.addEventListener("click", function () {
  setActiveTab(closedBtn);
  filterIssuesByStatus("closed");
});

searchBtn.addEventListener("click", handleSearch);

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    handleSearch();
  }
});

closeModalBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);
logoutBtn.addEventListener("click", handleLogout);

checkAuth();
loadAllIssues();