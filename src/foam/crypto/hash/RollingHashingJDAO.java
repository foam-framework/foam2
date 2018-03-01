/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.hash;

import foam.core.ClassInfo;
import foam.core.X;
import foam.dao.JDAO;
import foam.dao.DAO;
import foam.dao.MapDAO;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;

public class RollingHashingJDAO
    extends JDAO
{
  protected String algorithm_ = null;
  protected Outputter outputter_ = null;

  public RollingHashingJDAO(X x, ClassInfo classInfo, String filename) {
    this(x, classInfo, filename, "SHA-256");
  }

  public RollingHashingJDAO(X x, ClassInfo classInfo, String filename, String algorithm) {
    this(x, new MapDAO(classInfo), filename, algorithm);
  }

  public RollingHashingJDAO(X x, DAO delegate, String filename) {
    this(x, delegate, filename, "SHA-256");
  }

  public RollingHashingJDAO(X x, DAO delegate, String filename, String algorithm) {
    super(x, delegate, filename);
    algorithm_ = algorithm;
  }

  @Override
  protected Outputter getOutputter() {
    if ( outputter_ == null ) {
      outputter_ = new Outputter(OutputterMode.STORAGE);
      outputter_.setHashAlgorithm(algorithm_);
      outputter_.setOutputHash(true);
      outputter_.setRollHashes(true);
    }
    return outputter_;
  }
}