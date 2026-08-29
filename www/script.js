const STORAGE_KEY = "keep_notes_acode_v1";
const THEME_KEY = "keep_notes_theme";

let notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentId = null;
let currentFilter = "all";

const notesEl = document.getElementById("notes");
const emptyEl = document.getElementById("empty");
const editor = document.getElementById("editor");
const titleInput = document.getElementById("titleInput");
const bodyInput = document.getElementById("bodyInput");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const checklistArea = document.getElementById("checklistArea");
const colors = document.getElementById("colors");

const colorMap = {
  default: "",
  yellow: "#fff8b8",
  green: "#d7f5dc",
  blue: "#d9efff",
  purple: "#eadcff",
  pink: "#ffdbe8"
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(ts) {
  return new Date(ts).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getVisibleNotes() {
  const query = searchInput.value.trim().toLowerCase();

  return notes.filter(note => {
    if (currentFilter === "pinned" && !note.pinned) return false;
    if (currentFilter === "checklist" && !note.checklist) return false;
    if (currentFilter === "trash" && !note.deleted) return false;
    if (currentFilter !== "trash" && note.deleted) return false;

    if (!query) return true;

    return (
      (note.title || "").toLowerCase().includes(query) ||
      (note.body || "").toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return b.updated - a.updated;
  });
}

function render() {
  const visible = getVisibleNotes();
  notesEl.innerHTML = "";

  visible.forEach(note => {
    const card = document.createElement("article");
    card.className = "note" + (note.pinned ? " pinned" : "");
    if (note.color && colorMap[note.color]) {
      card.style.background = colorMap[note.color];
    }

    const title = document.createElement("div");
    title.className = "note-title";
    title.textContent = note.title || "Untitled note";

    const body = document.createElement("div");
    body.className = "note-body";
    body.textContent = note.body || "";

    card.appendChild(title);
    if (note.pinned) {
      const pin = document.createElement("span");
      pin.className = "pin-mark";
      pin.textContent = "📌";
      card.appendChild(pin);
    }
    card.appendChild(body);

    if (note.checklist && note.items?.length) {
      note.items.forEach(item => {
        const line = document.createElement("div");
        line.className = "note-body";
        line.style.marginTop = "5px";
        line.textContent = `${item.done ? "☑" : "☐"} ${item.text}`;
        card.appendChild(line);
      });
    }

    const footer = document.createElement("div");
    footer.className = "note-footer";
    footer.textContent = formatDate(note.updated);
    card.appendChild(footer);

    card.addEventListener("click", () => openEditor(note.id));
    notesEl.appendChild(card);
  });

  emptyEl.style.display = visible.length ? "none" : "block";
  save();
}

function openEditor(id = null) {
  currentId = id;
  colors.classList.add("hidden");

  if (id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    titleInput.value = note.title || "";
    bodyInput.value = note.body || "";
    checklistArea.classList.toggle("hidden", !note.checklist);
    renderChecklist(note);
  } else {
    titleInput.value = "";
    bodyInput.value = "";
    checklistArea.classList.add("hidden");
    checklistArea.innerHTML = "";
  }

  editor.classList.remove("hidden");
  setTimeout(() => titleInput.focus(), 50);
}

function closeEditor() {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (currentId) {
    const note = notes.find(n => n.id === currentId);
    if (note) {
      note.title = title;
      note.body = body;
      note.updated = Date.now();
      if (note.checklist) collectChecklist(note);
    }
  } else if (title || body) {
    notes.push({
      id: uid(),
      title,
      body,
      color: "default",
      pinned: false,
      checklist: false,
      items: [],
      deleted: false,
      created: Date.now(),
      updated: Date.now()
    });
  }

  editor.classList.add("hidden");
  currentId = null;
  save();
  render();
}

function renderChecklist(note) {
  checklistArea.innerHTML = "";

  (note.items || []).forEach((item, index) => {
    addChecklistRow(item.text, item.done, index);
  });

  addChecklistRow("", false, (note.items || []).length);
}

function addChecklistRow(text = "", done = false, index = 0) {
  const row = document.createElement("div");
  row.className = "check-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = done;

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "List item";
  input.value = text;

  row.appendChild(checkbox);
  row.appendChild(input);
  checklistArea.appendChild(row);
}

function collectChecklist(note) {
  const rows = checklistArea.querySelectorAll(".check-item");
  note.items = [];

  rows.forEach(row => {
    const input = row.querySelector('input[type="text"]');
    const checkbox = row.querySelector('input[type="checkbox"]');

    if (input.value.trim()) {
      note.items.push({
        text: input.value.trim(),
        done: checkbox.checked
      });
    }
  });
}

document.getElementById("addBtn").addEventListener("click", () => openEditor());

document.getElementById("closeBtn").addEventListener("click", closeEditor);

editor.addEventListener("click", e => {
  if (e.target === editor) closeEditor();
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  if (!currentId) return;

  const note = notes.find(n => n.id === currentId);
  if (!note) return;

  if (note.deleted) {
    notes = notes.filter(n => n.id !== currentId);
  } else {
    note.deleted = true;
    note.updated = Date.now();
  }

  editor.classList.add("hidden");
  currentId = null;
  save();
  render();
});

document.getElementById("pinBtn").addEventListener("click", () => {
  if (!currentId) return;

  const note = notes.find(n => n.id === currentId);
  if (!note) return;

  note.pinned = !note.pinned;
  note.updated = Date.now();
  save();
  render();
});

document.getElementById("colorBtn").addEventListener("click", () => {
  colors.classList.toggle("hidden");
});

colors.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!currentId) return;
    const note = notes.find(n => n.id === currentId);
    if (!note) return;

    note.color = btn.dataset.color;
    note.updated = Date.now();
    colors.classList.add("hidden");
    save();
    render();
  });
});

document.getElementById("checkBtn").addEventListener("click", () => {
  if (!currentId) {
    notes.push({
      id: uid(),
      title: titleInput.value.trim(),
      body: bodyInput.value.trim(),
      color: "default",
      pinned: false,
      checklist: true,
      items: [],
      deleted: false,
      created: Date.now(),
      updated: Date.now()
    });
    currentId = notes[notes.length - 1].id;
  }

  const note = notes.find(n => n.id === currentId);
  note.checklist = !note.checklist;
  note.updated = Date.now();

  checklistArea.classList.toggle("hidden", !note.checklist);
  if (note.checklist) renderChecklist(note);
  save();
  render();
});

document.getElementById("searchBtn").addEventListener("click", () => {
  searchBar.classList.toggle("hidden");
  if (!searchBar.classList.contains("hidden")) searchInput.focus();
});

searchInput.addEventListener("input", render);

document.getElementById("menuBtn").addEventListener("click", () => {
  drawer.classList.add("open");
  overlay.classList.remove("hidden");
});

overlay.addEventListener("click", () => {
  drawer.classList.remove("open");
  overlay.classList.add("hidden");
});

document.querySelectorAll(".drawer-item").forEach(item => {
  item.addEventListener("click", () => {
    currentFilter = item.dataset.filter;
    document.querySelectorAll(".drawer-item").forEach(x => x.classList.remove("active"));
    item.classList.add("active");
    drawer.classList.remove("open");
    overlay.classList.add("hidden");
    render();
  });
});

document.getElementById("darkBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
});

if (localStorage.getItem(THEME_KEY) === "dark") {
  document.body.classList.add("dark");
}

render();
