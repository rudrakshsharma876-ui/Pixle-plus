// Select DOM elements using Part 1 IDs
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('input');
const resultsContainer = document.getElementById('results');
const resultCount = document.getElementById('resultCount');
const chips = document.querySelectorAll('.chip');

// Core Search Logic Function
async function performSearch(query) {
  // Task: Ignore empty searches
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return;

  // Task: Clear old results before rendering a new search
  resultsContainer.innerHTML = '';
  if (resultCount) resultCount.textContent = '';

  // Task: Fetch data with encodeURIComponent
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(trimmedQuery)}&gsrnamespace=6&gsrlimit=16&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;

  try {
    const response = await fetch(endpoint);

    // Task: Check response.ok
    if (!response.ok) {
      console.error(`HTTP Error: ${response.status}`);
      return;
    }

    // Task: Parse JSON
    const data = await response.json();

    // Check if pages exist in the query result
    if (!data.query || !data.query.pages) {
      if (resultCount) {
        resultCount.textContent = `No results found for "${trimmedQuery}".`;
      }
      return;
    }

    const items = Object.values(data.query.pages);

    // Enhancement 1: Display result count
    if (resultCount) {
      resultCount.textContent = `Showing ${items.length} results for "${trimmedQuery}"`;
    }

    // Task: Render results by looping over items
    items.forEach(item => {
      const imageInfo = item.imageinfo ? item.imageinfo[0] : null;
      if (!imageInfo || !imageInfo.url) return;

      // Clean the title (remove "File:" prefix and file extension)
      const rawTitle = item.title.replace(/^File:/, '');
      const cleanTitle = rawTitle.substring(0, rawTitle.lastIndexOf('.')) || rawTitle;

      // Construct Card DOM Structure
      const card = document.createElement('div');
      card.className = 'card';

      // Enhancement 2: Make each card a link opening full image/page in a new tab
      const link = document.createElement('a');
      link.className = 'card-link';
      link.href = imageInfo.descriptionurl || imageInfo.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      const img = document.createElement('img');
      img.src = imageInfo.url;
      img.alt = cleanTitle;
      img.loading = 'lazy';

      const cardInfo = document.createElement('div');
      cardInfo.className = 'card-info';

      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = cleanTitle;

      cardInfo.appendChild(title);

      // Add artist attribution if metadata exists
      if (imageInfo.extmetadata && imageInfo.extmetadata.Artist) {
        const artist = document.createElement('p');
        artist.className = 'card-artist';
        // Strip HTML tags from Wikimedia's artist metadata
        const rawArtist = imageInfo.extmetadata.Artist.value;
        const cleanArtist = rawArtist.replace(/<[^>]*>?/gm, '');
        artist.textContent = `By ${cleanArtist}`;
        cardInfo.appendChild(artist);
      }

      // Assemble nodes
      link.appendChild(img);
      link.appendChild(cardInfo);
      card.appendChild(link);

      // Append card to results grid
      resultsContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Task: Catch search form submit event
searchForm.addEventListener('submit', (event) => {
  // Prevent page reload
  event.preventDefault();
  
  // Read value from input
  const query = searchInput.value;
  performSearch(query);
});

// Enhancement 3: Wire up quick-pick category chips to run search
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    const query = chip.textContent;
    searchInput.value = query;
    performSearch(query);
  });
});