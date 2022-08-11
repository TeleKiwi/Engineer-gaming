interface LangObject {
    [key: string]: any;
}

interface AllLangs {
    [key: string]: LangObject;
}

let languages: AllLangs = {
    "en-us": require("./en-us.json"), // Hamburger gun
    "pt-br": require("./pt-br.json"), // Ronalido soccer
    "fr": require("./fr.json"),       // No showers?
};

export class Lang {
    lang: LangObject = languages["en-us"];
    langName: string = "en-us";
    constructor(langName: string) {
        this.lang = languages[langName];
        this.langName = langName;
    }

    get(element: string,format?: any): any {
        let Result = this.lang[element];
        let NewFormat = format;
    
        if (NewFormat != undefined && !Array.isArray(NewFormat)) NewFormat = [format]; 
    
        if (typeof Result == "string" && NewFormat != undefined) {
            NewFormat.forEach((element: any, index: number) => {
                let NewElement = element;
                if (typeof NewElement == "number") NewElement = NewElement.toString();
                Result = Result.split("{" + index.toString() + "}").join(element);
            });
        }
    
        return Result;
    }
}