const gulp = require('gulp');
const replace = require('gulp-replace');

// Task to update internal links and asset paths in the _site folder
gulp.task('update-paths', function() {
  return gulp.src('_site/**/*.html') // Select all HTML files in _site
    // Update asset paths (CSS, JS, images)
    .pipe(replace(/(href|src)="\/assets/g, '$1="/new/assets')) 
    .pipe(replace(/url\("\/assets/g, 'url("/new/assets')) 
    // Only update internal links that start with '/'
    .pipe(replace(/href="\/(?!new\/)(?!https?:\/\/)(?!mailto:)/g, 'href="/new/')) // Ignore external links and mailto
    .pipe(replace(/srcset="\/assets/g, 'srcset="/new/assets')) // Handle WebP and JPEG srcset paths
    .pipe(replace(/(srcset="[^,]+, )\/assets/g, '$1/new/assets'))
    .pipe(gulp.dest('_site')); // Output back to _site
});
