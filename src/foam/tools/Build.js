foam.CLASS({
  package: 'foam.tools',
  name: 'Build',

  requires: [
    'foam.json2.Serializer',
    //'foam.json.Outputter',
    //'foam.TestRefines',
  ],

  imports: [
    'modelDAO',
  ],

  properties: [
    {
      name: 'modelId',
      value: 'foam.tools.Build',
    },
    {
      class: 'String',
      name: 'output',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
    },
    {
      class: 'StringArray',
      name: 'flags',
      value: ['web'],
    },
    {
      hidden: true,
      name: 'outputter',
      expression: function(flags) {
        return this.Serializer.create();
        return this.Outputter.create({
          indentStr: '  ',
          formatFunctionsAsStrings: false,
          outputDefaultValues: false,
          passPropertiesByReference: false,
          //pretty: false,
          strict: false,
          propertyPredicate: function(o, p) {
            if ( p.flags ) {
              for ( var i = 0; i < flags.length; i++ ) {
                if ( p.flags[flags[i]] ) return true;
              }
              return false;
            }
            return !p.transient;
          },
          objectKeyValuePredicate: function(k, v) {
            if ( v.prototype && v.prototype.cls_ ) {
              return v !== v.prototype.cls_;
            }
            return true;
          },
        });
      },
    },
  ],

  actions: [
    function execute() {
      var self = this;
      return new Promise(function(ret) {

        var getDeps = function(model) {
          var deps = model.requires ?
              model.requires.map(function(r) { return r.path }) :
              [];

          deps = deps.concat(model.implements ?
                             model.implements.map((function(i) { return i.path })) :
                             []);

          if ( model.extends ) deps.push(model.extends);

          return deps;
        };

        var loaded = {};
        var queue = [self.modelId];
        var next = function() {
          if ( !queue.length ) {
            var output = [];
            Object.values(loaded).forEach(function(model) {
              output.push(self.outputter.stringify(foam.__context__, model));
            });
            self.output = output.join('\n');
            ret(self.output);
            return;
          }
          var modelId = queue.shift();
          if (loaded[modelId] ||
              modelId == 'FObject') {
            next();
            return;
          }
          var enqueueDeps = function(model) {
            loaded[modelId] = model;
            queue = queue.concat(getDeps(model));
            next();
          }
          self.modelDAO.find(modelId).then(function(model) {
            if ( ! model ) {
              console.error('Unable to load', modelId);
              next();
            } else {
              enqueueDeps(model);
            }
          });
        }
        next();
      });
    }
  ]
});
