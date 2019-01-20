/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

describe('DeletedAwareFilteredDAO', function() {
  var Dummy;
  var dao_;

  beforeEach(function() {
    Dummy = foam.nanos.auth.DeletedAwareDummy;
    dao_ = foam.dao.DeletedAwareFilteredDAO.create({
      of: Dummy,
      delegate: foam.dao.ArrayDAO.create({ of: Dummy })
    });
  });

  it('should not find deleted entity', function() {
    dao_.put(Dummy.create({ id: 1, deleted: true }));
    dao_.find(1).then(function(o) {
      expect(o).toBeNull();
    });
  });

  it('should not include deleted entity on select', function() {
    dao_.put(Dummy.create({ id: 1, deleted: true }));
    dao_.put(Dummy.create({ id: 2, deleted: false }));
    dao_.select().then(function(db) {
      expect(db.array.length).toEqual(1);
      expect(db.array[0].id).toEqual(2);
    });
  });
});
