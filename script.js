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

// الترجمة الشاملة
const i18n = {
    ar: {
        nav_home: "الرئيسية", nav_teams: "الفرق", nav_gallery: "المعرض", nav_join: "انضم إلينا",
        hero_title: "نحن ريج", stats_cups: "بطولة", stats_members: "عضو",
        sec_teams: "🎮 فرقنا", sec_gallery: "📸 المعرض", sec_join: "انضم إلينا", form_btn: "إرسال الطلب"
    },
    en: {
        nav_home: "Home", nav_teams: "Teams", nav_gallery: "Gallery", nav_join: "Join Us",
        hero_title: "WE ARE RAGE", stats_cups: "Cups", stats_members: "Members",
        sec_teams: "🎮 OUR TEAMS", sec_gallery: "📸 GALLERY", sec_join: "JOIN US", form_btn: "Submit Application"
    }
};

window.toggleLang = () => {
    const html = document.documentElement;
    const isAr = html.lang === 'ar';
    const newLang = isAr ? 'en' : 'ar';
    html.lang = newLang; html.dir = isAr ? 'ltr' : 'rtl';
    document.querySelector('.lang-btn').innerText = isAr ? 'AR' : 'EN';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerText = i18n[newLang][el.getAttribute('data-i18n')];
    });
};

// دالة تحويل اليوتيوب
function getEmbedUrl(url) {
    if (!url) return '';
    let id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
}

// دالة الروستر (تعمل فوراً عند الضغط)
window.toggleRoster = (id) => {
    const el = document.getElementById(`roster-${id}`);
    const isVisible = el.style.display === 'block';
    document.querySelectorAll('.players-container').forEach(c => c.style.display = 'none');
    if(!isVisible) el.style.display = 'block';
};

onValue(ref(db, 'siteData'), (snap) => {
    const data = snap.val() || {};
    document.getElementById('ticker-text').innerText = data.news || "Welcome to RAGE ESPORTS!";
    document.getElementById('db-cups').innerText = data.stats?.cups || "0";
    document.getElementById('db-members').innerText = "+" + (data.stats?.members || "0");

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
                </div>`).join('') : '<p>لا يوجد لاعبين مضافين</p>';

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

    if(data.media) {
        document.getElementById('gallery-container').innerHTML = Object.values(data.media).map(m => `
            <div class="game-card">
                ${m.type === 'video' ? `<iframe src="${getEmbedUrl(m.url)}" width="100%" height="180" frameborder="0" allowfullscreen></iframe>` : `<img src="${m.url}" style="height:180px; object-fit:cover;">`}
            </div>`).join('');
    }
});

// الويب هوك الخاص بديسكورد
document.getElementById('join-form').onsubmit = async function(e) {
    e.preventDefault();
    const webhook = "https://discord.com/api/webhooks/1483914388460011611/vPZV4wa9hzx9B9UBfmiikzK35D5zVQt4klVs7k76kNFX_O6-JntpTYztMNqNdeIPHB8M";
    const fd = new FormData(this);
    const msg = {
        embeds: [{
            title: "طلب انضمام جديد - RAGE",
            color: 16711680,
            fields: [
                {name: "الاسم", value: fd.get('name'), inline: true},
                {name: "العمر", value: fd.get('age'), inline: true},
                {name: "الواتساب", value: fd.get('phone'), inline: true},
                {name: "الرتبة", value: fd.get('role'), inline: true},
                {name: "اللعبة/التفاصيل", value: fd.get('game') || fd.get('link') || fd.get('exp') || "غير محدد"}
            ]
        }]
    };
    await fetch(webhook, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(msg)});
    alert("تم إرسال طلبك بنجاح!"); 
    this.reset();
    document.querySelectorAll('.dynamic-fields').forEach(d => d.style.display = 'none');
};

window.showRoleFields = () => {
    const role = document.getElementById('role-select').value;
    document.querySelectorAll('.dynamic-fields').forEach(d => d.style.display = 'none');
    if(role) {
        const field = document.getElementById(`fields-${role}`);
        if(field) field.style.display = 'block';
    }
};
