class Plugin {
  static src = 'https://www.googletagmanager.com/gtag/js?id=%ID%';
  static html = `
  <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
  </script>`;
  static pageView = `gtag('js', new Date());gtag('config', '%ID%');`;

  constructor(options) {
    if (options.id === void 0) {
      throw new Error('GA4WebpackPlugin requires GA_MEASUREMENT_ID');
    }

    this.callPageView = true;
    this.inject = true;

    // GA4 ID
    this.id = options.id;

    /**
     * Inject only on build mode
     * */
    if ('inject' in options) this.inject = options.inject;

    /**
     * Call Page View
     * */
    if ('callPageView' in options) this.callPageView = options.callPageView;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('GA4WebpackPlugin', (compilation, callback) => {
      const indexHtml = compilation.assets['index.html'];
      const keyid = '%ID%';
      var gtag = "";
      
      if(this.inject) {
        /**
         * Interpolate template
         * */
        const src = Plugin.src.replaceAll(keyid, this.id);
        const pageView = Plugin.pageView.replaceAll(keyid, this.id);
  
        gtag = '\n' + '<script async src="' + src + '"></script>';
  
        if (this.callPageView) {
          gtag += Plugin.html.replace('</script>', pageView + '</script>');
        } else {
          gtag += Plugin.html;
        }
  
        // Remove new lines and extra spaces
        gtag = gtag.replaceAll(/(\n+|\s{2,})*/gi, '');
      }

      // <ga4.analytics />
      // <ga4.analytics/>
      const reg = /(\<ga4\.analytics\ ?\/\>)/i;

      // Injecting...

      const modifiedContent = indexHtml.source().replace(reg, gtag);

      // Update build index.html
      compilation.assets['index.html'] = {
        source: () => modifiedContent,
        size: () => modifiedContent.length
      };

      callback();
    });
  }
}

module.exports = Plugin;
