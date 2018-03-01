/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.sign;

import foam.core.ClassInfo;
import foam.core.X;
import foam.dao.AbstractJDAO;
import foam.dao.DAO;
import foam.dao.MapDAO;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;

import java.security.PrivateKey;

public class SigningJDAO
    extends AbstractJDAO
{
  protected Outputter outputter_ = null;
  protected String algorithm_ = null;
  protected PrivateKey key_ = null;

  public SigningJDAO(X x, ClassInfo classInfo, String filename, PrivateKey key) {
    this(x, new MapDAO(classInfo), filename, "SHA256with"+key.getAlgorithm(), key);
  }

  public SigningJDAO(X x, ClassInfo classInfo, String filename, String algorithm, PrivateKey key) {
    this(x, new MapDAO(classInfo), filename, algorithm, key);
  }

  public SigningJDAO(X x, DAO delegate, String filename, PrivateKey key) {
    this(x, delegate, filename, "SHA256with"+key.getAlgorithm(), key);
  }

  public SigningJDAO(X x, DAO delegate, String filename, String algorithm, PrivateKey key) {
    super(x, delegate, filename);
    algorithm_ = algorithm;
    key_ = key;
  }

  @Override
  protected Outputter getOutputter() {
    if ( outputter_ == null ) {
      outputter_= new Outputter(OutputterMode.STORAGE);
      outputter_.setOutputSignature(true);
      outputter_.setSigningAlgorithm(algorithm_);
      outputter_.setSigningKey(key_);
    }
    return outputter_;
  }
}