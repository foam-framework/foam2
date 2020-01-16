/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import foam.dao.java.JDAO;
import foam.core.X;
import foam.core.ClassInfo;
import foam.core.FObject;

public class MNDAO extends JDAO {

  public MNDAO(X x, ClassInfo classInfo, String filename) {
    setX(x);
    setOf(classInfo);
    setDelegate(new ObservableDAO(classInfo));
    setJournal(MNJournal.getMNjournal(x, filename));
  }

  @Override
  public FObject put(FObject obj) {
    return obj;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    MedusaEntry entry = (MedusaEntry) obj;
    entry.setAction("p");
    ((MNJournal) getJournal()).put(x, "", null, obj);
    getDelegate().put_(x, obj);
    return obj;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    MedusaEntry entry = (MedusaEntry) obj;
    entry.setAction("r");
    ((MNJournal) getJournal()).remove(x, "", null, obj);
    getDelegate().remove_(x, obj);
    return obj;
  }
}
