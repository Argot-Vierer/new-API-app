const API_BASE_URL = 'https://mhw-db.com';
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let currentData = []; // Dodaj zmienną globalną do przechowywania danych

document.getElementById('search-btn').addEventListener('click', fetchData);

async function fetchData() {
    const category = document.getElementById('category-filter').value;
    const resultsContainer = document.getElementById('results-container');
    
    try {
        const response = await fetch(`${API_BASE_URL}/${category}`);
        const data = await response.json();
        
        currentData = data; // Zapisz dane
        currentPage = 1; // Zresetuj stronę przy nowym wyszukiwaniu
        
        // Dodajemy debugowanie
        console.log('Otrzymane dane:', data);
        if (data.length > 0) {
            console.log('Przykładowy element:', data[0]);
            if (category === 'weapons') {
                console.log('Ścieżki do obrazków broni:', {
                    icon: data[0].assets?.icon,
                    image: data[0].assets?.image
                });
            }
        }
        
        displayResults(data, category);
        addPagination(data, category);
    } catch (error) {
        console.error('Error fetching data:', error);
        resultsContainer.innerHTML = '<p>Error loading data. Please try again.</p>';
    }
}

function displayResults(data, category) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedData = data.slice(start, end);

    data.slice(0, 20).forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let content = '';
        switch(category) {
            case 'weapons':
                // Tworzymy tekst dla tooltipa
                const tooltipText = `Atak: ${item.attack?.display || 'N/A'}
Element: ${item.elements?.map(e => `${e.type} (${e.damage})`).join(', ') || 'Brak'}
Rzadkość: ${item.rarity}⭐`;
                
                content = `
                    <div class="weapon-tooltip" data-tooltip="${tooltipText}">
                        <h3>${item.name}</h3>
                        <div class="weapon-images">
                            ${item.assets?.icon ? `<img src="${item.assets.icon}" alt="${item.name} icon" class="weapon-icon">` : ''}
                            ${item.assets?.image ? `<img src="${item.assets.image}" alt="${item.name} model" class="weapon-model">` : ''}
                        </div>
                        <div class="weapon-details">
                            <p><strong>Type:</strong> ${item.type}</p>
                            <p><strong>Rarity:</strong> ${item.rarity} ⭐</p>
                        </div>
                    </div>
                `;
                break;
            case 'monsters':
                // Tworzymy tekst dla tooltipa potwora
                const monsterTooltip = `
        Typ: ${item.type}
        Gatunek: ${item.species}
        Elementy: ${item.elements?.join(', ') || 'Brak'}
        Słabości: ${item.weaknesses?.map(w => `${w.element} (${w.stars}★)`).join(', ') || 'Brak'}
    `;
    
                content = `
                    <div class="monster-tooltip" data-tooltip="${monsterTooltip}">
                        <h3>${item.name}</h3>
                        <div class="monster-images">
                            ${item.assets?.icon ? `<img src="${item.assets.icon}" alt="${item.name} icon" class="monster-icon">` : ''}
                            ${item.assets?.image ? `<img src="${item.assets.image}" alt="${item.name}" class="monster-image">` : ''}
                        </div>
                        <div class="monster-details">
                            <p><strong>Type:</strong> ${item.type}</p>
                            <p><strong>Species:</strong> ${item.species}</p>
                            ${item.description ? `<p class="monster-description">${item.description}</p>` : ''}
                            <p><strong>Locations:</strong> ${item.locations?.map(loc => loc.name).join(', ') || 'Unknown'}</p>
                        </div>
                    </div>
                `;
                break;
            case 'armor':
                content = `
                    <h3>${item.name}</h3>
                    <p>Type: ${item.type}</p>
                    <p>Rank: ${item.rank}</p>
                `;
                break;
            case 'items':
                content = `
                    <h3>${item.name}</h3>
                    <p>Description: ${item.description || 'No description available'}</p>
                `;
                break;
        }
        
        card.innerHTML = content;
        resultsContainer.appendChild(card);
    });
}

function addSearchFilter() {
    const filtersDiv = document.querySelector('.filters');
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Szukaj...';
    searchInput.className = 'search-input';
    filtersDiv.insertBefore(searchInput, document.getElementById('search-btn'));
}

function addPagination(data, category) {
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    
    // Dodaj przycisk "Poprzednia"
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '←';
    prevBtn.className = 'page-btn nav-btn';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination(data, category);
        }
    };
    paginationDiv.appendChild(prevBtn);

    // Logika wyświetlania stron
    const showPages = (start, end) => {
        for (let i = start; i <= end; i++) {
            if (i < 1 || i > totalPages) continue;
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === currentPage ? 'page-btn active' : 'page-btn';
            pageBtn.onclick = () => {
                currentPage = i;
                updatePagination(data, category);
            };
            paginationDiv.appendChild(pageBtn);
        }
    };

    // Logika wyświetlania zakresów stron
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        showPages(1, 1);
        if (startPage > 2) paginationDiv.appendChild(createEllipsis());
    }

    showPages(startPage, endPage);

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationDiv.appendChild(createEllipsis());
        showPages(totalPages, totalPages);
    }

    // Dodaj przycisk "Następna"
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.className = 'page-btn nav-btn';
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination(data, category);
        }
    };
    paginationDiv.appendChild(nextBtn);

    document.querySelector('.container').appendChild(paginationDiv);
}

// Funkcja pomocnicza do tworzenia wielokropka
function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    ellipsis.className = 'page-btn';
    ellipsis.style.border = 'none';
    ellipsis.style.backgroundColor = 'transparent';
    return ellipsis;
}

// Funkcja do aktualizacji paginacji
function updatePagination(data, category) {
    displayResults(currentData, category);
    addPagination(data, category);
}

// Initial load
fetchData();
addSearchFilter();