/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

describe('EnabledAwareDAO', function() {
  var Entity;
  var dao_;

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.dao.test',
      name: 'Entity',

      properties: [
        'id',
        'enabled'
      ]
    });
    Entity = foam.dao.test.Entity;
    dao_ = foam.dao.EnabledAwareDAO.create({
      of: Entity,
      delegate: foam.dao.ArrayDAO.create({ of: Entity })
    });
  });

  it('should not find disabled entity', function() {
    dao_.put(Entity.create({ id: 1, enabled: false }));
    dao_.find(1).then(function(o) {
      expect(o).toBeNull();
    });
  });

  it('should not include disabled entity on select', function() {
    dao_.put(Entity.create({ id: 1, enabled: false }));
    dao_.put(Entity.create({ id: 2, enabled: true }));
    dao_.select().then(function(db) {
      expect(db.array.length).toEqual(1);
      expect(db.array[0].id).toEqual(2);
    });
  });
});
