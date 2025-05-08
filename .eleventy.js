const path = require('path')
const pluginRss = require("@11ty/eleventy-plugin-rss"); // needed for absoluteUrl SEO feature
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const EleventyVitePlugin = require("@11ty/eleventy-plugin-vite");
const Image = require("@11ty/eleventy-img");
const yaml = require("js-yaml"); // Because yaml is nicer than json for editors
const fs = require('fs');
require('dotenv').config();

const baseUrl = process.env.BASE_URL || "http://localhost:8080";
// const baseUrl = "http://localhost:8080";
console.log('baseUrl is set to ...', baseUrl);

const globalSiteData = {
  title: "Creative Corner Collective",
  description: "Creative Corner is a monthly gathering for artists, dreamers, and doers to share their work, connect with community, and vibe in a space built on creativity and good energy.",
  locale: 'en',
  baseUrl: baseUrl,
  ogImage: `/assets/og-pf.png`,
};

module.exports = function(eleventyConfig) {

  /* --- GLOBAL DATA --- */
  
  eleventyConfig.addGlobalData("site", globalSiteData);
  // eleventyConfig.addGlobalData("lang", function(data) {
  //   if (data && data.page && data.page.url) {
  //     console.log("passed")
  //     const urlSearchParams = new URLSearchParams(data.page.url.split('?')[1]);
  //     const langParam = urlSearchParams.get('lang');
  //     return langParam || 'en';
  //   }
  //   return 'en';
  // });

  /* --- YAML SUPPORT --- */
  
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));
  eleventyConfig.addDataExtension("yml", contents => yaml.load(contents));

  /* --- PASSTHROUGHS --- */

  eleventyConfig.addPassthroughCopy('src/assets/sprites')
  eleventyConfig.addPassthroughCopy('src/assets/images')
  eleventyConfig.addPassthroughCopy('src/assets/css')
	eleventyConfig.addPassthroughCopy('src/assets/js')

  // eleventyConfig.addPassthroughCopy('src/_data');


  /* --- PLUGINS --- */

  eleventyConfig.addPlugin(pluginRss); // just includes absolute url helper function
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(EleventyVitePlugin, {

  });

  /* --- SHORTCODES --- */

  // Image shortcode config
  let defaultSizesConfig = "(min-width: 1200px) 1400px, 100vw"; // above 1200px use a 1400px image at least, below just use 100vw sized image

  eleventyConfig.addShortcode("image", async function(
    src,
    alt,
    sizes = defaultSizesConfig,
    classes = "",
    transparent = false
  ) {
    const extension = path.extname(src).toLowerCase();
    const isTransparent = extension === ".png";
    const formats = isTransparent ? ["png"] : ["webp", "jpeg"];
  
    let metadata = await Image(src, {
      widths: [800, 1500],
      formats,
      urlPath: "/images/",
      outputDir: "./_site/images/",
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`;
      }
    });
  
    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
      class: classes
    };
  
    return Image.generateHTML(metadata, imageAttributes);
  });

  eleventyConfig.addGlobalData("languages", ["en", "es", 'ru', 'pl', 'uk']); // Add more languages as needed
  
  eleventyConfig.addFilter("langPrefix", (url, lang) => {
    return lang === "en" ? url : `/${lang}${url}`;
  });

  // Output year for copyright notices
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  eleventyConfig.addShortcode("svg", function(name, classes = "") {
    const filePath = path.join("src/assets/svgs", `${name}.svg`);
    if (!fs.existsSync(filePath)) {
      console.warn(`SVG not found: ${filePath}`);
      return `<svg><!-- SVG not found: ${name} --></svg>`;
    }
  
    let svgContent = fs.readFileSync(filePath, "utf8");
  
    // Inject class into the first <svg ...> tag
    svgContent = svgContent.replace(
      /<svg\b([^>]*)>/i,
      `<svg $1 class="${classes}">`
    );
  
    return svgContent;
  });
  eleventyConfig.addShortcode("activeClass", function (url, currentUrl, className) {
    // Normalize URLs by removing language prefixes
    const normalizeUrl = (inputUrl) =>
      inputUrl.replace(/^\/[a-z]{2}\//, '/');
  
    // Keep trailing slash consistency by explicitly adding or removing it
    const ensureTrailingSlashConsistency = (inputUrl) =>
      inputUrl.endsWith('/') ? inputUrl : `${inputUrl}/`;
  
    const cleanCurrentUrl = ensureTrailingSlashConsistency(normalizeUrl(currentUrl)); // Normalize and ensure trailing slash
    const cleanUrl = ensureTrailingSlashConsistency(normalizeUrl(url)); // Normalize and ensure trailing slash

    return cleanCurrentUrl === cleanUrl ? className : "";
  });


  eleventyConfig.addPairedAsyncShortcode("lazyBackground", async function(content, src, alt, sizes = "100vw", classNames = '') {
    // Log the source image for debugging
    console.log(`Generating image(s) from:  ${src}`);

    // Generate images in multiple sizes and formats
    let metadata = await Image(src, {
      widths: [800, 1500], // Generate two sizes: 800px and 1500px
      formats: ["webp", "jpeg"], // Generate WebP and JPEG versions
      urlPath: "/images/", // URL path for generated images
      outputDir: "./_site/images/", // Output directory for generated images
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`; // Format the filename with width and format
      }
    });

    // Create image attributes for responsive image loading
    let imageAttributes = {
      alt, // Alt text for the image
      sizes, // The sizes attribute for responsive images
      loading: "lazy", // Lazy load the image
      decoding: "async", // Async decoding for faster page rendering
    };

    // Generate HTML for the responsive image (used for <img>, but we'll extract URLs for background images)
    let imageHTML = Image.generateHTML(metadata, imageAttributes);

    // Extract WebP and JPEG image URLs from metadata
    const webpSrcSet = metadata.webp.map(item => `${item.url} ${item.width}w`).join(", ");
    const jpegSrcSet = metadata.jpeg.map(item => `${item.url} ${item.width}w`).join(", ");

    // Return the HTML for the section, using background images for responsive design
    return `
      <section 
        x-data 
        x-init="() => {
          setTimeout(() => {
              if (window.innerWidth < 640) {
                $el.style.backgroundImage = 'url(${metadata.jpeg[0].url})'; // Small screen, use 800px width JPEG
              } else if (window.innerWidth >= 640 && window.innerWidth < 1024) {
                $el.style.backgroundImage = 'url(${metadata.jpeg[1].url})'; // Medium screen, use 1500px width JPEG
              } else {
                $el.style.backgroundImage = 'url(${metadata.webp[1].url})'; // Large screen, use 1500px WebP
              }
            }, 100)
        }" 
        class="bg-scroll md:bg-fixed ${classNames}">
        ${content}
      </section>
    `;
  });

  // Favicon Creation
  eleventyConfig.addShortcode("favicon", async function(src) {
    let metadata = await Image(src, {
      widths: [16, 32, 64, 180],
      formats: ["png"],
      outputDir: "./_site/images/favicons/",
      urlPath: "/images/favicons/"
    });
    return `<link rel="icon" href="${metadata.png[0].url}" sizes="32x32" type="image/png">`;
  });

  eleventyConfig.addShortcode("currentYear", () => `${new Date().getFullYear()}`);




  /* --- FILTERS --- */

  // Custom Random Helper Filter (useful for ID attributes)
  eleventyConfig.addFilter("generateRandomIdString", function (prefix) {
    return prefix + "-" + Math.floor(Math.random() * 1000000);
  });

  eleventyConfig.addCollection("postsEn", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md");
  });

  eleventyConfig.addCollection("postsEs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/es/posts/*.md");
  });

  eleventyConfig.addCollection("postsRu", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/ru/posts/*.md");
  });

  eleventyConfig.addCollection("postsUk", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/uk/posts/*.md");
  });

  eleventyConfig.addCollection("postsPl", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/pl/posts/*.md");
  });



  /* --- BASE CONFIG --- */

  return {
    dir: {
      data: "_data",
      input: "src",
      output: "_site",
      includes: "_includes", // this path is releative to input-path (src/)
      layouts: "_layouts" // this path is releative to input-path (src/)

    },
    pathPrefix: "/",
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};