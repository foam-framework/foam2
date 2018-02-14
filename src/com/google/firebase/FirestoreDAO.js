/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.firebase',
  name: 'FirestoreDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: `DAO that wraps a Firestore collection. Implemented against
      Firestore 0.11.x JavaScript documentation.`,


  properties: [
    {
      name: 'firestore',
      documentation: `The firebase.firestore.Firestore for this DAO:
          https://firebase.google.com/docs/reference/js/firebase.firestore.Firestore`,
      required: true
    },
    {
      name: 'collection',
      documentation: `The firebase.firestore.CollectionReference for this DAO:
          https://firebase.google.com/docs/reference/js/firebase.firestore.CollectionReference`,
      required: true
    },
    {
      name: 'getFirestoreDocumentID',
      documentation: `The function usedto extract a Firestore Document ID string
      from a foam.core.FObject that is stored via this DAO.`,
      value: function(obj) {
        return obj.id.toString().replace(/[/]/g, this.slashReplacement);
      },
    },
    {
      name: 'getFirestoreData',
      documentation: `The function usedto extract a Firestore data from a
          foam.core.FObject that is stored via this DAO.`,
      value: function(obj) { return foam.json.objectify(obj); }
    },
    {
      name: 'getFObject',
      documentation: `The function usedto extract a foam.core.FObject from
          Firestore data that is stored via this DAO.`,
      value: function(data) { return foam.json.parse(data); }
    },
    {
      class: 'String',
      name: 'slashReplacement',
      value: String.fromCharCode(0),
    },
    {
      class: 'Array',
      name: 'putBacklog_',
    }
  ],

  methods: [
    function put_(x, obj) {
      var resolve;
      var reject;
      var promise = new Promise(function(res, rej) {
        reject = res;
        reject = rej;
      });
      this.putBacklog_.push({
        obj: obj,
        resolve: resolve,
        reject: reject,
        promise: promise,
      });
      if ( this.putBacklog_.length > 400 ) {
        this.putBatch_();
      }
      this.onPut();
      return promise;
    },
    function putBatch_() {
      var batch = this.firestore.batch();
      var backlog = this.putBacklog_;
      for ( var i = 0; i < backlog.length; i++ ) {
        var data = backlog[i];
        batch.set(this.getDoc_(data.obj), this.getFirestoreData(data.obj));
      }

      batch.commit().then(function(backlog) {
        for ( var i = 0; i < backlog.length; i++ ) {
          backlog[i].resolve(backlog[i].obj);
        }
      }.bind(this, backlog), function(error) {
        for ( var i = 0; i < backlog.length; i++) {
          backlog[i].reject(error);
        }
      });

      this.putBacklog_ = [];
    },
    function remove_(x, obj) {
      return this.getDoc_(obj).delete();
    },
    function find_(x, idOrObj) {
      return (foam.core.FObject.isInstance(idOrObj) ?
              this.getDoc_(idOrObj) : this.collection.doc(idOrObj.toString()))
          .get()
          .then(function(docSnapshot) { return docSnapshot.data() || null; });
    },
    function select_(x, sink, skip, limit, order, predicate) {
      var collection = this.collection;
      if ( limit ) {
        // NodeJS supports collection.offset() for skip; web does not.
        if ( collection.offset ) {
          collection = collection.offset(skip).limit(limit);
          skip = limit = undefined;
        } else {
          var firestoreLimit = limit + (skip || 0);
          collection = collection.limit(firestoreLimit);
          limit = undefined;
        }
      }
      // TODO(markdittmer): Implement Firestore query decoration for
      // order and predicate.

      var decoratedSink = this.decorateSink_(
          sink, skip, limit, order, predicate);

      return collection.get().then(function(querySnapshot) {
        var docs = querySnapshot.docs;
        var sub = foam.core.FObject.create();
        var detached = false;
        sub.onDetach(function() { detached = true; });
        if ( decoratedSink.put ) {
          for ( var i = 0; i < docs.length; i++ ) {
            var obj = this.getFObject(docs[i].data());
            decoratedSink.put(obj, sub);
            if ( detached ) break;
          }
        }
        decoratedSink.eof && decoratedSink.eof();
        return decoratedSink;
      }.bind(this));
    },
    function removeAll_(x, skip, limit, order, predicate) {
      return this.select_(x, undefined, skip, limit, order, predicate)
          .then(function(arraySink) {
            var batch = this.firestore.batch();
            var array = arraySink.array;
            for ( var i = 0; i < array.length; i++ ) {
              batch.delete(
                  this.collection.doc(this.getFirestoreDocumentID(array[i])));
            }
            return batch.commit();
          }.bind(this));
    },
    function listen_(x, sink, predicate) {
      // TODO(markdittmer): Implement Firestore query decoration for
      // predicate.
      var decoratedSink = this.decorateSink_(
          sink, undefined, undefined, undefined, predicate);
      var unsub = this.collection.onSnapshot(function(querySnapshot) {
        var docs = querySnapshot.docs;
        for ( var i = 0; i < docs.length; i++ ) {
          decoratedSink.put(this.getFObject(docs[i].data()));
        }
      }.bind(this));
      var sub = foam.core.FObject.create();
      sub.onDetach(unsub);
      return sub;
    },
    function getDoc_(obj) {
      return this.collection.doc(this.getFirestoreDocumentID(obj));
    },
  ],

  listeners: [
    {
      name: 'onPut',
      isMerged: true,
      mergeDelay: 10,
      code: function() {
        if ( this.putBacklog_.length > 0 ) this.putBatch_();
      }
    }
  ]
});
