var stylus = require('stylus');
var minimatch = require('minimatch');
var join = require('path').join;
var nib = require('nib');

function plugin (opts) {
  opts = opts || {};
  opts.paths = (opts.paths || []).map(function (relative) {
    return join(process.cwd(), relative);
  });

  return function (files, metalsmith, done) {
    var destination = metalsmith.destination();
    var source = metalsmith.source();
    var styles = Object.keys(files).filter(minimatch.filter("*.+(styl|stylus)", {matchBase: true}));

    var paths = styles.map(function (path) {
      var ret = path.split('/');
      if (ret[0] === "") ret.pop();
      return source + '/' + ret.join('/');
    });

    paths = paths.concat(opts.paths);

    paths.forEach(function (file, index, arr) {
      var out = file.split('.');
      out.pop();
      out = out.join('.') + '.css';
      var s = stylus(files[file].contents.toString())
        .set('filename', file);
        
        for (var o in opts) {
          s.set(o, opts[o]);
        }
        if(opts.nib) {
          s.use(nib());
        }

        s.render(function (err, css) {
          if (err) throw err;
          delete files[file];
          files[out] = { contents: new Buffer(css) };
        });
    });
    done();
  };
}

module.exports = plugin;
