/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/**\n' +
            ' * <%= pkg.title || pkg.name %>\n' +
            ' * <%= pkg.description %>\n' +
            ' * \n' +
            ' * @author <%= pkg.author %> \n' +
            ' * @since <%= grunt.template.today(\"yyyy-mm-dd\") %>\n' +
            ' * @version v<%= pkg.version %>\n' +
            ' */\n',
        // Task configuration.
        jshint: {
            src: 'lib/**/*.js'
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    clearRequireCache: true
                },
                src: ['test/**/*.js']
            }
        },
        jsdoc : {
            dist : {
                src: ['lib/**/*.js', 'models/**/*.js', 'README.md'],
                options: {
                    destination: 'docs'
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //https://www.npmjs.org/package/grunt-git-release
    grunt.loadNpmTasks('grunt-git-release');
    grunt.loadNpmTasks('grunt-jsdoc');
    // Default task.
    grunt.registerTask('default', ['jshint', 'mochaTest']);
    //grunt.registerTask('docs', ['jshint', 'mochaTest', 'jsdoc']);
    grunt.registerTask('docs', ['jsdoc']);
};
