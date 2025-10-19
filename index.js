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
    const sources = (compiler.webpack && compiler.webpack.sources) || require("webpack").sources;

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      compilation.hooks.processAssets.tap({
        name: PLUGIN_NAME,
        stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
      }, (assets) => {
        // Use compilation.getAssets() instead of compilation.assets (deprecated / will be frozen)
        for (const { name } of compilation.getAssets()) {
          const filePath = compilation.getPath(name);

          if (!this.#isHtml(filePath)) continue;

          compilation.updateAsset(name, (oldSource) => {

            // If inject is false, it will just remove ga4 tag from html
            const script = this.inject ? snippet : "";

            // Begin to update the source file. (Replacing tag with actual tag when needed)
            let content = "";

            if (oldSource && typeof oldSource.source === "function") {
              content = oldSource.source();
            }

            while (true) {

              if (Buffer.isBuffer(content)) {
                console.log(`${CYAN}\n${PLUGIN_NAME} encountered buffer data. Converting...${RESET}`);
                content = content.toString("utf8");
              } else if (typeof content !== "string") {
                content = String(content);
                break;
              }
            }

            const updated = content.replace(pattern, script);
            const buff = Buffer.from(updated);

            return new sources.RawSource(buff);
          })
        }
      })
    });
  }
}

module.exports = Plugin;
