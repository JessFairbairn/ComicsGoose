//Page Setup
const storageService = new StorageService();
const nameService = new NameService;

document.getElementById("mark-button").onclick = () => {
    saveNewComic().then(() => {
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
function loadComicList() {
    const comicsDropdown = document.getElementById('comics-dropdown')
    comicsDropdown.innerHTML = null;

    storageService.getComics().then(comics => {
        if(!comics || !comics.length) {
            document.getElementById('new-comic-name').style.display = 'initial';
            comics = [];
        }
        else {
            document.getElementById('new-comic-name').style.display = 'none';
        }

        for(let comic of comics){
            let option = document.createElement("option");
            option.innerText = comic.title;
            option.value = comic.title;
            comicsDropdown.appendChild(option)
        }

        let newComicOption = document.createElement("option");
        newComicOption.innerText = 'New Comic...';
        newComicOption.value = '';
        comicsDropdown.appendChild(newComicOption);
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

function saveNewComic(){
    let selected = document.getElementById('comics-dropdown').value;

    if(!selected){
        selected = document.getElementById('new-comic-name').value;
    }

    var query = { active: true, currentWindow: true };

    return browser.tabs.query(query).then(
        tabArray => url = tabArray[0].url
    ).then(
        url => storageService.saveComic(selected, url)
    ).catch(error => {
        alert("Error saving comic!");
        console.log(error);
    });
}

function reloadPages(e) {
    var sending = browser.runtime.sendMessage({
      command: "reload"
    });
    // sending.then(handleResponse, handleError);  
}