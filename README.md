Easily link the contents of any entity within a Tweet from the Twitter API.

- - - - - - -

Tweemat is a lightweight script that takes any entity from a Twitter API
timeline and nicely formats it for the web. From the plain text contents of
tweet's text, it will find all mentions of users, media, links, and hashtags
and link them back to the web. Tweemat is capable of being used within Node.JS,
AMD, or the browser.

# Downloading
**Node.js**
`npm install tweemat --save`
```
var Tweemat = require('tweemat');
```

**Bower**
`bower install --save tweemat`

**Other**
1. Clone the repo: `git clone https://github.com/dcompute/tweemat.git` or
  download the latest [ZIP](https://github.com/dcompute/tweemat/archive/master.zip):
2. Move `./src/tweemat.js` to the desired directory within your project.
3. Include the script via unknown means.

**Browser**
```html
<script src="tweemat.js"></script>
```

**Require.js**
```javascript
require.config({
  paths: {
    "Tweemat": "path/to/tweemat",
  }
});
define(["Tweemat"], function (Tweemat) {
  ...
});
```

# Using
Tweemat is designed for use on single tweet representations. To work with a
tweet, create an object from the Tweemat constructor by passing it a single
[tweet representation](https://dev.twitter.com/rest/reference/get/statuses/show/%3Aid).

```javascript
var tweet = new Tweemat(twitterTimeline[tweetIndex]);
return '<li>' + tweet.linkAllEntities() + '</li>';
```

## Link All Entities
Call `#linkAllEntities()` to return a tweet's text with all entities replaced
with links.
