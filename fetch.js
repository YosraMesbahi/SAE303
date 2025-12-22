 let allData = [];
        let map;
        let markers = new L.MarkerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });
        
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
        
        async function initSite() {
            map = L.map('carte').setView([48.8566, 2.3522], 10);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            try {
                const response = await fetch("./geo-les_salles_de_cinemas_en_ile-de-france.json");
                allData = await response.json();
                
                let maxFauteuils = { nom: "", fauteuils: 0, commune: "" };
                let maxEcrans = { nom: "", ecrans: 0, commune: "" };
                
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
                    
                    const fauteuils = parseInt(cinema.fauteuils || 0);
                    const ecrans = parseInt(cinema.ecrans || 0);
                    
                    if (fauteuils > maxFauteuils.fauteuils) {
                        maxFauteuils = { nom: cinema.nom, fauteuils, commune: cinema.commune };
                    }
                    
                    if (ecrans > maxEcrans.ecrans) {
                        maxEcrans = { nom: cinema.nom, ecrans, commune: cinema.commune };
                    }
                });
                
                map.addLayer(markers);
                
                document.getElementById('maxFauteuilsValue').textContent = maxFauteuils.fauteuils.toLocaleString();
                document.getElementById('maxFauteuilsDetail').innerHTML = `<strong>${maxFauteuils.nom}</strong><br>${maxFauteuils.commune}`;
                
                document.getElementById('maxEcransValue').textContent = maxEcrans.ecrans;
                document.getElementById('maxEcransDetail').innerHTML = `<strong>${maxEcrans.nom}</strong><br>${maxEcrans.commune}`;
                
                document.getElementById('totalCinemas').textContent = allData.length;
                
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
        
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCity();
            }
        });
        
        initSite();