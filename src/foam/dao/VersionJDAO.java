/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.ClassInfo;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import java.io.*;

public class VersionJDAO
  extends AbstractJDAO
{
  protected Outputter outputter_ = new Outputter(OutputterMode.STORAGE);

  public VersionJDAO(foam.core.X x, ClassInfo classInfo, String filename) {
    this(x, new MapDAO(classInfo), filename);
  }

  public VersionJDAO(foam.core.X x, DAO delegate, String filename) {
    super(x, delegate, filename + ".1");
    try {
      int index = 0;
      File file = null;
      while ( true ) {
        file = getX().get(foam.nanos.fs.Storage.class).get(filename + "." + index);
        if ( ! file.exists() ) break;
        loadJournal(file);
        index++;
      } 
    } catch ( IOException e ) {
      logger_.error(e);
      throw new RuntimeException(e);
    }
  }

  @Override
  protected Outputter getOutputter() {
    return outputter_;
  }
}