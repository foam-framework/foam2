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
    extends ProxyBlob
{
  protected File file_;

  public FileBlob(File file) throws FileNotFoundException {
    file_ = file;
    setDelegate(new InputStreamBlob(new FileInputStream(file), (int) file.length()));
  }

  public File getFile() {
    return this.file_;
  }
}