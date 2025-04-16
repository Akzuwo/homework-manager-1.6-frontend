// LOGIN & SESSION MANAGEMENT
function login() {
    const pw = document.getElementById('passwort').value;
    if (pw === 'l23a-admin') {
        sessionStorage.setItem('role', 'admin');
        window.location.href = 'index.html';
    } else {
        alert('Falsches Passwort!');
    }
}

function guestLogin() {
    sessionStorage.setItem('role', 'guest');
    window.location.href = 'index.html';
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function checkLogin() {
    // Prüfe, ob das aktuelle Dokument das Attribut data-skip-check="true" besitzt
    if (document.body.dataset.skipCheck === "true") {
        console.log("Login-Check übersprungen (Login-Seite)");
        return; // Auf der Login-Seite soll keine Weiterleitung erfolgen
    }

    // Andernfalls führe den regulären Check aus
    const role = sessionStorage.getItem('role');

    if (!role) {
        window.location.href = 'login.html';
        return;
    }

    // Optional: Element "eintragTab" anzeigen/ausblenden
    const eintragTab = document.getElementById('eintragTab');
    if (eintragTab && role !== 'admin') {
        eintragTab.style.display = 'none';
    }
    console.log("Login-Check: role =", role);
}

  

  

function clearContent() {
    document.getElementById('content').innerHTML = "";
}

/** KALENDER-FUNKTION **/
async function openCalendar() {
    try {
        clearContent();

        const resHA = await fetch('https://homework-manager-1-6-backend.onrender.com/hausaufgaben');
        const hausaufgaben = await resHA.json();

        const resPR = await fetch('https://homework-manager-1-6-backend.onrender.com/pruefungen');
        const pruefungen = await resPR.json();

        const events = [
            ...hausaufgaben.map(h => ({
                title: `HA ${h.fach}`,
                start: h.faellig_am,
                color: '#007bff'  // Blau
            })),
            ...pruefungen.map(p => ({
                title: `Prüfung ${p.fach}`,
                start: p.pruefungsdatum,
                color: '#dc3545'  // Rot
            }))
        ];

        document.getElementById('content').innerHTML = '<div id="calendar"></div>';

        const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: events
        });

        calendar.render();
    } catch (err) {
        console.error('Fehler beim Laden oder Rendern des Kalenders:', err);
    }
}

/** AKTUELLES FACH MIT AUTOMATISCHER AKTUALISIERUNG **/
let fachInterval;

async function loadCurrentSubject(){
    clearContent();
    async function update(){
        const res = await fetch('https://homework-manager-1-6-backend.onrender.com/aktuelles_fach');
        const data = await res.json();
        document.getElementById('content').innerHTML = `
            <h2>Aktuelles Fach: ${data.fach}</h2>
            <h3>Verbleibend: ${data.verbleibend}</h3>
        `;
    }
    clearInterval(fachInterval);
    await update();
    fachInterval = setInterval(update, 1000);
}

async function aktuellesFachLaden(){
    const res = await fetch('https://homework-manager-1-6-backend.onrender.com/aktuelles_fach');
    const data = await res.json();

    document.getElementById('fachInfo').innerHTML = `
        <p><strong>Fach:</strong> ${data.fach}</p>
        <p><strong>Endet um:</strong> ${data.endet}</p>
        <p><strong>Verbleibend:</strong> ${data.verbleibend}</p>
    `;
}

/** NOTENRECHNER **/
function openGradeCalc() {
    clearContent();
    document.getElementById('content').innerHTML = `
        <h2>📊 Notenrechner</h2>
        <select id="fach">
          ${[
            'MA','DE','PS','SPM-PS','EN','SPM-MA','SPM-ES','SP','WR','GS',
            'GG','IN','IT','FR','BG','MU','BI','Sport','CH'
          ].map(fach => `<option>${fach}</option>`).join('')}
        </select>
        <input id="note" type="number" step="0.01" placeholder="Note">
        <input id="gewichtung" type="number" step="0.01" placeholder="Gewichtung">
        <button onclick="addGrade()">Geht leider noch nicht😭</button>
        <ul id="notenListe"></ul>
        <h3 id="schnitt">Durchschnitt: -</h3>
    `;
}

