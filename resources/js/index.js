//Page Setup
import StorageService from './services/storage.js'
const storageService = new StorageService();

document.getElementById("delete-button").onclick = deleteComic;
loadComicList();

//Functions
function loadComicList(){
    const comicsList = document.getElementById('comics-list');
    storageService.getComics().then(comics => {
        comicsList.innerHTML = null;
        if(!comics || !comics.length){
            document.getElementById('no-comics-message').style.display = 'block';            
            return;
        }

        document.getElementById('no-comics-message').style.display = 'none';            

        for(let comic of comics){
            let listItem = document.createElement("li");
            let radioButton = document.createElement("input");
            radioButton.setAttribute('type', 'radio');
            radioButton.setAttribute('name', 'selected-comic');
            radioButton.setAttribute('value', comic.title);
            listItem.appendChild(radioButton);

            let link = document.createElement("a");            
            link.innerText = comic.title;
            link.setAttribute('href', comic.url);
            listItem.appendChild(link);

            comicsList.appendChild(listItem)
        }
    },

    error => console.log(error));
}

function deleteComic(event) {
    let nodes = Array.from(document.getElementsByName('selected-comic'));
    let title = nodes.filter(radioButton => radioButton.checked)[0].value;

    storageService.deleteComic(title).then(loadComicList);
}

function handleMessage(request, sender, sendResponse) {
    console.debug("Command received: " + request.command);
    switch(request.command){
        case "reload":
            loadComicList();
            sendResponse({response: "Response from background script"});
            break;
        default:
            console.warn(`Sidebar didn't recognise command '${request.command}'`);
    }
  }
  
  browser.runtime.onMessage.addListener(handleMessage);

// Update the comics list on a firefox sync.
browser.storage.sync.onChanged.addListener(changes => loadComicList());
