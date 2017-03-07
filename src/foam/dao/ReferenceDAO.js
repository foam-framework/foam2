foam.CLASS({
    package: 'foam.dao',
    name: 'ReferenceDAO',
    extends: 'foam.dao.ProxyDAO',
    
    documentation: {
      /**
       *--- overriding both select and find. 
       *--- loading relevant property objects via propertyId in referenceDAOKey. 
       */
    },

    requires: [
        'foam.dao.ArraySink',
        'foam.dao.ArrayDAO',
        'foam.dao.PromisedDAO',
    ],


    methods: [
         function find(id) {
            var self = this;
            return this.delegate.find(id).then(function(result){
                return self.getReferenceObjects(result); 
            });
        },

        function select(sink, skip, limit, order, predicate) {
            var self = this;
            

            return this.delegate.select(sink || this.ArraySink.create(), skip, limit, order, predicate).then(function(result) {
                var promises = [];
                if (!result || !result.a) return; 
                for (var i=0; i<result.a.length; i++){
                    promises.push(self.getReferenceObjects(result.a[i])); 
                }
                 return Promise.resolve(Promise.all(promises)).then(function(r){
                    return self.ArraySink.create({a: r}); 
                }); 
            });
        },
        
        function getReferenceObjects(obj){
            var self = this; 
            obj = obj.cls_.create(obj, this);
            let props = obj.cls_.getAxiomsByClass(foam.core.Property).filter(function(c){return c.transient; });
            var promises = [];
            
            for (var i=0; i<props.length; i++){
                let prop = props[i];
                if (!prop.referenceDAOKey || !prop.referenceProperty) continue;
                var dao = self.__context__[prop.referenceDAOKey];
                if (!prop.f(obj)){
                    obj[prop.referenceProperty] = null; 
                }else {
                    var referencePropName = prop.referenceProperty; 
                    promises.push(
                        dao.find(prop.f(obj)).then(function(result){
                            obj[referencePropName] = result; 
                        })
                    );
                }
            }
            return Promise.resolve(Promise.all(promises)).then(function(result){
                return obj;
            }); 
        }, 

    ]
});
