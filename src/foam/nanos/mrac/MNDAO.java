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
    return null;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    throw new RuntimeException("Implement.........");
  }
}
