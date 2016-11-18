
foam.CLASS({
    name: 'CascadingRemoveDAO',
    package: 'foam.dao',
    extends: 'foam.dao.ProxyDAO',

    label: 'Cascading Remove DAO',
    help: "Removes children from relationship",

    documentation: {
        /**
           On object DAO remove, also remove any relationship objects. 

           TODO: 
           Perhaps the Relationship should be stored as an Axiom on the source
           and target classes so that it can be found. We might need two axiom
           types: RelationshiipTarget and RelationshipSource, both of which
           just contain a reference to the Relationship. EasyDAO could make use
           of this as could a Relationship-Aware DAOController. - Kevin 
        */
    },

    properties: [
        {
            /** Relationship name, from which elements will be removed.*/
            name: 'name',
            hidden: true,
            required: true,
            transient: true
        },
        {
            name: 'pending_',
            hidden: true,
            transient: true,
            factory: function() {
                return new Map();
            }
        },
    ],

    methods: [

        function remove(obj) {
            return obj[this.name].removeAll().then(function() {
                return self.delegate.remove(obj);
            });
        },

        function removeAll(skip, limit, order, predicate) {
            var self = this;
            //
            // NOTE: grabbing the first object as we have no other access
            // to the relationship.
            //
            return self.delegate.select(skip, limit, order, predicate).then(function(sink) {
                return Promise.all(
                    sink.a.map(function(obj) {
                        if (self.pending_.has(obj.id)) {
                            return self.delegate.removeAll();
                        } else {
                            self.pending_.set(obj.id, true);
                            return new Promise(function(resolve, reject) {
                                return obj[self.name].removeAll().then(function() {
                                    return self.delegate.removeAll(skip, limit, order, predicate).then(function() {
                                        self.pending_.delete(obj.id);
                                        resolve(obj);
                                    });
                                });
                            });
                        }
                    })
                );
            });
        },
    ]
});
