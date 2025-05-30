module.exports = function(eleventyConfig) {
  // Copy CSS files to output
  eleventyConfig.addPassthroughCopy("styles.css");
  
  // Copy the timeline HTM file as static (don't process as template)
  eleventyConfig.addPassthroughCopy("timeline.htm");
  
  // Copy any other static assets you might have
  eleventyConfig.addPassthroughCopy("assets");
  
  // Copy the frontend directory with the enhanced tracker
  eleventyConfig.addPassthroughCopy("frontend/data.json");
  
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
}; 