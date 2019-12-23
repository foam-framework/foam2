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
    setJournal(MNJournal.getMNjournal(filename));
  }

  @Override
  public FObject put(FObject obj) {
    System.out.println(obj);
    return obj;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // MN does not have record on old obj;
    ((MNJournal) getJournal()).put_(x, obj);
    return obj;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    // MM should check if the object is exists.
    ((MNJournal) getJournal()).remove_(x, obj);
    return obj;
  }
}
