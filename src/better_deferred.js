const INLINE = 'better_deferred_inline';
const DEFERRED = 'better_deferred';
const INIT_TIMEOUT = 5000;
const TIMEOUT = 200;

const log = (s, level = 0) => {
    let txt = `[${new Date().getTime()} - ${s}`;
    if(level == 1) {
        console.log(txt);
    } else {
        console.debug(txt);
    }
}

const addScriptObjects = (self_obj, element) => {
    var s = document.createElement("script");
    setTimeout(() => {
        log(`Loaded src: ${element.src}`);
        self_obj.next(self_obj);
    }, TIMEOUT);
    
    s.type = "text/javascript";
    s.src = element.src;
    document.body.appendChild(s);
}

const addInlineScriptObjects = (self_obj, element) => {
    log('Added inline script');
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.innerHTML = element.innerHTML;
    document.body.appendChild(s);

    setTimeout(() => {
        log(`Loaded inline`);
        self_obj.next(self_obj);
    }, TIMEOUT);
}

const fetchBetterDeferred = () => {
    let queue = [];
    let externalScripts = document.querySelectorAll("script[type=" + DEFERRED);
    externalScripts.forEach((element) => {
        queue.push(element);
    });

    let inlineScripts = document.querySelectorAll("script[type=" + INLINE);
    inlineScripts.forEach((element) => {
        queue.push(element);
    });

    log(`Found ${externalScripts.length} ext scripts, ${inlineScripts.length} inline scripts. Queue ${queue.length}`, 1);
    return queue;
};

export class BetterDeferred {
    constructor() {
        let self_obj = this;
        let callback = function () {
            this.queue = fetchBetterDeferred();
            this.next();
        };
        
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout((self_obj) => {
                callback.apply(self_obj);
            }, INIT_TIMEOUT, self_obj);
        });
    }
    
    getQueue() {
        return this.queue;
    }

    next() {
        let elem = this.getQueue()?.shift();
        if (!elem) {
            log('Complete', 1);
            return ;
        }
        let inline = elem.type == INLINE;
        log(`Another script processed. Remaining. ${this.getQueue().length} - inline? ${inline}`);
        if (!inline) {
            addScriptObjects(this, elem);
        } else {
            addInlineScriptObjects(this, elem);
        }
    }
}
