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
          var relationship = false;

          var context = {
            foam: Object.create(foam)
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
            relationship = Promise.all(foam.json.references(x, r)).then(function() {
               var obj = foam.dao.Relationship.create(r, x);
              obj.validate && obj.validate();
              return obj;
            })
          };

          with ( context ) { eval(text); }

          if ( ! json && relationship ) return relationship;

          if ( relationship ) {
            // If json is set then a relationship was encountered in the same
            // file as another model. In this case, the relationship wasn't
            // explicitly asked for but is likely expected to be initialized. If
            // this behavior isn't desired then the relationship should be moved
            // into its own file.
            relationship.then(function(r) { r.initRelationship() });
          }

          if ( ! json ) {
            throw new Error('No model found for ' + id);
          }

          var references = foam.json.references(x, json);

          return Promise.all(references).then(function() {
            return foam.lookup(json.class || 'Model').create(json, x);
          });
        }, function() {
          return null;
        });
      }
    }
  ]
});

