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
    setJournal(new MNJournal.Builder(x)
      .setFilename(filename)
      .setCreateFile(true)
      .build());
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // MN does not have record on old obj;
    //TODO: extra check code should add at here.
    ((MNJournal) getJournal()).writeRaw(x, obj);
    return obj;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    // MM should check if the object is exists.
    ((MNJournal) getJournal()).writeRaw(x, obj);
    return obj;
  }
}
