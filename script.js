import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVa9WaHw4kfIdxUs_YmwbIZZdnZ5Y0WvM",
  authDomain: "manga-tacker.firebaseapp.com",
  databaseURL: "https://manga-tacker-default-rtdb.firebaseio.com",
  projectId: "manga-tacker",
  storageBucket: "manga-tacker.appspot.com",
  messagingSenderId: "843857141240",
  appId: "1:843857141240:web:7aa2381cd50ea16f8d4a0d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const form = document.getElementById("manga-form");
const list = document.getElementById("manga-list");
const searchInput = document.getElementById("search-input");

let fullMangaList = [];
let mangaRef = null;

loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    mangaRef = ref(db, `users/${userId}/manga`);

    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    form.style.display = "block";
    searchInput.style.display = "block";

    onValue(mangaRef, (snapshot) => {
      const data = snapshot.val();
      fullMangaList = [];

      for (let id in data) {
        fullMangaList.push({ id, ...data[id] });
      }

      renderMangaList(fullMangaList, userId);
    });
  } else {
    fullMangaList = [];
    renderMangaList([], null);
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    form.style.display = "none";
    searchInput.style.display = "none";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("manga-name");
  const chapterInput = document.getElementById("chapter");
  const editPath = form.getAttribute("data-edit-path");

  const name = nameInput.value.trim();
  const chapter = chapterInput.value.trim();
  if (!name || !chapter) return;

  if (editPath) {
    await update(ref(db, editPath), { name, chapter });
    form.removeAttribute("data-edit-path");
    form.querySelector("button").textContent = "Add Manga";
  } else {
    await push(mangaRef, { name, chapter });
  }

  form.reset();
});

searchInput.addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = fullMangaList.filter((item) =>
    item.name.toLowerCase().includes(keyword)
  );
  renderMangaList(filtered, auth.currentUser?.uid);
});

function renderMangaList(mangaArray, userId) {
  list.innerHTML = "";
  mangaArray.sort((a, b) => a.name.localeCompare(b.name));

  // Update manga count
  const countText = document.getElementById("manga-count");
  const countValue = document.getElementById("count");
  if (mangaArray.length > 0) {
    countText.style.display = "block";
    countValue.textContent = mangaArray.length;
  } else {
    countText.style.display = "none";
  }

  mangaArray.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.name}</strong> – Chapter ${item.chapter}
      <button data-id="${item.id}" class="edit-btn">✏️ Edit</button>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const manga = fullMangaList.find((m) => m.id === id);
      document.getElementById("manga-name").value = manga.name;
      document.getElementById("chapter").value = manga.chapter;
      form.setAttribute("data-edit-path", `users/${userId}/manga/${id}`);
      form.querySelector("button").textContent = "Update Manga";
    });
  });
}