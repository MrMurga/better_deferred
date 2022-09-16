const INLINE = 'better_deferred_inline';
const DEFERRED = 'better_deferred';
const TIMEOUT = 200;

const log = (s, level = 0) => {
    let txt = `[${new Date().getTime()} - ${s}`;
    if(level == 1) {
        console.log(txt);
    } else {
        console.debug(txt);
    }
}

const decorate = (element, inline, callback = null) => {
    var s = document.createElement("script");    
    if (inline) {
        s.innerHTML = element.innerHTML;
    } else {
        s.src = element.src;
    }
    s.type = "text/javascript";
    s.addEventListener("load", element.onload);
    element.type = `${element.type}_loaded`
    document.body.appendChild(s);
    callback?.call();
}

const addScriptObjects = (element, callback = null) => {
    log('Added script ' + element.src);
    decorate(element, false, callback);
}

const addInlineScriptObjects = (element, callback = null) => {
    log('Added inline script');
    decorate(element, true, callback);
}

const fastLoadObserver = (betterDeferredObj) => {
    let elems = document.querySelectorAll(".better_deferred_trigger");
    if (elems.length == 0) {
        return ;
    }

    const trigger = () => { 
        betterDeferredObj.start();
    }

    elems.forEach((element) => {
        element.addEventListener("mouseover", trigger, { once: true });
        element.addEventListener("touchmove", trigger, { once: true });
        element.addEventListener("focus", trigger, { once: true });
    });

}

const lozadObserver = () => {  
    let lozads = document.querySelectorAll(".lozad");
    if (lozads.length == 0) {
        return ;
    }

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, characterData: true };

    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        for(const mutation of mutationsList) {
            let loaded = (mutation.type === 'attributes' && mutation.attributeName == 'data-loaded' && mutation.target.dataset.loaded);
            if (!loaded) {
                continue;
            }

            log(`Script in lozad will be loading now`, 1);
            let queue = fetchBetterDeferred(mutation.target);
            loadScriptsFromQueue(queue);
            
            // Stop observing
            observer.disconnect();  
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    
    lozads.forEach((element) => {
        // Start observing the target node for configured mutations
        observer.observe(element, config);
    });
}

const loadScriptsFromQueue = (queue) => {
    for(const elem of queue) {
        let inline = elem.type == INLINE;
        log(`Processing lozad script - inline? ${inline}`);
        if (!inline) {
            addScriptObjects(elem);
        } else {
            addInlineScriptObjects(elem);
        }
    }
}

const fetchBetterDeferred = (parent = document) => {
    let queue = [];
    let externalScripts = parent.querySelectorAll("script[type=" + DEFERRED + "]");
    externalScripts.forEach((element) => {
        queue.push(element);
    });

    let inlineScripts = parent.querySelectorAll("script[type=" + INLINE + "]");
    inlineScripts.forEach((element) => {
        queue.push(element);
    });

    log(`Found ${externalScripts.length} ext scripts, ${inlineScripts.length} inline scripts. Queue ${queue.length}`, 1);
    return queue;
};

let self = null;
export class BetterDeferred {
    constructor(delay) {
        self = this;
        document.addEventListener("DOMContentLoaded", function() {
            fastLoadObserver(self);
            lozadObserver();
            setTimeout(() => {
                self.start();
            }, delay);
        });
    }

    start() {
        let callback = function () {
            self.queue = fetchBetterDeferred();
            self.next();
        };
        
        log("Loading deferred scripts", 1);
        callback.apply(self);
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

        let callback = () => {
            setTimeout(() => {
                log(`callback applied`);
                self.next.apply(self);
            }, TIMEOUT);
        }

        if (!inline) {
            addScriptObjects(elem, callback);
        } else {
            addInlineScriptObjects(elem, callback);
        }
    }
}
