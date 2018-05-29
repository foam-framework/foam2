foam.CLASS({
  package: 'foam.apploader',
  name: 'ModelFileDAO',
  documentation: 'ModelDAO which reads hand written models.',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      class: 'Map',
      name: 'cache'
    },
    'fetcher',
  ],
  methods: [
    {
      name: 'find_',
      code: function(x, id) {
        var promise;
        if ( this.cache[id] ) {
          promise = Promise.resolve(this.cache[id]);
        } else {
          promise = this.fetcher.getFile(id);
        }

        var self = this;

        return promise.then(function(text) {
          if ( ! text ) return null;
          var json;
          var jsonId;

          var context = {
            foam: Object.create(foam)
          };

          context.foam.CLASS = function(m) {
            jsonId = m.package ?
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
            var s = r.sourceModel;
            var si = s.lastIndexOf('.');
            var t = r.targetModel;
            var ti = t.lastIndexOf('.');

            r.class = r.class || 'foam.dao.Relationship';
            r.package = r.package || s.substring(0, si)
            r.name = r.name || s.substring(si+1) + t.substring(ti+1) + 'Relationship';
            context.foam.CLASS(r);
            if ( jsonId !== id ) {
              // If a relationship was encountered but not asked for, initialize
              // the relationship because it is likely to be expected.
              // If this behavior isn't desired then the relationship should be
              // moved into its own file.
              self.find(jsonId).then(function(m) {
                m.initRelationship();
              });
            }
          };

          if ( foam.String.isInstance(text) ) {
            with ( context ) { eval(text); }
          } else {
            context.foam.CLASS(text);
          }

          if ( ! json ) {
            throw new Error('No model found for ' + id);
          }

          return Promise.all(foam.json.references(x, json)).then(function() {
            return foam.lookup(json.class || 'Model').create(json, x);
          });
        }, function() {
          return null;
        });
      }
    }
  ]
});

