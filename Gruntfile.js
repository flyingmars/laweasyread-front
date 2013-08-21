module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: { separator: '\n' },
      dist: {
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
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  grunt.registerTask('default', ['concat', 'uglify']);
};