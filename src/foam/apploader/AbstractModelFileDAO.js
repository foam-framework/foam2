foam.CLASS({
  package: 'foam.apploader',
  name: 'AbstractModelFileDAO',
  documentation: 'ModelDAO which reads .js files.',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      class: 'Map',
      name: 'cache'
    }
  ],
  methods: [
    function getFile(id) {
      throw 'Implement getFile';
    },
    function onError(resp) {
      throw 'Implement onError';
    },
    {
      name: 'find_',
      code: function(x, id) {
        var promise;
        if ( this.cache[id] ) {
          promise = Promise.resolve(this.cache[id]);
        } else {
          promise = this.getFile(id);
        }

        var self = this;

        return promise.then(function(text) {
          var json;
          var genmodel = false;
          var relationship = false;

          var context = {
            foam: Object.create(foam)
          };

          context.foam.GENMODEL = function(m) {
            json = m;
            genmodel = true;
          };

          context.foam.CLASS = function(m) {
            var jsonId = m.package ?
                m.package + '.' + m.name :
                m.name;

            if ( jsonId !== id ) {
              self.cache[jsonId] = m;
              return;
            }

            json = m;
          };

          context.foam.INTERFACE = function(json) {
            json.class = json.class || 'foam.core.InterfaceModel',
            context.foam.CLASS(json);
          };

          context.foam.ENUM = function(json) {
            json.class = json.class || 'foam.core.EnumModel';
            context.foam.CLASS(json);
          };

          context.foam.RELATIONSHIP = function(r) {
            var references = foam.json.references(x, r);

            Promise.all(references.concat([
              foam.package.waitForClass(r.sourceModel),
              foam.package.waitForClass(r.targetModel)
            ])).then(function() {
              var obj = foam.dao.Relationship.create(r, x);

              obj.validate && obj.validate();
              foam.package.registerClass(obj);
            });
          };

          with ( context ) { eval(text); }

          if ( ! json ) {
            throw new Error('No model found for ' + id);
          }

          var references = foam.json.references(x, json);

          if ( genmodel ) {
            references = references.concat(json.requires.map(x.classloader.load.bind(x.classloader)));
          }

          return Promise.all(references).then(function() {
            if ( genmodel ) {
              return json.build(x);
            }

            return foam.lookup(json.class || 'Model').create(json, x);
          });
        }, this.onError);
      }
    }
  ]
});
