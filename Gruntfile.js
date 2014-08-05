module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    chrome: grunt.file.readJSON('manifest.json'),
    concat: {
      options: {
        separator: '\n\n/******************************************/\n\n'
      },
      embed: {
        src: [
          'parseInt.js',
          'pcodes.js',
          'aliases.js',
          'lyIDs.js',
          'courts.js',
          'LER.js'
        ],
        dest: 'dist/<%= pkg.version %>/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'
      },
      embed: {
        src: '<%= concat.embed.dest %>',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    compress: {
      options: {
        mode: 'zip'
      },
      chrome: {
        options: {
          archive: 'dist/<%= chrome.version %>/<%= pkg.name %>-<%= chrome.version %>.crx'
        },
        src: (function() {
          var chrome = grunt.file.readJSON('manifest.json');
          var result = [
            'manifest.json',
            'options.*',
            'popup*.*', // There's a `popup_big5ForLy.html`.
            'background.*'
          ];
          for(var i in chrome.icons) result.push(chrome.icons[i]);
          for(var i = 0; i < chrome.content_scripts.length; ++i) {
            var target = chrome.content_scripts[i];
            if(target.css) result = result.concat(target.css);
            if(target.js) result = result.concat(target.js);
          }
          return result;
        })()
      }
    },
    copy: {
      chrome: {
        src: '<%= compress.chrome.options.archive %>',
        dest: 'dist/<%= pkg.name %>.crx'
      },
      firefox: {
        src: [
          "icon.png",
          "main.css",
          "parseInt.js",
          "pcodes.js",
          "aliases.js",
          "lyIDs.js",
          "courts.js",
          "LER.js"
        ],
        dest: 'data/'
      }
    },
    shell: {
      options: {
        stdout: true,
        stderr: true,
        failOnError: true
      },
      firefox: {
        command: (
          (require('os').type().indexOf("Windows") == 0)
          ? [
            '"????:\\Program Files\\addon-sdk-1.14\\bin\\activate"', ///< !!EDIT!!
            'cfx xpi',
            'move <%= pkg.name %>.xpi dist',
            'copy dist\\<%= pkg.name %>.xpi dist\\<%= pkg.version %>\\<%= pkg.name %>-<%= pkg.version %>.xpi',
            'rmdir data /S /Q' ///< !!CHECK!!
          ] : [
            '"/????/addon-sdk-????/bin/activate"', ///< !!EDIT!!
            'cfx xpi',
            'mv <%= pkg.name %>.xpi dist',
            'cp dist/<%= pkg.name %>.xpi dist/<%= pkg.version %>/<%= pkg.name %>-<%= pkg.version %>.xpi',
            'rm -rf data' ///< !!CHECK!!
          ]
        ).join('&&')
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['concat', 'uglify', 'compress', 'copy', 'shell']);
  grunt.registerTask('chrome', ['concat', 'uglify', 'compress', 'copy:chrome']);
  grunt.registerTask('firefox', ['copy:firefox', 'shell']);
};
