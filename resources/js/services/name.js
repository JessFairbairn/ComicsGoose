export default class NameService {
    

    generateComicName(pageTitle){
        const splitTokens = ['»', '-', ':'];

        for (let token of splitTokens){
            if(pageTitle.indexOf(token) > 0){
                pageTitle = pageTitle.split(token)[0];
            }
        }

        return pageTitle.trim();
    }
}
