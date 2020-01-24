/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'io.c9.ace',
  name:'Mode',
  properties: [
    'path'
  ],
  values: [
    {
      path: 'ace/mode/abap',
      label: 'ABAP',
      name: 'ABAP'
    },
    {
      path: 'ace/mode/abc',
      label: 'ABC',
      name: 'ABC'
    },
    {
      path: 'ace/mode/actionscript',
      label: 'ActionScript',
      name: 'ACTION_SRCRIPT'
    },
    {
      path: 'ace/mode/ada',
      label: 'ADA',
      name: 'ADA'
    },
    {
      path: 'ace/mode/apache_conf',
      label: 'Apache Conf',
      name: 'APACHE_CONF'
    },
    {
      path: 'ace/mode/asciidoc',
      label: 'AsciiDoc',
      name: 'ASCII_DOC'
    },
    {
      path: 'ace/mode/asl',
      label: 'ASL',
      name: 'ASL'
    },
    {
      path: 'ace/mode/assembly_x86',
      label: 'Assembly x86',
      name: 'ASSEMLBY_X86'
    },
    {
      path: 'ace/mode/autohotkey',
      label: 'AutoHotkey / AutoIt',
      name: 'AUTOHOTKEY_AUTOIT'
    },
    {
      path: 'ace/mode/apex',
      label: 'Apex',
      name: 'APEX'
    },
    {
      path: 'ace/mode/batchfile',
      label: 'BatchFile',
      name: 'BATACH_FILE'
    },
    {
      path: 'ace/mode/bro',
      label: 'Bro',
      name: 'BRO'
    },
    {
      path: 'ace/mode/c_cpp',
      label: 'C and C++',
      name: 'C_AND_CPP'
    },
    {
      path: 'ace/mode/c9search',
      label: 'C9Search',
      name: 'C9_SEARCH'
    },
    {
      path: 'ace/mode/cirru',
      label: 'Cirru',
      name: 'CIRRU'
    },
    {
      path: 'ace/mode/clojure',
      label: 'Clojure',
      name: 'CLOJURE'
    },
    {
      path: 'ace/mode/cobol',
      label: 'Cobol',
      name: 'COBOL'
    },
    {
      path: 'ace/mode/coffee',
      label: 'CoffeeScript',
      name: 'COFFE_SCRIPT'
    },
    {
      path: 'ace/mode/coldfusion',
      label: 'ColdFusion',
      name: 'COLD_FUSION'
    },
    {
      path: 'ace/mode/csharp',
      label: 'C#',
      name: 'C'
    },
    {
      path: 'ace/mode/csound_document',
      label: 'Csound Document',
      name: 'C_SOUND_DOCUMENT'
    },
    {
      path: 'ace/mode/csound_orchestra',
      label: 'Csound',
      name: 'C_SOUND'
    },
    {
      path: 'ace/mode/csound_score',
      label: 'Csound Score',
      name: 'C_SOUND_CORE'
    },
    {
      path: 'ace/mode/css',
      label: 'CSS',
      name: 'CSS'
    },
    {
      path: 'ace/mode/curly',
      label: 'Curly',
      name: 'CURLY'
    },
    {
      path: 'ace/mode/d',
      label: 'D',
      name: 'D'
    },
    {
      path: 'ace/mode/dart',
      label: 'Dart',
      name: 'DART'
    },
    {
      path: 'ace/mode/diff',
      label: 'Diff',
      name: 'DIFF'
    },
    {
      path: 'ace/mode/dockerfile',
      label: 'Dockerfile',
      name: 'DOCKER_FILE'
    },
    {
      path: 'ace/mode/dot',
      label: 'Dot',
      name: 'DOT'
    },
    {
      path: 'ace/mode/drools',
      label: 'Drools',
      name: 'DROOLS'
    },
    {
      path: 'ace/mode/edifact',
      label: 'Edifact',
      name: 'EDIFACT'
    },
    {
      path: 'ace/mode/eiffel',
      label: 'Eiffel',
      name: 'EIFFEL'
    },
    {
      path: 'ace/mode/ejs',
      label: 'EJS',
      name: 'EJS'
    },
    {
      path: 'ace/mode/elixir',
      label: 'Elixir',
      name: 'ELIXIR'
    },
    {
      path: 'ace/mode/elm',
      label: 'Elm',
      name: 'ELM'
    },
    {
      path: 'ace/mode/erlang',
      label: 'Erlang',
      name: 'ERLAND'
    },
    {
      path: 'ace/mode/forth',
      label: 'Forth',
      name: 'FORTH'
    },
    {
      path: 'ace/mode/fortran',
      label: 'Fortran',
      name: 'FORTRAN'
    },
    {
      path: 'ace/mode/fsharp',
      label: 'FSharp',
      name: 'FSHARP'
    },
    {
      path: 'ace/mode/fsl',
      label: 'FSL',
      name: 'FSL'
    },
    {
      path: 'ace/mode/ftl',
      label: 'FreeMarker',
      name: 'FREE_MARKER'
    },
    {
      path: 'ace/mode/gcode',
      label: 'Gcode',
      name: 'GCODE'
    },
    {
      path: 'ace/mode/gherkin',
      label: 'Gherkin',
      name: 'GHERKIN'
    },
    {
      path: 'ace/mode/gitignore',
      label: 'Gitignore',
      name: 'GIT_IGNORE'
    },
    {
      path: 'ace/mode/glsl',
      label: 'Glsl',
      name: 'GLSL'
    },
    {
      path: 'ace/mode/gobstones',
      label: 'Gobstones',
      name: 'GOBSTONES'
    },
    {
      path: 'ace/mode/golang',
      label: 'Go',
      name: 'GO'
    },
    {
      path: 'ace/mode/graphqlschema',
      label: 'GraphQLSchema',
      name: 'GRAPH_QLS_SCHEMA'
    },
    {
      path: 'ace/mode/groovy',
      label: 'Groovy',
      name: 'GROOVY'
    },
    {
      path: 'ace/mode/haml',
      label: 'HAML',
      name: 'HAML'
    },
    {
      path: 'ace/mode/handlebars',
      label: 'Handlebars',
      name: 'HANDLE_BARS'
    },
    {
      path: 'ace/mode/haskell',
      label: 'Haskell',
      name: 'HASKELL'
    },
    {
      path: 'ace/mode/haskell_cabal',
      label: 'Haskell Cabal',
      name: 'HASKELL_CABAL'
    },
    {
      path: 'ace/mode/haxe',
      label: 'haXe',
      name: 'HAXE'
    },
    {
      path: 'ace/mode/hjson',
      label: 'Hjson',
      name: 'HJSON'
    },
    {
      path: 'ace/mode/html',
      label: 'HTML',
      name: 'HTML'
    },
    {
      path: 'ace/mode/html_elixir',
      label: 'HTML (Elixir)',
      name: 'HTML_ELIXIR'
    },
    {
      path: 'ace/mode/html_ruby',
      label: 'HTML (Ruby)',
      name: 'HTML_RUBY'
    },
    {
      path: 'ace/mode/ini',
      label: 'INI',
      name: 'INI'
    },
    {
      path: 'ace/mode/io',
      label: 'Io',
      name: 'IO'
    },
    {
      path: 'ace/mode/jack',
      label: 'Jack',
      name: 'JACK'
    },
    {
      path: 'ace/mode/jade',
      label: 'Jade',
      name: 'JADE'
    },
    {
      path: 'ace/mode/java',
      label: 'Java',
      name: 'JAVA'
    },
    {
      path: 'ace/mode/javascript',
      label: 'JavaScript',
      name: 'JAVASCRIPT'
    },
    {
      path: 'ace/mode/json',
      label: 'JSON',
      name: 'JSON'
    },
    {
      path: 'ace/mode/jsoniq',
      label: 'JSONiq',
      name: 'JSON_IQ'
    },
    {
      path: 'ace/mode/jsp',
      label: 'JSP',
      name: 'JSP'
    },
    {
      path: 'ace/mode/jssm',
      label: 'JSSM',
      name: 'JSSM'
    },
    {
      path: 'ace/mode/jsx',
      label: 'JSX',
      name: 'JSX'
    },
    {
      path: 'ace/mode/julia',
      label: 'Julia',
      name: 'JULIA'
    },
    {
      path: 'ace/mode/kotlin',
      label: 'Kotlin',
      name: 'KOTLIN'
    },
    {
      path: 'ace/mode/latex',
      label: 'LaTeX',
      name: 'LATEX'
    },
    {
      path: 'ace/mode/less',
      label: 'LESS',
      name: 'LESS'
    },
    {
      path: 'ace/mode/liquid',
      label: 'Liquid',
      name: 'LIQUID'
    },
    {
      path: 'ace/mode/lisp',
      label: 'Lisp',
      name: 'LISP'
    },
    {
      path: 'ace/mode/livescript',
      label: 'LiveScript',
      name: 'LIVE_SCRIPT'
    },
    {
      path: 'ace/mode/logiql',
      label: 'LogiQL',
      name: 'LOGIQL'
    },
    {
      path: 'ace/mode/lsl',
      label: 'LSL',
      name: 'LSL'
    },
    {
      path: 'ace/mode/lua',
      label: 'Lua',
      name: 'LUA'
    },
    {
      path: 'ace/mode/luapage',
      label: 'LuaPage',
      name: 'LUA_PAGE'
    },
    {
      path: 'ace/mode/lucene',
      label: 'Lucene',
      name: 'LUCENE'
    },
    {
      path: 'ace/mode/makefile',
      label: 'Makefile',
      name: 'MAKE_FILE'
    },
    {
      path: 'ace/mode/markdown',
      label: 'Markdown',
      name: 'MARK_DOWN'
    },
    {
      path: 'ace/mode/mask',
      label: 'Mask',
      name: 'MASK'
    },
    {
      path: 'ace/mode/matlab',
      label: 'MATLAB',
      name: 'MATLAB'
    },
    {
      path: 'ace/mode/maze',
      label: 'Maze',
      name: 'MAZE'
    },
    {
      path: 'ace/mode/mel',
      label: 'MEL',
      name: 'MEL'
    },
    {
      path: 'ace/mode/mixal',
      label: 'MIXAL',
      name: 'MIXAL'
    },
    {
      path: 'ace/mode/mushcode',
      label: 'MUSHCode',
      name: 'MUSHCode'
    },
    {
      path: 'ace/mode/mysql',
      label: 'MySQL',
      name: 'MYSQL'
    },
    {
      path: 'ace/mode/nix',
      label: 'Nix',
      name: 'NIX'
    },
    {
      path: 'ace/mode/nsis',
      label: 'NSIS',
      name: 'NSIS'
    },
    {
      path: 'ace/mode/objectivec',
      label: 'Objective-C',
      name: 'OBJECTIVE_C'
    },
    {
      path: 'ace/mode/ocaml',
      label: 'OCaml',
      name: 'OCAML'
    },
    {
      path: 'ace/mode/pascal',
      label: 'Pascal',
      name: 'PASCAL'
    },
    {
      path: 'ace/mode/perl',
      label: 'Perl',
      name: 'PERL'
    },
    {
      path: 'ace/mode/perl6',
      label: 'Perl 6',
      name: 'PERL6'
    },
    {
      path: 'ace/mode/pgsql',
      label: 'pgSQL',
      name: 'PGSQL'
    },
    {
      path: 'ace/mode/php_laravel_blade',
      label: 'PHP (Blade Template)',
      name: 'PHP_BLADE_TEMPLATE'
    },
    {
      path: 'ace/mode/php',
      label: 'PHP',
      name: 'PHP'
    },
    {
      path: 'ace/mode/puppet',
      label: 'Puppet',
      name: 'PUPPET'
    },
    {
      path: 'ace/mode/pig',
      label: 'Pig',
      name: 'PIG'
    },
    {
      path: 'ace/mode/powershell',
      label: 'Powershell',
      name: 'POWERSHELL'
    },
    {
      path: 'ace/mode/praat',
      label: 'Praat',
      name: 'PRAAT'
    },
    {
      path: 'ace/mode/prolog',
      label: 'Prolog',
      name: 'PROLOG'
    },
    {
      path: 'ace/mode/properties',
      label: 'Properties',
      name: 'PROPERTIES'
    },
    {
      path: 'ace/mode/protobuf',
      label: 'Protobuf',
      name: 'PROTOBUFF'
    },
    {
      path: 'ace/mode/python',
      label: 'Python',
      name: 'PYTHON'
    },
    {
      path: 'ace/mode/r',
      label: 'R',
      name: 'R'
    },
    {
      path: 'ace/mode/razor',
      label: 'Razor',
      name: 'RAZOR'
    },
    {
      path: 'ace/mode/rdoc',
      label: 'RDoc',
      name: 'R_DOC'
    },
    {
      path: 'ace/mode/red',
      label: 'Red',
      name: 'RED'
    },
    {
      path: 'ace/mode/rhtml',
      label: 'RHTML',
      name: 'RHTML'
    },
    {
      path: 'ace/mode/rst',
      label: 'RST',
      name: 'RST'
    },
    {
      path: 'ace/mode/ruby',
      label: 'Ruby',
      name: 'RUBY'
    },
    {
      path: 'ace/mode/rust',
      label: 'Rust',
      name: 'RUST'
    },
    {
      path: 'ace/mode/sass',
      label: 'SASS',
      name: 'SASS'
    },
    {
      path: 'ace/mode/scad',
      label: 'SCAD',
      name: 'SCAD'
    },
    {
      path: 'ace/mode/scala',
      label: 'Scala',
      name: 'SCALA'
    },
    {
      path: 'ace/mode/scheme',
      label: 'Scheme',
      name: 'SCHEME'
    },
    {
      path: 'ace/mode/scss',
      label: 'SCSS',
      name: 'SCSS'
    },
    {
      path: 'ace/mode/sh',
      label: 'SH',
      name: 'SH'
    },
    {
      path: 'ace/mode/sjs',
      label: 'SJS',
      name: 'SJS'
    },
    {
      path: 'ace/mode/slim',
      label: 'Slim',
      name: 'SLIM'
    },
    {
      path: 'ace/mode/smarty',
      label: 'Smarty',
      name: 'SMARTY'
    },
    {
      path: 'ace/mode/snippets',
      label: 'snippets',
      name: 'SNIPPETS'
    },
    {
      path: 'ace/mode/soy_template',
      label: 'Soy Template',
      name: 'SOY_TEMPLATE'
    },
    {
      path: 'ace/mode/space',
      label: 'Space',
      name: 'SPACE'
    },
    {
      path: 'ace/mode/sql',
      label: 'SQL',
      name: 'SQL'
    },
    {
      path: 'ace/mode/sqlserver',
      label: 'SQLServer',
      name: 'SQLServer'
    },
    {
      path: 'ace/mode/stylus',
      label: 'Stylus',
      name: 'STYLUS'
    },
    {
      path: 'ace/mode/svg',
      label: 'SVG',
      name: 'SVG'
    },
    {
      path: 'ace/mode/swift',
      label: 'Swift',
      name: 'SWIFT'
    },
    {
      path: 'ace/mode/tcl',
      label: 'Tcl',
      name: 'TCL'
    },
    {
      path: 'ace/mode/terraform',
      label: 'Terraform',
      name: 'TERRAFORM'
    },
    {
      path: 'ace/mode/tex',
      label: 'Tex',
      name: 'TEX'
    },
    {
      path: 'ace/mode/text',
      label: 'Text',
      name: 'TEXT'
    },
    {
      path: 'ace/mode/textile',
      label: 'Textile',
      name: 'TEXTILE'
    },
    {
      path: 'ace/mode/toml',
      label: 'Toml',
      name: 'TOML'
    },
    {
      path: 'ace/mode/tsx',
      label: 'TSX',
      name: 'TSX'
    },
    {
      path: 'ace/mode/twig',
      label: 'Twig',
      name: 'TWIG'
    },
    {
      path: 'ace/mode/typescript',
      label: 'Typescript',
      name: 'TYPESCRIPT'
    },
    {
      path: 'ace/mode/vala',
      label: 'Vala',
      name: 'VALA'
    },
    {
      path: 'ace/mode/vbscript',
      label: 'VBScript',
      name: 'VBSCIPT'
    },
    {
      path: 'ace/mode/velocity',
      label: 'Velocity',
      name: 'VELOCITY'
    },
    {
      path: 'ace/mode/verilog',
      label: 'Verilog',
      name: 'VERILOG'
    },
    {
      path: 'ace/mode/vhdl',
      label: 'VHDL',
      name: 'VHDL'
    },
    {
      path: 'ace/mode/visualforce',
      label: 'Visualforce',
      name: 'VISUAL_FORCE'
    },
    {
      path: 'ace/mode/wollok',
      label: 'Wollok',
      name: 'WOLLOK'
    },
    {
      path: 'ace/mode/xml',
      label: 'XML',
      name: 'XML'
    },
    {
      path: 'ace/mode/xquery',
      label: 'XQuery',
      name: 'XQUERY'
    },
    {
      path: 'ace/mode/yaml',
      label: 'YAML',
      name: 'YAML'
    },
    {
      path: 'ace/mode/django',
      label: 'Django',
      name: 'DJANGO'
    }
  ]
});
