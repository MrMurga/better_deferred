const DEFERRED = 'better_deferred';
const DEFERRED_LOADED = 'loaded_better_deferred';
const TIMEOUT = 200;

const log = (s, level = 0) => {
    let txt = `[${new Date().getTime()} - ${s}`;
    if(level == 1) {
        console.log(txt);
    } else {
        console.debug(txt);
    }
}

const decorate = (element, callback = null) => {
    let attrs = element ? element.attributes : null
    do {
        if (!attrs) {
            break;
        }

        const newElement = document.createElement('script')
        for (const attr of attrs) {
            newElement.setAttribute(attr.name, attr.value)
        }
        let newType = (element.dataset.mimeType ? element.dataset.mimeType : "text/javascript")
        newElement.type = newType
        newElement.innerHTML = element.innerHTML
        document.body.appendChild(newElement)
        element.type = DEFERRED_LOADED
    } while(false)
    
    if (callback) {
        callback.call()
    }
}

const addScriptObjects = (element, callback = null) => {
    log('Added script ' + element.src);
    decorate(element, callback);
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

const loadScriptsFromQueue = (queue) => queue.forEach((elem) => addScriptObjects(elem));

const fetchBetterDeferred = (parent = document) => {
    const queue = Array.from(parent.querySelectorAll(`script[type^="${DEFERRED}"]`));

    // Since we want to preserve the load order and load external scripts first and then inline scripts.
    return [
        ...queue.filter((elem) => elem.innerHTML === ''),
        ...queue.filter((elem) => elem.innerHTML !== ''),
    ];
}

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
        let queue = this.getQueue()
        let elem = queue ? queue.shift() : null;
        if (!elem) {
            log('Complete', 1);
            return ;
        }
        log(`Another script processed. Remaining. ${this.getQueue().length}`);

        let callback = () => {
            setTimeout(() => {
                log(`callback applied`);
                self.next.apply(self);
            }, TIMEOUT);
        }

        addScriptObjects(elem, callback);
    }
}
