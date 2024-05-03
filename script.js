document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('in1');
    const searchButton = document.querySelector('.buttonSearch');
    const containerInfo = document.querySelector('.containerInfo');
    const pokemonName = document.querySelector('.pokemonName');
    const pokemonImg = document.querySelector('.pokemonImg');
    const pokemonType = document.querySelector('.pokemonType');
    const pokemonDescription = document.querySelector('.pokemonDescrition');
    const pokemonAbilities = document.querySelector('.pokemonAbilities');
    const errorContainer = document.querySelector('.containerError');
    const evolutionButton = document.querySelector('.buttonEvolution');

    searchButton.addEventListener('click', () => {
        const pokemonNameValue = searchInput.value.toLowerCase();
        getPokemonInfo(pokemonNameValue);
    });

    async function getPokemonInfo(pokemonName) {
        try {
            const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            const pokemonData = pokemonResponse.data;
            const speciesResponse = await axios.get(pokemonData.species.url);
            const speciesData = speciesResponse.data;
            const evolutionChainResponse = await axios.get(speciesData.evolution_chain.url.replace('-species', '')); // Ajuste aquí
            const evolutionChainData = evolutionChainResponse.data;
            
            displayPokemonInfo(pokemonData, speciesData, evolutionChainData);
        } catch (error) {
            displayError();
        }
    }

    function displayPokemonInfo(pokemonData, speciesData, evolutionChainData) {
        pokemonName.textContent = pokemonData.name;
        pokemonImg.src = pokemonData.sprites.front_default;
        pokemonType.textContent = `Tipo: ${pokemonData.types.map(type => type.type.name).join(', ')}`;
        pokemonAbilities.textContent = `Habilidades: ${pokemonData.abilities.map(ability => ability.ability.name).join(', ')}`;
        pokemonDescription.textContent = `Descripción: ${speciesData.flavor_text_entries.find(entry => entry.language.name === 'es').flavor_text}`;

        const nextEvolutionName = getNextEvolutionName(evolutionChainData, pokemonData.name);
        if (nextEvolutionName) {
            evolutionButton.style.display = 'block';
            evolutionButton.addEventListener('click', () => {
                getPokemonInfo(nextEvolutionName);
            });
        } else {
            evolutionButton.style.display = 'none';
        }

        containerInfo.style.display = 'block';
        errorContainer.style.display = 'none';
    }

    function getNextEvolutionName(evolutionChainData, currentPokemonName) {
        const chain = evolutionChainData.chain;
        if (chain.species.name === currentPokemonName) {
            if (chain.evolves_to.length > 0) {
                return chain.evolves_to[0].species.name;
            }
        } else {
            for (let i = 0; i < chain.evolves_to.length; i++) {
                const evolvesTo = chain.evolves_to[i];
                if (evolvesTo.species.name === currentPokemonName) {
                    if (evolvesTo.evolves_to.length > 0) {
                        return evolvesTo.evolves_to[0].species.name;
                    }
                }
            }
        }
        return null;
    }

    function displayError() {
        containerInfo.style.display = 'none';
        errorContainer.style.display = 'block';
    }
});
