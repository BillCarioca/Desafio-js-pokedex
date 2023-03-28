const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
var pokedexList = [];
const maxRecords = 9999;
const limit = 25;
let offset = 0;
let likedParam = '';
const popup = document.getElementById('popup');
const modal = document.getElementById('modal');
let infoDetails = document.querySelector('.infoModal');

function convertPokemonToLi(pokemon) {
    return `
        <button class="pokemon ${pokemon.type}"  onclick="openModal(${pokemon.number})">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>
                <section class="pokemon__card">
                    <img src="${pokemon.photo}" alt="Imagem do ${pokemon.name}">
                </section>
            </div>
        </button>
    `
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        pokemons.forEach(pokemon=>pokedexList.push(pokemon))
        const newHtml = pokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newHtml
    })
}


loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        loadPokemonItens(offset, newLimit)

        loadMoreButton.parentElement.removeChild(loadMoreButton)
    } else {
        loadPokemonItens(offset, limit)
    }
})
//Abre janela Modal
function openModal(pokemonId) {
    const pokemon = pokedexList[pokemonId-1];
    const newModal = buildModal(pokemon);
    modal.style.display = 'block';
    modal.classList.add(`${pokemon.type}`);    
    modal.innerHTML += newModal;

    //Monta informações iniciais menu
    let menuInfo = document.querySelector('.infoModal');
    let elements = document.querySelectorAll('.menuModal button');
    let id;

    elements.forEach (e => {
        if (e.classList.contains("selected")) 
            id = e.id
    })
    
    let msg = details(id, pokemonId);
    menuInfo.innerHTML = msg;

    //Chama função de formatar dados
    formatData();

    //Esconde a barra de rolagem do corpo da página
    let content = document.querySelector('body');
    content.style.overflowY  = 'hidden';
}

//Fecha janela Modal do pokemon
function closeModal(pokemonId) {
    const pokemon = pokedexList[pokemonId-1];
    modal.classList.remove(`${pokemon.type}`);
    modal.style.display = "none";
    modal.innerHTML = "";

    //Volta a barra de rolagem do corpo da página
    const content = document.querySelector('body');
    content.style.overflowY  = 'scroll';
}

//Constrói a janela modal do Pokemon selecionado
function buildModal(pokemon) {
    return `
    <div class="header">
        <div class="buttons">
            <div class="back">
                <button onclick="closeModal(${pokemon.number})">
                    Back
                </button>
            </div>
        </div>
        <div class="infos">
            <div class="detail">
                <span class="name">${pokemon.name}</span>
                <ol class="types">
                ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>
            </div>
            <span class="number">#${pokemon.number}</span>
        </div>
        <div class="photo">
            <img src="${pokemon.photo}" alt="Imagem do ${pokemon.name}">
        </div>
    </div>
    <div class="detailsModal">
        <ul class="menuModal">
            <button id="menu1" class="selected" onclick="menuSelector('menu1', '${pokemon.number}')">
                <li>About</li>
            </button>
            <button id="menu2" class="" onclick="menuSelector('menu2', '${pokemon.number}')">
                <li>Base Stats</li>
            </button>
            <button id="menu3" class="" onclick="menuSelector('menu3', '${pokemon.number}')">
                <li>Evolution Chain</li>
            </button>
            <button id="menu4" class="" onclick="menuSelector('menu4', '${pokemon.number}')">
                <li>Moves</li>
            </button>
        </ul>
        <hr>
        <div class="infoModal">
        </div>
    </div>
    `
}

//Formata Movimentos
function formatMoves(pokemonId){
    let moves = document.querySelector('.moves table tbody');
    const pokemon = pokedexList[pokemonId-1];
    let movesUpperText = pokemon.moves;
    
    let upper = movesUpperText.map ((e) => {
        return '• ' + e.charAt(0).toUpperCase() + e.substring(1) + '<br />';
    })
    
    for(i=0; i < upper.length; i+=2){      
        if (upper [i+1] != undefined){
            moves.innerHTML += `<td>${upper[i]}</td>
                                <td>${upper[i+1]}</td>`;
        } else {
            moves.innerHTML += `<td>${upper[i]}</td>`;
        }
    }
}

//Formata Evoluções
function formatEvolutions(pokemonId){
    const pokemon = pokedexList[pokemonId-1];

    let upperName = pokemon.evolutions.map ((e) => {
        return ' ' + e.charAt(0).toUpperCase() + e.substring(1);
    })
    
    let imgPokemons = pokemon.evolutionsSprites.map((evolvUrl, index) => {
        return `<div><img src='${evolvUrl}'> <label>${upperName[index]}</label></div>`
    })

    return imgPokemons.join('');
}

