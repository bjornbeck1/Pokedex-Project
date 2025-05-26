import React, {useState, useEffect} from 'react';
import { Range } from 'react-range';
import './App.css';

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    heightRange: [0, 20],
    weightRange: [0, 1000],
  });
  const minHeight = 0;
  const maxHeight = 20;
  const minWeight = 0;
  const maxWeight = 1000;

  const limit = 20;
  const maxPokemon = 1302; // API limit

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/type')
      .then(res => res.json())
      .then(data => setTypes(data.results))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch Pokémon list'); // throw error if trouble getting list
        }
        return response.json();
      })
      .then((data) => {
        // fetch details for each pokemon in the list
        const pokemonDetailsPromises = data.results.map((pokemon) =>
          fetch(pokemon.url).then((res) => res.json())
        );

        Promise.all(pokemonDetailsPromises)
          .then((pokemonDetails) => {
            setPokemonList(pokemonDetails);  // set pokemon details
            setLoading(false);  
          })
          .catch((err) => {
            setError(err.message);  // error state
            setLoading(false);
          });
      })
      .catch((err) => {
        setError(err.message);  // error if fetching list fails
        setLoading(false);
      });
  }, [offset]); // reruns if offset changes

  const previousPage = () => { // go to previous page
    if (offset >= limit) {
      setOffset(offset - limit);
    }
  };

  const nextPage = () => { // go to next page
    if (offset + limit < maxPokemon) {
      setOffset(offset + limit);
    }
  };

  const filteredPokemonList = pokemonList.filter(pokemon => {
    const matchesType =
      !filters.type || pokemon.types.some(t => t.type.name === filters.type);
    const matchesHeight =
      pokemon.height >= filters.heightRange[0] && pokemon.height <= filters.heightRange[1];
    const matchesWeight =
      pokemon.weight >= filters.weightRange[0] && pokemon.weight <= filters.weightRange[1];

    return matchesType && matchesHeight && matchesWeight;
  });

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  if (loading) {
    return <div>Loading...</div>;  // loading state
  }

  if (error) {
    return <div>{error}</div>;  // error message
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Pokédex</h1>

      <div className="filters">
        <h3>Filters</h3>

        <label>Type: </label>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value=''>All</option>
          {types.map((type) => (
            <option key={type.name} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>

        <div className="slider-container" style={{ marginTop: '10px' }}>
          <label>Height Range: {filters.heightRange[0]} - {filters.heightRange[1]}</label>
          <Range
            step={1}
            min={minHeight}
            max={maxHeight}
            values={filters.heightRange}
            onChange={(values) =>
              setFilters({ ...filters, heightRange: values })
            }
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ccc',
                  margin: '10px 0'
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '20px',
                  width: '20px',
                  backgroundColor: '#999',
                  borderRadius: '50%',
                }}
              />
            )}
          />
        </div>

        <div className="slider-container" style={{ marginTop: '10px' }}>
          <label>Weight Range: {filters.weightRange[0]} - {filters.weightRange[1]}</label>
          <Range
            step={10}
            min={minWeight}
            max={maxWeight}
            values={filters.weightRange}
            onChange={(values) =>
              setFilters({ ...filters, weightRange: values })
            }
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ccc',
                  margin: '10px 0'
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '20px',
                  width: '20px',
                  backgroundColor: '#999',
                  borderRadius: '50%',
                }}
              />
            )}
          />
        </div>
      </div>

      <div className="pokemon-grid">
        {filteredPokemonList.map((pokemon) => (
          <div key={pokemon.id} className="card">
            <h3>{capitalize(pokemon.name)}</h3>
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            <p>Type: {capitalize(pokemon.types[0].type.name)}</p>
            <p>Height: {pokemon.height}</p>
            <p>Weight: {pokemon.weight}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={previousPage} className="card" disabled={offset === 0}>
          Previous Page
        </button>
        <span style={{ margin: '0 10px' }}> Page {offset / limit + 1} </span>
        <button onClick={nextPage} className="card" disabled={offset + limit >= maxPokemon}>
          Next Page
        </button>
      </div>
    </div>
  );
}

// to-do:
// deployment: github pages, follow guide
// dark/light mode: render property conditionally, possibly make own css file or use mui
//  - use themeprovider on mui for start