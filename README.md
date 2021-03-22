# better_deferred
This is a depedency-free lightweight library that completely defers the download and evaluation of external Javascript post document.ready (plus a small delay) resulting in improved performance compared to using native defer or async. Native async / defer don't prevent the browser from downloading and evaluating external scripts prior to firing off document.ready which degrades performance and lighthouse scores.

The small delay is set to 5000 ms by default but it's customizable. This delay will allow you to get reduce time-to-interactive delays and will bring you closer to getting a high Lighthouse Performance score.

Please note that not all scripts are a good candidate to defer. For example, jQuery and Bootstrap are common libraries expected to be loaded as soon as possible in a page request.

**Examples**

The following scripts is executed after (document.ready + 5 seconds):
```
<script type="better_deferred_inline" onload="console.log('loaded inline script');">
   alert('loaded');
</script>
```

```
<script type="better_deferred" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" onload="console.log('loaded external script');></script>
```

External scripts are loaded first (in the order they appear), then inline scripts follow (in the order they appear).
# Support for lozad
A case I wanted to support is to load external scripts earlier if they become relevant to the user by detecting whether lozad has loaded related elements in the page.

For example, if an element to declare Calendly isn't visible yet, then I'd like to lazy load the Calendly script except if the element becomes visible and the user is likely to interact with it. So this library sets Mutation observers for `better_deferred` and `better_deferred_inline` scripts when the parent has the `lozad` class. Upon lozad making the element visible, this library detects changes to `data-loaded` and will immediate start loading all deferred scripts.

## Customization
By default inline scripts and external scripts will be 
```
window['_bd_timeout'] = 5000;
```

To prevent name collision, this library is instantiated in 
`window[window['_bd_name']]`. This means that you can use the following pattern to set where this object is stored.

```
window['_bd_name'] = '_new_name_to_prevent_collisions'
```

## Development
```
npm run watch
```
## Build
```
npm run build
```

## Publish
```
npm publish
```

# Creating Repo
Inspiration from:
- https://www.cybergrx.com/resources/research-and-insights/blog/how-to-create-a-barebones-production-ready-npm-package-with-babel-7
- https://docs.npmjs.com/
