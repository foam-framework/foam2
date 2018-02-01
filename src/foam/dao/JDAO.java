/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.ClassInfo;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;

public class JDAO
    extends AbstractJDAO
{
  protected Outputter outputter_ = new Outputter(OutputterMode.STORAGE);

  public JDAO(foam.core.X x, ClassInfo classInfo, String filename) {
    this(x, new MapDAO(classInfo), filename);
  }

  public JDAO(foam.core.X x, DAO delegate, String filename) {
    super(x, delegate, filename);
  }

  @Override
  protected Outputter getOutputter() {
    return outputter_;
  }
}
