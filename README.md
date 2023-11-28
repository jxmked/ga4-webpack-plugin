# ga4-webpack-plugin

Injecting gtag snippet into HTML for Analytics

## Install

`npm install ga4-webpack-plugin --save-dev`

## Setup

```js
// webpack.config.js

const GA4WebpackPlugin = require('ga4-webpack-plugin');

module.exports = {
  ....

  plugins: [
    new GA4WebpackPlugin({
      // Your GTag ID. Required
      id: "GA_MEASUREMENT_ID",

      // Insert into html (true by default)
      inject: true | false,

      // Automatically call page view (true by default)
      callPageView: true | false
    })
  ]
}
```

Place this `<ga4.analytics />` in to your index.html where to inject the gtag or else it won't inject it.

## What kind of thing is about to inject?

```html
<!-- Google tag (gtag.js) -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());

  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

but

```js
gtag('js', new Date());
gtag('config', GA_MEASUREMENT_ID');
```

is optional. Set `callPageView: true` to insert it.
