import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVa9WaHw4kfIdxUs_YmwbIZZdnZ5Y0WvM",
  authDomain: "manga-tacker.firebaseapp.com",
  databaseURL: "https://manga-tacker-default-rtdb.firebaseio.com",
  projectId: "manga-tacker",
  storageBucket: "manga-tacker.appspot.com",
  messagingSenderId: "843857141240",
  appId: "1:843857141240:web:7aa2381cd50ea16f8d4a0d",
  measurementId: "G-5KQM3MWW9Q"
};

// Firebase init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const mangaRef = ref(db, "manga");

const form = document.getElementById("manga-form");
const list = document.getElementById("manga-list");
const searchInput = document.getElementById("search-input");

let fullMangaList = []; // Cached entries

signInAnonymously(auth).then(() => {
  onValue(mangaRef, (snapshot) => {
    const data = snapshot.val();
    fullMangaList = [];

    for (let id in data) {
      fullMangaList.push({ id, ...data[id] });
    }

    renderMangaList(fullMangaList);
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("manga-name").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  if (!name || !chapter) return;

  await push(mangaRef, { name, chapter });
  form.reset();
});

searchInput.addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = fullMangaList.filter((item) =>
    item.name.toLowerCase().includes(keyword)
  );
  renderMangaList(filtered);
});

function renderMangaList(mangaArray) {
  list.innerHTML = "";

  // Sort alphabetically
  mangaArray.sort((a, b) => a.name.localeCompare(b.name));

  mangaArray.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.name}</strong> – Chapter ${item.chapter} 
      <button data-id="${item.id}" class="delete-btn">🗑 Delete</button>`;
    list.appendChild(li);
  });

  // Add delete button logic
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await remove(ref(db, `manga/${id}`));
    });
  });
}
