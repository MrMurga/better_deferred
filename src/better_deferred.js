const $ = require( "jquery" );

const INLINE = 'better_deferred_inline';
const DEFERRED = 'better_deferred';
const INIT_TIMEOUT = 4000;
const TIMEOUT = 200;

const log = (s) => {
    console.log(`[${new Date().getTime()} - ${s}`);
}

const addScriptObjects = (self_obj, element) => {
    var s = document.createElement("script");
    setTimeout(() => {
        log(`Loaded src: ${element.src}`);
        self_obj.next(self_obj);
    }, TIMEOUT);
    
    s.type = "text/javascript";
    s.src = element.src;
    $('body').append(s);
}

const addInlineScripts = (element) => {
    log('Added inline script');
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.innerHTML = $(element).html();
    $('body').append(s);
}

const _setVariables = () => {
    let queue = [];
    let externalScripts = $("script[type=" + DEFERRED);
    externalScripts.each((_index, element) => {
        queue.push(element);
    });

    let inlineScripts = $("script[type=" + INLINE);
    inlineScripts.each((_index, element) => {
        queue.push(element);
    });

    log(`Found ${externalScripts.length} ext scripts, ${inlineScripts.length} inline scripts. Queue ${queue.length}`);

    return queue;
};

export class BetterDeferred {
    constructor() {
        let callback = function () {
            log('Starting');
            this.queue = _setVariables();
            this.next();
        };
        
        $(document).ready(() => {
            log('Prepping');
            setTimeout((self) => {
                callback.apply(self);
            }, INIT_TIMEOUT, this);
        })
    }
    
    getQueue() {
        return this.queue;
    }

    next() {
        let elem = this.getQueue().shift();
        if (!elem) {
            return ;
        }
        let inline = $(elem).attr('type') == INLINE;
        log(`Another script processed. Remaining. ${this.getQueue().length} - inline? ${inline}`);
        if (!inline) {
            addScriptObjects(this, elem);
        } else {
            addInlineScripts(elem);
        }
    }
}
