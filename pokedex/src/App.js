import React, {useState, useEffect} from 'react';

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

  if (loading) {
    return <div>Loading...</div>;  // loading state
  }

  if (error) {
    return <div>{error}</div>;  // error message
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Pokédex</h1>

      <div style={{ textAlign: 'left', margin: '20px' }}>
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

        <div style={{ marginTop: '10px' }}>
          <label>Height Range: {filters.heightRange[0]} - {filters.heightRange[1]}</label><br />
          <input
            type="range"
            min="0"
            max="20"
            value={filters.heightRange[0]}
            onChange={(e) =>
              setFilters({
                ...filters,
                heightRange: [Number(e.target.value), filters.heightRange[1]],
              })
            }
          />
          <input
            type="range"
            min="0"
            max="20"
            value={filters.heightRange[1]}
            onChange={(e) =>
              setFilters({
                ...filters,
                heightRange: [filters.heightRange[0], Number(e.target.value)],
              })
            }
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Weight Range: {filters.weightRange[0]} - {filters.weightRange[1]}</label><br />
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.weightRange[0]}
            onChange={(e) =>
              setFilters({
                ...filters,
                weightRange: [Number(e.target.value), filters.weightRange[1]],
              })
            }
          />
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.weightRange[1]}
            onChange={(e) =>
              setFilters({
                ...filters,
                weightRange: [filters.weightRange[0], Number(e.target.value)],
              })
            }
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {filteredPokemonList.map((pokemon) => (
          <div key={pokemon.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
            <h3>{pokemon.name}</h3>
            <img src={pokemon.sprites.front_default} alt={pokemon.name} style={{ width: '100px', height: '100px' }} />
            <p>Type: {pokemon.types[0].type.name}</p>
            <p>Height: {pokemon.height}</p>
            <p>Weight: {pokemon.weight}</p>
          </div>
        ))}
      </div>

      <div>
        <button onClick={previousPage} disabled={offset === 0}>
          Previous Page
        </button>
        <span style={{ margin: '0 10px' }}> Page {offset / limit + 1} </span>
        <button onClick={nextPage} disabled={offset + limit >= maxPokemon}>
          Next Page
        </button>
      </div>
    </div>
  );
}

// extensions:
// filters: conditional logic, i.e. only display "grass" type or only display pokemon with height >= 7
// deployment: github pages, follow guide
// dark/light mode: render property conditionally, possibly make own css file or use mui
// --- use themeprovider on mui for start

// goals:
// styling + extensions