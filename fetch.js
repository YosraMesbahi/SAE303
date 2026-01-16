// Menu burger
const burgerBtn = document.getElementById('burgerBtn');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('nav ul a');

burgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    burgerBtn.classList.toggle('active');
});

// Fermer le menu quand on clique sur un lien
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        burgerBtn.classList.remove('active');
    });
});

// Fermer le menu si on clique en dehors
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !burgerBtn.contains(e.target)) {
        navMenu.classList.remove('active');
        burgerBtn.classList.remove('active');
    }
});

let allData = [];
let map;
let markers = new L.MarkerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
});

// Données pour le graphique Chart.js
const chartData = {
    fauteuils: {
        labels: ['UGC Les Halles', 'GRAND REX', 'UGC Bercy', 'UGC La Défense', 'Gaumont Disney'],
        values: [3894, 4274, 4440, 3642, 3923],
        cinema: { nom: "UGC CINÉ CITÉ LES HALLES", value: "3 894", city: "Paris 1er Arrondissement" }
    },
    seances: {
        labels: ['UGC Les Halles', 'UGC La Défense', 'UGC Bercy', 'Torcy CGR', 'Gaumont Parnasse'],
        values: [70646, 35298, 40129, 32231, 32784],
        cinema: { nom: "UGC CINÉ CITÉ LES HALLES", value: "70 646", city: "Paris 1er Arrondissement" }
    },
    ecrans: {
        labels: ['UGC Les Halles', 'UGC Bercy', 'UGC La Défense', 'Pathé Belle Épine', 'Gaumont Parnasse'],
        values: [27, 18, 16, 16, 15],
        cinema: { nom: "UGC CINÉ CITÉ LES HALLES", value: "27", city: "Paris 1er Arrondissement" }
    },
    entrees: {
        labels: ['UGC Les Halles', 'UGC Bercy', 'Pathé Belle Épine', 'Gaumont Sénart', 'UGC La Défense'],
        values: [3277773, 2061609, 1628192, 1596024, 1577790],
        cinema: { nom: "UGC CINÉ CITÉ LES HALLES", value: "3 277 773", city: "Paris 1er Arrondissement" }
    }
};

const labels = {
    fauteuils: 'fauteuils',
    seances: 'séances par an',
    ecrans: 'écrans',
    entrees: 'entrées'
};

let myChart = null;

function filterStats(type) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const cards = document.querySelectorAll('.stat-card');

    if (type === 'all') {
        cards.forEach(card => card.style.display = 'block');
    } else {
        cards.forEach(card => {
            if (card.dataset.filter === type) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

function updateChart(criterion) {
    const data = chartData[criterion];
    const ctx = document.getElementById('topChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: labels[criterion],
                data: data.values,
                backgroundColor: [
                    'rgba(228, 0, 59, 0.8)',
                    'rgba(228, 0, 59, 0.6)',
                    'rgba(228, 0, 59, 0.5)',
                    'rgba(228, 0, 59, 0.4)',
                    'rgba(228, 0, 59, 0.3)'
                ],
                borderColor: 'rgba(228, 0, 59, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: 'Poppins'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Poppins',
                            size: 10
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });

    // Mise à jour des infos du cinéma
    document.getElementById('topCinemaName').textContent = data.cinema.nom;
    document.getElementById('topCinemaValue').textContent = data.cinema.value;
    document.getElementById('topCinemaLabel').textContent = labels[criterion];
    document.getElementById('topCinemaCity').textContent = `Situé à ${data.cinema.city}`;
}

async function initSite() {
    map = L.map('carte').setView([48.8566, 2.3522], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    try {
        const response = await fetch("./geo-les_salles_de_cinemas_en_ile-de-france.json");
        allData = await response.json();

        allData.forEach(cinema => {
            if (cinema.geo) {
                const coords = cinema.geo.split(',');
                const marker = L.marker([parseFloat(coords[0]), parseFloat(coords[1])]);

                marker.bindPopup(`
                    <div style="font-family: 'Poppins', sans-serif; min-width: 200px;">
                        <strong style="color:#E4003B; font-size:1.1rem;">${cinema.nom}</strong><br>
                        <b>Adresse :</b> ${cinema.adresse}<br>
                        <b>Commune :</b> ${cinema.commune}<br>
                        <b>Écrans :</b> ${cinema.ecrans}<br>
                        <b>Fauteuils :</b> ${cinema.fauteuils}<br>
                        <hr style="margin: 8px 0;">
                        <small>Département : ${cinema.dep}</small>
                    </div>
                `);

                markers.addLayer(marker);
            }
        });

        map.addLayer(markers);

        // Initialiser le graphique avec le critère par défaut
        updateChart('fauteuils');

    } catch (e) {
        console.error("Erreur lors du chargement des données :", e);
        document.getElementById('searchResult').innerHTML = "Erreur de chargement des données";
        document.getElementById('searchResult').classList.add('show', 'error');
    }
}

function searchCity() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const resultDiv = document.getElementById('searchResult');

    if (!searchInput) {
        resultDiv.innerHTML = "Veuillez entrer un nom de ville";
        resultDiv.className = 'search-result show error';
        return;
    }

    const searchLower = searchInput.toLowerCase();
    const cinemasInCity = allData.filter(cinema =>
        cinema.commune && cinema.commune.toLowerCase().includes(searchLower)
    );

    if (cinemasInCity.length === 0) {
        resultDiv.innerHTML = `❌ Aucun cinéma trouvé dans "${searchInput}"`;
        resultDiv.className = 'search-result show error';
    } else {
        const totalFauteuils = cinemasInCity.reduce((sum, c) => sum + parseInt(c.fauteuils || 0), 0);
        const totalEcrans = cinemasInCity.reduce((sum, c) => sum + parseInt(c.ecrans || 0), 0);

        let html = `<strong style="color: #2d6a2d; font-size: 1.2rem;">✓ ${cinemasInCity.length} cinéma(s) trouvé(s) à ${cinemasInCity[0].commune}</strong><br><br>`;
        html += `<strong>Total :</strong> ${totalEcrans} écrans • ${totalFauteuils.toLocaleString()} fauteuils<br><br>`;

        cinemasInCity.forEach(cinema => {
            html += `
                <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <strong style="color: #E4003B;">${cinema.nom}</strong><br>
                    ${cinema.adresse}<br>
                    <small>${cinema.ecrans} écrans • ${cinema.fauteuils} fauteuils</small>
                </div>
            `;
        });

        resultDiv.innerHTML = html;
        resultDiv.className = 'search-result show success';
    }
}

document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchCity();
    }
});

// Event listener pour le sélecteur de graphique
document.getElementById('topCinemaSelect').addEventListener('change', function (e) {
    updateChart(e.target.value);
});
initSite();

