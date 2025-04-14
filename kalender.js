document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [resHA, resPR] = await Promise.all([
            fetch('https://homework-manager-1-6-backend.onrender.com/hausaufgaben'),
            fetch('https://homework-manager-1-6-backend.onrender.com/pruefungen')
        ]);

        const hausaufgaben = await resHA.json();
        const pruefungen = await resPR.json();

        // Events aus API-Daten erzeugen
        const events = [
            ...hausaufgaben.map(h => ({
                title: `HA ${h.fach}: ${h.beschreibung}`,
                start: h.faellig_am.split('T')[0], // Nur Datumsteil verwenden
                color: '#007bff'  // Blau für Hausaufgaben
            })),
            ...pruefungen.map(p => ({
                title: `Prüfung ${p.fach}: ${p.beschreibung}`,
                start: p.pruefungsdatum.split('T')[0], // Nur Datumsteil verwenden
                color: '#dc3545'  // Rot für Prüfungen
            }))
        ];

        // Kalender initialisieren und rendern
        const calendarEl = document.getElementById('calendar');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'de',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events
        });

        calendar.render();

    } catch (err) {
        console.error('Fehler beim Laden des Kalenders:', err);
        document.getElementById('calendar').innerText = "Fehler beim Laden der Kalendereinträge!";
    }
});
