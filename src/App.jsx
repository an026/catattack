import React, { useState, useEffect } from 'react';
import './App.css';

// Fetch breeds once when the component is mounted
const useBreeds = (apiKey) => {
  const [breeds, setBreeds] = useState([]);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds', {
          headers: {
            'x-api-key': apiKey,
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBreeds(data.filter((breed) => breed.name !== 'Unknown')); // Exclude unknown breeds
      } catch (error) {
        console.error('Fetch error:', error);
        alert('Error occurred while fetching breeds.');
      }
    };

    fetchBreeds();
  }, [apiKey]);

  return breeds;
};

const CatInfo = ({ cat, banList, addToBanList }) => {
  // Extract only the displayable attributes from the cat object
  const displayableAttributes = ['breed', 'lifespan', 'origin'].filter(
    (attr) => !banList.includes(attr)
  );

  return (
    <ul>
      {displayableAttributes.map((attr) => (
        <li key={attr} onClick={() => addToBanList(cat.breed)}>
          {attr.toUpperCase()}: {cat[attr] || 'Unknown'}
        </li>
      ))}
    </ul>
  );
};

function App() {
  const apiKey = 'live_WbdwWfMdK1CIitxyNEElI134980pr7cZvgWu0ON06wj12sMEZN87GQeGvPeBofAC'; // Use environment variable in production
  const [catImage, setCatImage] = useState(null);
  const [banList, setBanList] = useState([]);
  const breeds = useBreeds(apiKey);

  const addToBanList = (breed) => {
    if (!banList.includes(breed)) {
      setBanList((prevList) => [...prevList, breed]);
    }
  };

  const fetchRandomCat = async () => {
    let found = false;
    let attempts = 0;

    while (!found && attempts < 10) { // Limit the number of attempts to avoid potential infinite loops
      attempts++;
      const url = `https://api.thecatapi.com/v1/images/search?limit=1&order=RAND&include_breeds=1&api_key=${apiKey}`;

      try {
        const response = await fetch(url, {
          headers: {
            'x-api-key': apiKey, // Some APIs require the key to be in the header
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const [data] = await response.json();
        if (data.breeds.length > 0 && !banList.includes(data.breeds[0].name)) {
          setCatImage({
            url: data.url,
            breed: data.breeds[0].name,
            lifespan: data.breeds[0].life_span,
            origin: data.breeds[0].origin,
          });
          found = true;
        }
      } catch (error) {
        console.error('Fetch error:', error);
        if (attempts >= 10) {
          alert('Failed to fetch a cat image after multiple attempts.');
        }
      }
    }
  };

  return (
    <div className='App'>
      <h1>Cat Attack 🐾</h1>
      <button onClick={fetchRandomCat}>Show Random Cat</button>
      {catImage && (
        <>
          <img src={catImage.url} alt={catImage.breed || 'Random Cat'} />
          <CatInfo cat={catImage} banList={banList} addToBanList={addToBanList} />
        </>
      )}
      {banList.length > 0 && (
        <>
          <h2>Ban List (click to remove from ban)</h2>
          <ul>
            {banList.map((breed, index) => (
              <li
                key={index}
                onClick={() =>
                  setBanList(banList.filter((b) => b !== breed))
                }
              >
                {breed}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
