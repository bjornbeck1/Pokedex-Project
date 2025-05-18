import React, {useState, useEffect} from 'react';

export default function App() {
  const [pokemonList, setPokemonList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const maxPokemon = 1302; // API limit

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

  const previousPage = () => {
    if (offset >= limit) {
      setOffset(offset - limit);
    }
  };

  const nextPage = () => {
    if (offset + limit < maxPokemon) {
      setOffset(offset + limit);
    }
  };

  if (loading) {
    return <div>Loading...</div>;  // loading state
  }

  if (error) {
    return <div>{error}</div>;  // error message
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Pokédex</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {pokemonList.map((pokemon) => (
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