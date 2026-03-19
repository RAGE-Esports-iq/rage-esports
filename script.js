import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDo0jp7N7wzNXKM81sELGmUhA9QePDOL7g",
    authDomain: "rageesports-iq.firebaseapp.com",
    projectId: "rageesports-iq",
    storageBucket: "rageesports-iq.firebasestorage.app",
    messagingSenderId: "287821557091",
    appId: "1:287821557091:web:fd497c7ab12bc3af9e7756"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// FIXED: YouTube Link Parser to avoid "Refused to connect"
function youtubeParser(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? `https://www.youtube.com/embed/${match[7]}` : url;
}

window.showRoleFields = function() {
    const r = document.getElementById('role-select').value;
    document.querySelectorAll('.dynamic-fields').forEach(d => d.style.display = 'none');
    if(r) {
        const target = document.getElementById(`fields-${r}`);
        if(target) target.style.display = 'block';
    }
}

let isEnglish = false;
window.toggleLang = function() {
    isEnglish = !isEnglish;
    const btn = document.querySelector('.lang-btn');
    btn.innerText = isEnglish ? "AR" : "EN";
    document.documentElement.lang = isEnglish ? "en" : "ar";
    document.documentElement.dir = isEnglish ? "ltr" : "rtl";
    document.getElementById('lnk-home').innerText = isEnglish ? "Home" : "الرئيسية";
    document.getElementById('lnk-teams').innerText = isEnglish ? "Teams" : "الفرق";
    document.getElementById('lnk-gallery').innerText = isEnglish ? "Gallery" : "المعرض";
    document.getElementById('lnk-join').innerText = isEnglish ? "Join Us" : "انضم لنا";
    document.getElementById('hero-title').innerText = isEnglish ? "WE ARE RAGE" : "نحن ريج";
    document.getElementById('hero-desc').innerText = isEnglish ? "Creating Glory, Breaking Limits." : "نصنع المجد، نحطم القيود.";
    document.getElementById('teams-title').innerText = isEnglish ? "Official Teams" : "الفرق الرسمية";
    document.getElementById('join-title').innerText = isEnglish ? "Recruitment Form" : "تقديم طلب انضمام";
}

window.togglePlayers = function(id) {
    const el = document.getElementById(`players-${id}`);
    const all = document.querySelectorAll('.players-container');
    all.forEach(c => { if(c.id !== `players-${id}`) c.style.display = 'none'; });
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

onValue(ref(db, 'siteData'), (snap) => {
    const data = snap.val() || {};
    document.getElementById('ticker-text').innerText = data.currentNews || "RAGE ON TOP";
    document.getElementById('db-cups').innerText = data.stats?.cups || "0";
    document.getElementById('db-members').innerText = "+" + (data.stats?.members || "0");
    
    const container = document.getElementById('games-container');
    const select = document.getElementById('join-game-select');
    let html = ''; let sel = '<option value="">اختر اللعبة</option>';
    
    if(data.games) {
        Object.keys(data.games).forEach(id => {
            const g = data.games[id];
            const playersHtml = g.players ? Object.values(g.players).map(p => `<span class="player-tag">${p.name}</span>`).join('') : 'No players yet';
            html += `
                <div class="game-card" onclick="togglePlayers('${id}')">
                    <img src="${g.img}">
                    <h3>${g.nameAr}</h3>
                    <div id="players-${id}" class="players-container">
                        <strong>ROSTER:</strong><br>${playersHtml}
                    </div>
                </div>`;
            sel += `<option value="${g.nameAr}">${g.nameAr}</option>`;
        });
    }
    container.innerHTML = html;
    if(select) select.innerHTML = sel;

    if(data.media) {
        document.getElementById('gallery-container').innerHTML = Object.values(data.media).map(m => `
            <div class="game-card">
                ${m.type === 'video' ? `<iframe src="${youtubeParser(m.url)}" width="100%" height="200" frameborder="0" allowfullscreen style="border-radius:15px;"></iframe>` : `<img src="${m.url}">`}
            </div>
        `).join('');
    }
});

document.getElementById('join-form').onsubmit = async function(e) {
    e.preventDefault();
    const btn = document.getElementById('join-btn');
    const status = document.getElementById('form-status');
    const webhookURL = "https://discord.com/api/webhooks/1483914388460011611/vPZV4wa9hzx9B9UBfmiikzK35D5zVQt4klVs7k76kNFX_O6-JntpTYztMNqNdeIPHB8M";

    btn.innerText = "Processing...";
    btn.disabled = true;

    const fd = new FormData(this);
    const embedData = {
        embeds: [{
            title: "💎 New Application",
            color: 16711680,
            fields: [
                { name: "Name", value: fd.get('name') || "N/A", inline: true },
                { name: "WhatsApp", value: fd.get('phone') || "N/A", inline: true },
                { name: "Role", value: fd.get('role') || "N/A", inline: true },
                { name: "Game/Details", value: fd.get('game') || fd.get('link') || fd.get('exp') || "N/A" }
            ],
            timestamp: new Date()
        }]
    };

    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embedData)
        });
        if (response.ok) {
            status.style.display = 'block';
            status.style.color = 'lime';
            status.innerText = "✅ Sent successfully!";
            this.reset();
        }
    } catch (err) {
        status.style.display = 'block';
        status.style.color = 'red';
        status.innerText = "❌ Error sending.";
    } finally {
        btn.innerText = "Send Application";
        btn.disabled = false;
    }
};