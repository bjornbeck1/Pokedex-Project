import React, {useState, useEffect, useMemo} from 'react';
import { Range } from 'react-range';
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

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
  const maxPokemon = 200; // temporary fix, 1302 overloads

  const [mode, setMode] = useState('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                background: {
                  default: '#121212',
                },
                card: {
                  background: '#1e1e1e',
                  hover: '#2c2c2c',
                },
              }
            : {
                background: {
                  default: '#f5f5f5',
                },
                card: {
                  background: '#ffffff',
                  hover: '#eaeaea',
                },
              }),
        },
      }),
    [mode]
  );

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/type')
      .then(res => res.json())
      .then(data => setTypes(data.results))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${maxPokemon}&offset=0`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch Pokémon list');
        return response.json();
      })
      .then((data) => {
        const pokemonDetailsPromises = data.results.map((pokemon) =>
          fetch(pokemon.url).then((res) => res.json())
        );

        Promise.all(pokemonDetailsPromises)
          .then((pokemonDetails) => {
            setPokemonList(pokemonDetails);  // full dataset
            setLoading(false);
          })
          .catch((err) => {
            setError(err.message);
            setLoading(false);
          });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);


  useEffect(() => {
    setPage(0);
  }, [filters]);

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

  const totalPages = Math.ceil(filteredPokemonList.length / limit);
  const [page, setPage] = useState(0);

  const paginatedList = filteredPokemonList.slice(page * limit, (page + 1) * limit);


  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const getGradientColor = (value, min, max) => {
    const percent = (value - min) / (max - min);
    const r = Math.round(255 * (1 - percent));
    const g = Math.round(255 * percent);
    return `rgb(${r}, ${g}, 0)`; // Red → Green
  };


  if (loading) {
    return <div>Loading...</div>;  // loading state
  }

  if (error) {
    return <div>{error}</div>;  // error message
  }

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          minHeight: '100vh',
          '--card-bg': theme.palette.card.background,
          '--card-hover': theme.palette.card.hover,
          '--app-bg': theme.palette.background.default,
          margin: 0,
          padding: 0,
        }}
      >
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </div>


        <h1 className="pokedex-title">Pokédex</h1>

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
          {paginatedList.map((pokemon) => (
            <div key={pokemon.id} className="card">
              <h3>{capitalize(pokemon.name)}</h3>
              <img src={pokemon.sprites.front_default} alt={pokemon.name} />
              <p>Type: {capitalize(pokemon.types[0].type.name)}</p>
              <p>
                Height: <span style={{ color: getGradientColor(pokemon.height, minHeight, maxHeight) }}>{pokemon.height}</span>
              </p>
              <p>
                Weight: <span style={{ color: getGradientColor(pokemon.weight, minWeight, maxWeight) }}>{pokemon.weight}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button onClick={() => setPage(page - 1)} disabled={page === 0} className="card">
            Previous Page
          </button>
          <span style={{ margin: '0 10px' }}> Page {offset / limit + 1} </span>
          <button onClick={() => setPage(page + 1)} disabled={page + 1 >= totalPages} className="card">
            Next Page
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
}

// to-do:
// deployment: github pages, follow guide
// dark/light mode: render property conditionally, possibly make own css file or use mui
//  - use themeprovider on mui for start