/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class FileBlob
  extends InputStreamBlob
{
  protected File file_;

  public FileBlob(File file) throws FileNotFoundException {
    super(new FileInputStream(file), (int) file.length());
    file_ = file;
  }

  public File getFile() {
    return this.file_;
  }
}