let noten = [];

function addGrade() {
    const fach = document.getElementById('fach').value;
    const note = parseFloat(document.getElementById('note').value);
    const gewichtung = parseFloat(document.getElementById('gewichtung').value);

    if (isNaN(note) || isNaN(gewichtung)) {
        alert('Ungültige Eingabe!');
        return;
    }

    noten.push({ fach, note, gewichtung });
    updateGrades();
}

function updateGrades() {
    const liste = document.getElementById('notenListe');
    liste.innerHTML = '';
    let summe = 0;
    let gewichtungsSumme = 0;

    const listItems = noten.map(n => {
        summe += n.note * n.gewichtung;
        gewichtungsSumme += n.gewichtung;
        return `<li>${n.fach}: ${n.note} (Gewichtung: ${n.gewichtung})</li>`;
    });

    liste.innerHTML = listItems.join('');
    const schnitt = (gewichtungsSumme > 0)
        ? (summe / gewichtungsSumme).toFixed(2)
        : '-';

    document.getElementById('schnitt').innerText = `Schnitt: ${schnitt}`;
}

/** EINTRAG ERFASSEN MIT DROPDOWN UND DB-ANBINDUNG **/
function showEntryForm() {
    if (sessionStorage.getItem('role') !== 'admin') {
        alert('Nur Admin darf Einträge erstellen!');
        return;
    }
    clearContent();
    document.getElementById('content').innerHTML = `
        <h2>📝 Neuen Eintrag erstellen</h2>
        <select id="typ">
            <option value="hausaufgabe">Hausaufgabe</option>
            <option value="pruefung">Prüfung</option>
        </select><br>
        <select id="fach">
            ${[
                'MA','DE','EN','PS','SPM-PS','SPM-MA','SPM-ES','SP','WR','GS',
                'GG','IN','IT','FR','BG','MU','BI','Sport','CH'
            ].map(f => `<option>${f}</option>`).join('')}
        </select><br>
        <input id="beschreibung" placeholder="Beschreibung"><br>
        <input type="datetime-local" id="datum"><br>
        <button id="saveButton" onclick="saveEntry()">Hinzufügen</button>

    `;
}

async function saveEntry() {
    const typ = document.getElementById('typ').value;
    const fach = document.getElementById('fach').value;
    const beschreibung = document.getElementById('beschreibung').value;
    const datum = document.getElementById('datum').value;
    const saveButton = document.getElementById('saveButton');  // Stelle sicher, dass der Button diese ID hat

    // Button deaktivieren und visuelles Feedback geben (optional)
    saveButton.disabled = true;
    saveButton.innerText = "Speichern läuft...";

    let success = false;
    let attempt = 0;
    // Maximal 10 Versuche (optional; du kannst hier auch unbegrenzt versuchen, solltest aber eine Abbruchlogik einbauen)
    const maxAttempts = 10;

    while (!success && attempt < maxAttempts) {
        try {
            const response = await fetch('https://homework-manager-1-6-backend.onrender.com/add_entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ typ, fach, beschreibung, datum })
            });
            const result = await response.json();

            if (result.status === "ok") {
                success = true;
                alert("Eintrag wurde erfolgreich gespeichert!");
            } else {
                console.error("Server-Fehler beim Speichern:", result.message);
            }
        } catch (error) {
            console.error("Netzwerk-Fehler beim Speichern:", error);
        }

        if (!success) {
            attempt++;
            console.warn(`Speicher-Versuch ${attempt} fehlgeschlagen. Neuer Versuch in 2 Sekunden.`);
            // Warte 2000ms, bevor erneut versucht wird
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    if (!success) {
        alert("Der Eintrag konnte nach mehreren Versuchen nicht gespeichert werden. Bitte versuche es später noch einmal.");
    } else {
        // Eingabefelder zurücksetzen
        document.getElementById('typ').value = "";
        document.getElementById('fach').value = "";
        document.getElementById('beschreibung').value = "";
        document.getElementById('datum').value = "";
    }

    // Button wieder aktivieren
    saveButton.disabled = false;
    saveButton.innerText = "Hinzufügen";
}



// Initialcheck beim Laden der Seite
window.addEventListener('DOMContentLoaded', checkLogin);