//Formata demais características
function formatData(){
    //Formata habilidades
    let abilitiesUpper = document.querySelector('.abilities');
    let abilitiesUpperText = document.querySelector('.abilities').textContent;
    let splitString = abilitiesUpperText.split(',');
    
    let upper = splitString.map ((e) => {
        return e.charAt(0).toUpperCase() + e.substring(1);
    })
    
    abilitiesUpper.innerHTML = upper.join(', ');

    //Formata Peso
    let weight = document.querySelector('.weight');
    let weightText = document.querySelector('.weight').textContent;
    let newWeight = weightText.substring(0,weightText.length-1) + "." + weightText.substring(weightText.length-1);
    
    weight.innerHTML = newWeight + ' kg';

    //Formata Altura
    let height = document.querySelector('.height');
    let heightNumber = parseInt(document.querySelector('.height').textContent);
    let newHeight = (heightNumber * 10) / 100;
    
    if (parseInt(newHeight) == 0){
        height.innerHTML = newHeight.toFixed(2) + ' cm';
    } else {
        height.innerHTML = newHeight.toFixed(2) + ' m';
    }
}

//Seleção do menu
function menuSelector(id, pokemonId) {
    let menuId = document.getElementById(id);
    let elements = document.querySelectorAll('.menuModal button');
    let menuInfo = document.querySelector('.infoModal');
    let msg, selected;

    elements.forEach (e => {
        if (e.classList.contains("selected")) 
            selected = e.id
    })

    document.getElementById(selected).classList.remove('selected'); 
    menuId.classList.add('selected'); 
    
    msg = details(id, pokemonId);
    menuInfo.innerHTML = msg;

    //Dependendo do menu, chama a função espeficica referente aos dados
    if (menuId.id == 'menu1') formatData();
    if (menuId.id == 'menu2') barColors(pokemonId);
    if (menuId.id == 'menu3') formatEvolutions(pokemonId);
    if (menuId.id == 'menu4') formatMoves(pokemonId);
}

//Ajuste das barras de atributos
function barColors (pokemonId){
    let colorBar = document.querySelectorAll('.health-bar div');
    const pokemon = pokedexList[pokemonId-1];
    let stats = pokemon.stats;
    let maxWidthBar = 200, maxAttribute = 225, newWidthBar = 0;

    for (let i = 0; i < colorBar.length; i++){
        //Ajusta cor das barras
        if (stats[i] > 75) {
            colorBar[i].classList.add("bar-green");
            colorBar[i].classList.remove("bar-red");            
        } else {
            colorBar[i].classList.add("bar-red");
            colorBar[i].classList.remove("bar-green");
        }

        //Ajustar largura das barras
        newWidthBar = (stats[i] * maxWidthBar) / maxAttribute;
        colorBar[i].style.width = newWidthBar + 'px';
    }
}

//Menu de detalhes
function details(param, pokemonId){
    const pokemon = pokedexList[pokemonId];

    if(param == 'menu1'){
        return `
        <div class="infosPokemon">
        <div class="about1">
            <div><label class="text-gray">Base. Exp.</label> <label>${pokemon.baseExp} exp.</label></div>
            <div><label class="text-gray">Height</label> <label class="height">${pokemon.height}</label></div>
            <div><label class="text-gray">Weight</label> <label class="weight">${pokemon.weight}</label></div>
            <div><label class="text-gray">Abilities</label> <label class="abilities">${pokemon.abilities}</label></div>
            <div><label class="text-gray">Egg Groups</label> <label class="eggs">${pokemon.eggGroups}</label></div>
            <div><label class="text-gray">Generation</label> <label class="generation">${pokemon.generation}</label></div>
        </div>
        <div class="about2">
        <h4> Description </h4>
            <label>${pokemon.description}</label>
        </div>
        </div>
        `
    } else if(param == 'menu2'){
        return `
        <div class="about1">
            <div
                <label class="text-gray">HP</label>
                <div class="hp">
                    <label class="text-black">${pokemon.stats[0]}</label> 
                    <div class="health-bar">
                        <div class="bar-red">
                        </div>
                    </div>
                </div>
            </div>
            <div
                <label class="text-gray">Attack</label>
                <div class="atk">
                    <label class="text-black">${pokemon.stats[1]}</label> 
                    <div class="health-bar">
                        <div class="bar-red">
                        </div>
                    </div>
                </div>
            </div>
            <div
                <label class="text-gray">Defense</label>
                <div class="dfs">
                    <label class="text-black">${pokemon.stats[2]}</label> 
                    <div class="health-bar">
                        <div class="bar-red">
                        </div>
                    </div>
                </div>
            </div>
            <div
                <label class="text-gray">Sp. Atk.</label>
                <div class="sp-atk">
                    <label class="text-black">${pokemon.stats[3]}</label> 
                    <div class="health-bar">
                        <div class="bar-red">
                        </div>
                    </div>
                </div>
            </div>
            <div
                <label class="text-gray">Sp. Def.</label>
                <div class="sp-def">
                    <label class="text-black">${pokemon.stats[4]}</label> 
                    <div class="health-bar">
                        <div class="bar-red">
                        </div>
                    </div>
                </div>
            </div>
            <div
                <label class="text-gray">Speed</label>
                <div class="spd">
                    <label class="text-black">${pokemon.stats[5]}</label> 
                    <div class="health-bar">
                        <div class="bar-red">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    } else if(param == 'menu3'){
        return `
        <div class="about1">
            <div class="imgEvolutions">${formatEvolutions(pokemonId)}</div>
            <label class="evolutions"></label>
        </div>
        `
    } else if(param == 'menu4'){
        return `
        <div class="about1">
            <label class="moves">
                <table>
                    <tbody></tbody>
                </table>
            </label>
        </div>
        `
    }
}