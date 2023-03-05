(function (global) {

  var pathMappings = {
    '@angular': 'node_modules/@angular',
    'rxjs': 'node_modules/rxjs',
    'js-sha256': 'node_modules/js-sha256/src',
    'semantic': 'Semantic-UI-CSS-master',
    'load-json-file': 'node_modules/load-json-file'
  };

  var packages = [
    '@angular/common',
    '@angular/compiler',
    '@angular/core',
    '@angular/http',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    '@angular/router',
    '@angular/router-deprecated',
    '@angular/testing',
    'rxjs',
    'built',
    'js-sha256'
  ];

  var packagesConfig = {};

  packages.forEach(function(packageName) {
    packagesConfig[packageName] = {
      main: packageName === 'js-sha256' ? 'sha256.js': 'index.js',
      defaultExtension: 'js'
    };
  });

  System.config({
    map: pathMappings,
    packages: packagesConfig,
  });

})(this);
