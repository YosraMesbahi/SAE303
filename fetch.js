async function initSite() {
    // 1. Initialisation de la Carte (L.map)
    const map = L.map('carte').setView([48.8566, 2.3522], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    try {
        // 2. Chargement du fichier JSON
        const response = await fetch("./geo-les_salles_de_cinemas_en_ile-de-france.json");
        const data = await response.json();

        // --- TRAITEMENT DES DONNÉES ---
        const villesData = {};
        const types = { "Petites salles (1-2)": 0, "Cinémas Moyens (3-7)": 0, "Multiplexes (8+)": 0 };

        data.forEach(cinema => {
            // A. Ajout des marqueurs sur la carte avec TOUTES les infos
            if (cinema.geo) {
                const coords = cinema.geo.split(',');
                const marker = L.marker([parseFloat(coords[0]), parseFloat(coords[1])]).addTo(map);
                
                marker.bindPopup(`
                    <div style="font-family: 'Poppins', sans-serif;">
                        <strong style="color:#e63946; font-size:1.1rem;">${cinema.nom}</strong><br>
                        <b>Adresse :</b> ${cinema.adresse}, ${cinema.commune}<br>
                        <b>Écrans :</b> ${cinema.ecrans}<br>
                        <b>Fauteuils :</b> ${cinema.fauteuils}<br>
                        <hr>
                        <small>Département : ${cinema.dep}</small>
                    </div>
                `);
            }

            // B. Données pour le Top 10 Villes (hors Paris car trop dominant)
            if (cinema.commune !== "Paris") {
                villesData[cinema.commune] = (villesData[cinema.commune] || 0) + parseInt(cinema.fauteuils || 0);
            }

            // C. Données pour la Typologie
            const nbEcrans = parseInt(cinema.ecrans || 0);
            if (nbEcrans <= 2) types["Petites salles (1-2)"]++;
            else if (nbEcrans <= 7) types["Cinémas Moyens (3-7)"]++;
            else types["Multiplexes (8+)"]++;
        });

        

    } catch (e) {
        console.error("Erreur lors du chargement des données :", e);
    }
}

// Lancer le script au chargement
initSite();
