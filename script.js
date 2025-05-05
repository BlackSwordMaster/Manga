import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  update,
  remove,
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

      renderMangaList(fullMangaList);
    });
  } else {
    fullMangaList = [];
    renderMangaList([]);
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
  const editId = form.getAttribute("data-edit-id");

  const name = nameInput.value.trim();
  const chapter = chapterInput.value.trim();
  if (!name || !chapter) return;

  if (editId) {
    await update(ref(db, `${mangaRef.path.pieces_.join('/')}/${editId}`), { name, chapter });
    form.removeAttribute("data-edit-id");
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
  renderMangaList(filtered);
});

function renderMangaList(mangaArray) {
  list.innerHTML = "";
  mangaArray.sort((a, b) => a.name.localeCompare(b.name));

  mangaArray.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.name}</strong> – Chapter ${item.chapter}
      <button data-id="${item.id}" class="edit-btn">✏️ Edit</button>
      <button data-id="${item.id}" class="delete-btn">🗑 Delete</button>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await remove(ref(db, `${mangaRef.path.pieces_.join('/')}/${id}`));
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const manga = fullMangaList.find((m) => m.id === id);
      document.getElementById("manga-name").value = manga.name;
      document.getElementById("chapter").value = manga.chapter;
      form.setAttribute("data-edit-id", id);
      form.querySelector("button").textContent = "Update Manga";
    });
  });
}
