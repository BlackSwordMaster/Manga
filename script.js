import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";

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

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
    startApp();
  })
  .catch(error => {
    console.error("Authentication error:", error);
  });

function startApp() {
  const mangaRef = ref(db, 'manga');
  const form = document.getElementById('manga-form');
  const list = document.getElementById('manga-list');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('manga-name').value.trim();
    const chapter = document.getElementById('chapter').value.trim();
    if (!name || !chapter) return;
    await push(mangaRef, { name, chapter });
    form.reset();
  });

  onValue(mangaRef, (snapshot) => {
    list.innerHTML = '';
    const data = snapshot.val();
    for (let id in data) {
      const li = document.createElement('li');
      li.textContent = `${data[id].name} - Chapter ${data[id].chapter}`;
      list.appendChild(li);
    }
  });
}