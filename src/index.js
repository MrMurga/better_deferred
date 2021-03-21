import { BetterDeferred } from "./better_deferred";

// Export this object to window [ window['_bd_name'] ] if set.
window['_bd_name'] = window['_bd_name'] || '_bd';

// Export object
window[window['_bd_name']] = (() => {
    return window[window['_bd_name']] || new BetterDeferred();
})();

