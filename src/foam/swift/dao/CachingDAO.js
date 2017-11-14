foam.CLASS({
  package: 'foam.swift.dao',
  name: 'CachingDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.dao.PromisedDAO',
    'foam.dao.DAOSink',
  ],

  properties: [
    {
      /** The source DAO on which to add caching. Writes go straight
        to the src, and cache is updated to match.
      */
      class: 'Proxy',
      of: 'foam.dao.DAO',
      required: true,
      forwards: [ 'put_', 'remove_', 'removeAll_' ],
      name: 'src'
    },
    {
      /** The cache to read items quickly. Cache contains a complete
        copy of src. */
      class: 'foam.dao.DAOProperty',
      required: true,
      name: 'cache',
    },
    {
      /**
        Set .cache rather than using delegate directly.
        Read operations and notifications go to the cache, waiting
        for the cache to preload the complete src state. 'Unforward'
        ProxyDAO's default forwarding of put/remove/removeAll.
        @private
      */
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      hidden: true,
      forwards: [ 'find_', 'select_' ],
      swiftExpressionArgs: ['src', 'cache'],
      swiftExpression: `
let pDao = self.PromisedDAO_create()
DispatchQueue.global(qos: .background).async {
  try? cache.removeAll()
  let sink = self.DAOSink_create(["dao": cache])
  _ = try? src.select(sink)
  try? src.listen(sink, nil)
  pDao.promise.set(cache)
}
return pDao
      `,
    },
  ],
});
