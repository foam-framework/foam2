foam.CLASS({
    name: 'ReferenceSink',
    package: 'com.serviceecho.dao',
    extends: 'foam.dao.ProxySink',
    
    documentation: {
      /**
       *--- loading relevant property objects via propertyId in referenceDAOKey. 
       *--- Contextualize select via cloning with 'this' on put into a sink.
       */
    },
    requires: [
       'foam.dao.ArraySink',  
    ],
    
    properties: [
        {
            name:'a',
            expression: function(delegate){
                if (delegate && delegate.a)
                return delegate.a; 
            }, 
        }
    ], 



    methods: [
        function init() {
            this.SUPER();
            if ( ! this.delegate) {
                this.delegate = new this.ArraySink.create();
            }
        },

        function put(origObj) {
            var obj = origObj.cls_.create(origObj, this); 
            var props = obj.cls_.getAxiomsByClass(foam.core.Property).filter(function(c){return c.transient; });
            var promises = [];
            
            for (var i=0; i<props.length; i++){
                let prop = props[i];
                if (!prop.referenceDAOKey || !prop.referenceProperty) continue;
                var dao = this.__context__[prop.referenceDAOKey];
                if (!prop.f(obj)){
                    obj[prop.referenceProperty] = null; 
                }else {
                    var referencePropName = prop.referenceProperty; 
                    var p = 
                        dao.find(prop.f(obj)).then(function(result){
                            obj[referencePropName] = result; 
                        }.bind(this));
                    promises.push(p); 
                }
            }

            
            return Promise.all(promises).then(function(){
                return this.delegate.put(obj);
            }.bind(this));
            
            //return this.delegate.put(obj);
            
            
            
            //this.SUPER(obj.cls_.create(obj, this));
        }
    ]
});
