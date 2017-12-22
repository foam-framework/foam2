/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

import org.apache.commons.io.IOUtils;

import java.io.*;

public class PersistedIndex
    extends ProxyIndex
{
  protected final File file_;
  protected FileInputStream fis_;
  protected FileOutputStream fos_;

  public PersistedIndex(String filename, Index index) throws IOException {
    this.file_ = new File(filename).getAbsoluteFile();
    if ( ! file_.exists() ) {
      if ( ! this.file_.createNewFile() ) {
        throw new IOException("Unable to create file: " + filename);
      }
    }
    this.fis_ = new FileInputStream(this.file_);
    this.fos_ = new FileOutputStream(this.file_);
    setDelegate(index);
  }

  @Override
  public Object wrap(Object state) {
    ByteArrayOutputStream bos = null;
    ObjectOutputStream oos = null;

    synchronized ( file_ ) {
      try {
        bos = new ByteArrayOutputStream();
        oos = new ObjectOutputStream(bos);
        oos.writeObject(state);
        oos.flush();

        bos.writeTo(fos_);
        return fos_.getChannel().position();
      } catch (Throwable t) {
        throw new RuntimeException(t);
      } finally {
        IOUtils.closeQuietly(bos);
        IOUtils.closeQuietly(oos);
      }
    }
  }

  @Override
  public Object unwrap(Object state) {
    synchronized ( file_ ) {
      try {
        long position = (long) state;
        fis_.getChannel().position(position);
        ObjectInputStream iis = new ObjectInputStream(fis_);
        return iis.readObject();
      } catch (Throwable t) {
        throw new RuntimeException(t);
      }
    }
  }
}