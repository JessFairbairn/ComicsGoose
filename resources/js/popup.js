//Page Setup
import {NameService} from './services/name.js';
import {StorageService} from './services/storage.js';
const storageService = new StorageService();
const nameService = new NameService;

document.getElementById("mark-button").onclick = () => {
    saveComicPosition().then(() => {
        loadComicList();
        reloadPages();
    });
};
document.getElementById('sidebar-button').onclick = () => {
    browser.sidebarAction.open();
}

document.getElementById('comics-dropdown').onchange = comicListChange;

//load current page title
let pageTitle;
browser.tabs.query({ active: true, currentWindow: true }).then(
    tabArray => {
        pageTitle = tabArray[0].title;
        document.getElementById('new-comic-name').value = nameService.generateComicName(pageTitle);
    }
);

loadComicList();

//Functions
function getUrlOfOpenTab(){
    const query = { active: true, currentWindow: true };

    return browser.tabs.query(query).then(
        tabArray => tabArray[0].url
    );
}

function loadComicList() {
    const comicsDropdown = document.getElementById('comics-dropdown')
    comicsDropdown.innerHTML = null;

    getUrlOfOpenTab().then(url =>
        Promise.all([storageService.getComics(), storageService.searchComicsByDomain(url)])
    ).then(results => {
        let comics = results[0];
        let comicsOnDomain = results[1];

        if(!comics.length || !comicsOnDomain.length) {
            document.getElementById('new-comic-name').style.display = 'initial';
        }
        else {
            document.getElementById('new-comic-name').style.display = 'none';
        }

        if(comicsOnDomain.length){
            let suggestedGroup = document.createElement("optgroup");
            comicsDropdown.appendChild(suggestedGroup)

            for(let comic of comicsOnDomain){
                let option = document.createElement("option");
                option.innerText = comic.title;
                option.value = comic.title;
                comicsDropdown.appendChild(option)
            }
        }

        for(let comic of comics){
            if(comicsOnDomain.some(alreadyListed => alreadyListed.url === comic.url)){
                continue;
            }

            let option = document.createElement("option");
            option.innerText = comic.title;
            option.value = comic.title;
            comicsDropdown.appendChild(option)
        }

        let newComicOption = document.createElement("option");
        newComicOption.innerText = 'New Comic...';
        newComicOption.value = '';
        comicsDropdown.appendChild(newComicOption);

        if(!comicsOnDomain.length){
            newComicOption.selected = true;
        }
    });
}

function comicListChange(event){
    let selected = event.target.value;
    let comicNameInput = document.getElementById('new-comic-name')
    if(!selected){
        comicNameInput.style.display = 'initial';
    } else {
        comicNameInput.style.display = 'none';
    }
}

function saveComicPosition(){
    let selected = document.getElementById('comics-dropdown').value;

    if(!selected){
        selected = document.getElementById('new-comic-name').value;
    }

    return getUrlOfOpenTab().then(url => storageService.saveComic(
            selected, url
        )).catch(error => {
            alert("Error saving comic!");
            console.error(error);
        });
}

function reloadPages(e) {
    browser.runtime.sendMessage({
      command: "reload"
    }).catch(error => console.debug(error));
}