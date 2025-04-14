async function aktuellesFachLaden() {
    // Lokale Funktion für den Datenabruf
    async function update() {
        try {
            const res = await fetch('https://homework-manager-1-6-backend.onrender.com/aktuelles_fach');
            const data = await res.json();
            document.getElementById('fachInfo').innerHTML = `
                <h2>Aktuelles Fach: ${data.fach}</h2>
                <h3>Verbleibend: ${data.verbleibend}</h3>
                <h4>Endet um: ${data.endzeit_str}</h4>
            `;
        } catch (error) {
            console.error('Fehler beim Abrufen des aktuellen Fachs:', error);
            document.getElementById('fachInfo').innerHTML =
                '<p>Fehler beim Laden der Daten.</p>';
        }
    }

    // Bereits existierende Intervall-Variable löschen, falls vorhanden
    if (window.fachInterval) {
        clearInterval(window.fachInterval);
    }

    // Direkt beim Laden einmal Daten holen
    await update();

    // Danach alle x Sekunden automatisch aktualisieren
    window.fachInterval = setInterval(update, 100);
}

// Einmalig aufrufen, um das Ganze zu starten
aktuellesFachLaden();
