import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDo0jp7N7wzNXKM81sELGmUhA9QePDOL7g",
    authDomain: "rageesports-iq.firebaseapp.com",
    projectId: "rageesports-iq",
    databaseURL: "https://rageesports-iq-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// دالة تحويل روابط يوتيوب لتعمل بدون "Refused to Connect"
function getEmbedUrl(url) {
    if (!url) return '';
    let videoId = '';
    if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('embed/')) {
        return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

window.toggleLang = () => {
    const html = document.documentElement;
    const isAr = html.lang === 'ar';
    html.lang = isAr ? 'en' : 'ar';
    html.dir = isAr ? 'ltr' : 'rtl';
    document.querySelector('.lang-btn').innerText = isAr ? 'AR' : 'EN';
};

window.toggleRoster = (id) => {
    const el = document.getElementById(`roster-${id}`);
    const isVisible = el.style.display === 'block';
    document.querySelectorAll('.players-container').forEach(c => c.style.display = 'none');
    if(!isVisible) el.style.display = 'block';
};

window.showRoleFields = () => {
    const role = document.getElementById('role-select').value;
    document.querySelectorAll('.dynamic-fields').forEach(d => d.style.display = 'none');
    if(role) document.getElementById(`fields-${role}`).style.display = 'block';
};

onValue(ref(db, 'siteData'), (snap) => {
    const data = snap.val() || {};
    
    // الأرقام
    document.getElementById('db-cups').innerText = data.stats?.cups || "0";
    document.getElementById('db-members').innerText = "+" + (data.stats?.members || "0");

    // الفرق وقائمة الانضمام
    const gContainer = document.getElementById('games-container');
    const jSelect = document.getElementById('join-game-select');
    let gHtml = ''; let sHtml = '<option value="">اختر اللعبة</option>';
    
    if(data.games) {
        Object.keys(data.games).forEach(id => {
            const g = data.games[id];
            const pList = g.players ? Object.values(g.players).map(p => `
                <div class="player-item">
                    <img src="${p.img || 'logo.png'}">
                    <div><strong>${p.name}</strong><br><small>${p.nat || 'IQ'}</small></div>
                </div>`).join('') : '<p>لا يوجد لاعبين</p>';

            gHtml += `
                <div class="game-card" onclick="toggleRoster('${id}')">
                    <img src="${g.img || 'logo.png'}">
                    <h3>${g.nameAr}</h3>
                    <div id="roster-${id}" class="players-container">${pList}</div>
                </div>`;
            sHtml += `<option value="${g.nameAr}">${g.nameAr}</option>`;
        });
    }
    gContainer.innerHTML = gHtml;
    if(jSelect) jSelect.innerHTML = sHtml;

    // المعرض مع تحويل الروابط
    if(data.media) {
        document.getElementById('gallery-container').innerHTML = Object.values(data.media).map(m => `
            <div class="game-card">
                ${m.type === 'video' ? 
                `<iframe src="${getEmbedUrl(m.url)}" width="100%" height="180" frameborder="0" allowfullscreen></iframe>` : 
                `<img src="${m.url}" style="height:180px; object-fit:cover;">`}
            </div>`).join('');
    }
});

document.getElementById('join-form').onsubmit = async function(e) {
    e.preventDefault();
    const webhook = "https://discord.com/api/webhooks/1483914388460011611/vPZV4wa9hzx9B9UBfmiikzK35D5zVQt4klVs7k76kNFX_O6-JntpTYztMNqNdeIPHB8M";
    const fd = new FormData(this);
    const msg = { embeds: [{ title: "طلب انضمام جديد", color: 16711680, fields: [{name:"الاسم", value:fd.get('name')}, {name:"الرتبة", value:fd.get('role')}] }] };
    await fetch(webhook, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(msg)});
    alert("تم الإرسال!"); this.reset();
    document.querySelectorAll('.dynamic-fields').forEach(d => d.style.display = 'none');
};
