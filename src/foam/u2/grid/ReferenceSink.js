foam.CLASS({
    name: 'ReferenceSink',
    package: 'com.serviceecho.dao',
    extends: 'foam.dao.ProxySink',
    
    requires: [
       'foam.dao.ArraySink',  
    ], 

    documentation: {
      /**
         Contextualize select via cloning with 'this' on put into a sink.
       */
    },

    methods: [
        function init() {
            this.SUPER();
            if ( ! this.delegate) {
                this.delegate = new this.ArraySink.create();
            }
        },

        function put(obj) {
            this.delegate.put(obj.cls_.create(obj, this));
            
            //this.SUPER(obj.cls_.create(obj, this));
        }
    ]
});
