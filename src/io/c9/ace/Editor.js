foam.CLASS({
  package: 'io.c9.ace',
  name: 'Editor',
  extends: 'foam.u2.View',
  requires: [
    'io.c9.ace.Lib',
    'foam.u2.DetailView'
  ],
  reactions: [
    ['container', 'onload', 'initEditor'],
    ['config', 'propertyChange', 'updateEditor']
  ],
  properties: [
    {
      name: 'container'
    },
    {
      name: 'editor'
    },
    {
      name: 'config',
      factory: function() {
        return this.Config.create();
      }
    },
    {
      class: 'Boolean',
      name: 'showConfig'
    }
  ],
  classes: [
    {
      name: 'Config',
      properties: [
        {
          class: 'Int',
          name: 'height',
          value: 500
        },
        {
          class: 'Int',
          name: 'width',
          value: 500
        },
        {
          class: 'Enum',
          of: 'io.c9.ace.Theme',
          name: 'theme'
        },
        {
          class: 'Enum',
          of: 'io.c9.ace.Mode',
          name: 'mode',
          value: 'JAVA'
        },
        {
          class: 'Enum',
          of: 'io.c9.ace.KeyBinding',
          name: 'keyBinding',
          value: 'VIM'
        }
      ]
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this
        .start('div', null, this.container$)
          .style({
            height: this.config$.dot('height').map(h => h + 'px'),
            width: this.config$.dot('width').map(h => h + 'px')
          })
        .end()
        .start('span')
          .style({cursor: 'pointer'})
          .add(self.showConfig$.map(b => b ? 'Hide Editor Config' : 'Show Editor Config'))
          .on('click', function() { self.showConfig = ! self.showConfig; })
        .end()
        .add(this.slot(function(showConfig) {
          return this.E().callIf(showConfig, function() {
            this.tag(self.DetailView, { data$: self.config$ });
          });
        }));
    }
  ],
  listeners: [
    function initEditor() {
      var self = this;
      self.Lib.ACE.then(function(ace) {
        self.editor = ace.edit(self.container.id);
        self.updateEditor();
      });
    },
    function updateEditor() {
      if ( ! this.editor ) return;
      this.editor.setTheme(this.config.theme.path);
      this.editor.resize();
      this.editor.session.setMode(this.config.mode.path); 
      this.editor.setKeyboardHandler(this.config.keyBinding.path);
    }
  ]
});