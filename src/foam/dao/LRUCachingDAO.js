/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.dao',
  name: 'LRUCachingDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.dao.MDAO',
    'foam.dao.QuickSink'
  ],

  documentation: `
     Least Recently Used CachingDAO :
     Manages a DAO\'s size by removing old items. Commonly applied inside a cache to limit the cache\'s size. Item freshness is tracked in a separate DAO.
  `,

  classes: [
    {
      /** Links an object id to a last-accessed timestamp */
      name: 'LRUCacheItem',
      properties: [
        {
          name: 'id',
        },
        {
          class: 'Int',
          name: 'timestamp'
        }
      ]
    }
  ],

  properties: [
    {
      /** The maximum size to allow the target dao to be. */
      class: 'Int',
      name: 'maxSize',
      value: 100
    },
    {
      /** Tracks the age of items in the target dao. */
      name: 'trackingDAO',
      of: 'foam.dao.DAO',
      factory: function() {
        return this.MDAO.create({ of: this.LRUCacheItem });
      }
    },
    {
      /** By starting at the current time */
      class: 'Int',
      name: 'lastTimeUsed_',
      factory: function() { return Date.now(); }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      self.delegate.listen(self.QuickSink.create({
        putFn: this.onPut,
        removeFn: this.onRemove
      }));
    },

    /** Calculates a timestamp to use in the tracking dao. */
    function getTimestamp() {
      // Just increment on each request.
      return this.lastTimeUsed_++;
    },

    /** to keep the dao size. */
    function cleanup() {
      var self = this;
      self.trackingDAO
        .orderBy(self.DESC(self.LRUCacheItem.TIMESTAMP))
        .skip(self.maxSize)
        .select({
          put: function(obj) {
            self.dao.remove(obj);
          }
        });
    },

    function find_(x, id) {
      var self = this;

      self.trackingDAO.select().then(function(o) {
        console.log("select : ", o.array.length);
      });
        return this.trackingDAO.find_(x, id).then(function(o) {
        console.log("id : " + id);
          if ( o ) {
            console.log("1 : ", o);
            return o;
          } else {
            self.delegate.find_(x, id).then(function(o) {
              if ( o ) {
                console.log("2 : ", o);
                self.put(x, o)
                return o;
              } else {
                console.log("3 : ", o);
                return null;
              }
            })
          }
        });


//      return self.trackingDAO.find_(x, id).then(function(o) {
//        if ( o ) return o || self.delegate.find_(x, id).then(function(o) {
//        console.log("2 : " + o);
//          return o ? self.trackingDAO.put(x, o) : null;
//        });
//      });
    },

    function put(x, obj) {
    console.log("LRU put : " + obj.id);
      var self = this;
      return this.trackingDAO.put(
         this.LRUCacheItem.create({
           id: obj.id,
           timestamp: self.getTimestamp()
         })
       ).then(function() {
         self.cleanup();
         //self.delegate.put_(x, obj);
         console.log("here I am");

         self.trackingDAO.select().then(function(tCount) {
                 console.log("tCount 2: " + tCount.array.length);
               })
      });
    },

    function remove(x, o) {
    console.log("LRU remove");
      var self = this;
      return self.trackingDAO.remove(o).then(function() {
        return self.delegate.remove_(x, o);
      });
    }
  ],

  listeners: [
    /** Adds the put() item to the tracking dao, runs cleanup() to check the dao size. */
    function onPut(obj) {
      console.log("onPut");

      var self = this;
      this.trackingDAO.put(
        this.LRUCacheItem.create({
          id: obj.id,
          timestamp: self.getTimestamp()
        })
      ).then(function() {
        self.cleanup();
      });
    },

    /** Clears the remove()'d item from the trackingDAO. */
    function onRemove(obj) {
      var self = this;
      console.log("onRemove");
      this.trackingDAO.remove(obj);
      this.trackingDAO.select().then(function(tCount) {
                       console.log("tCount 3: " + tCount.array.length);
                     })
    }
  ]
});
