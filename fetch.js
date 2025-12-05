async function afficherCinema() {
    //Initialisation de la carte, centrée sur Paris 
    const map = L.map('map').setView([48.8566, 2.3522], 11);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    try {
        //Récupération du fichier json
        const reponse = await fetch("./geo-les_salles_de_cinemas_en_ile-de-france.json");
        const cinemas = await reponse.json();

        // Boucle sur chaque cinema pour placer un marqueur
        cinemas.forEach(cinema => {
            if (cinema.geo) {
                const coordonnees = cinema.geo.split(',');
                
                const latitude = parseFloat(coordonnees[0]);
                const longitude = parseFloat(coordonnees[1]);

                //Création du marqueur 
                const marker = L.marker([latitude, longitude]).addTo(map);

                //Ajout d'une popup avec les infos
                marker.bindPopup(`
                    ${cinema.nom}
                    ${cinema.adresse}
                    ${cinema.commune}
                    ${cinema.fauteuils} fauteuils
                `);
            }
        });

        console.log("Carte et cinémas chargés");

    } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
    }
}

afficherCinema();