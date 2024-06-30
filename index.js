const { Compilation, Compiler } = require("webpack");

/**
 * Matches <ga4.analytics <with/without spaces here> />
 * */
const pattern = /(\<ga4\.analytics\ *\/\>)/i;

const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

const PLUGIN_NAME = "GA4WebpackPlugin";

class Plugin {
  constructor(options) {
    if (typeof options !== "object") return;

    if (options.id === void 0) {
      throw new Error(`${PLUGIN_NAME} requires GA_MEASUREMENT_ID`);
    }

    this.callPageView = true;
    this.inject = true;

    // GA4 ID
    this.id = options.id;

    /**
     * Inject only on build mode
     * */
    if ("inject" in options) this.inject = options.inject;

    /**
     * Call Page View
     * */
    if ("callPageView" in options) this.callPageView = options.callPageView;
  }

  get snippetCode() {
    const pageView = `gtag('js', new Date());gtag('config', '${this.id}');`;
    const gtag_func =
      `<script>window.dataLayer = window.dataLayer || [];` +
      `function gtag(){dataLayer.push(arguments);}`;

    const snippet = [
      '<script async src="',
      `https://www.googletagmanager.com/gtag/js?id=${this.id}`,
      '"></script>',
    ];

    snippet.push(gtag_func);

    if (this.callPageView) {
      snippet.push(pageView);
    }

    snippet.push("</script>");

    return snippet.join("");
  }

  #isHtml(str) {
    return /\.(xhtml|html?)$/i.test(str);
  }

  /**
   * 
   * @param {Compiler} compiler 
   */
  apply(compiler) {

    const snippet = this.snippetCode;

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      compilation.hooks.afterProcessAssets.tap({
        name: PLUGIN_NAME,
        stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
      }, () => {
        for (const asset of Object.keys(compilation.assets)) {
          const filePath = compilation.getPath(asset);

          if (!this.#isHtml(filePath)) continue;

          compilation.updateAsset(filePath, (rawSource) => {

            // If inject is false, it will just remove ga4 tag from html
            const script = this.inject ? snippet : "";

            // Injecting..
            const source = rawSource.source();

            let str = source;

            /**
             * We need string
             * */
            while (str instanceof Buffer) {
              console.log(`${CYAN}\n${PLUGIN_NAME} encountered buffer data. Converting...${RESET}`);
              str = str.toString("utf8");
            }

            const buff = Buffer.from(str.replace(pattern, script));

            return {
              source: () => buff,
              size: () => buff.length,
              _valueIsBuffer: true,
              _value: buff,
              _valueAsBuffer: buff,
              _valueAsString: void 0,
            };
          })
        }
      })
    });
  }
}

module.exports = Plugin;
