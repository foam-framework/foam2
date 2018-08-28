/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

import java.io.*;
import org.apache.commons.io.IOUtils;

public class PersistedIndex
  extends ProxyIndex
  implements Closeable
{
  protected final File file_;
  protected FileInputStream fis_;
  protected FileOutputStream fos_;

  protected ByteArrayOutputStream bos_ = new ByteArrayOutputStream();

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
    return new PersistedState(state);
  }

  @Override
  public Object unwrap(Object state) {
    PersistedState persisted = (PersistedState) state;

    // not yet persisted
    if ( persisted.getValue() != null ) {
      return persisted.getValue();
    }

    // invalid file position
    long position = persisted.getPosition();
    if ( position < 0 ) {
      throw new RuntimeException("Invalid file position: " + position);
    }

    synchronized ( file_ ) {
      try {
        fis_.getChannel().position(position);

        ObjectInputStream iis = new ObjectInputStream(fis_);
        Object value = iis.readObject();

        persisted.setPosition(-1);
        persisted.setValue(value);
        return value;
      } catch ( Throwable t ) {
        throw new RuntimeException(t);
      }
    }
  }

  @Override
  public void flush(Object state) throws IOException {
    PersistedState persisted = (PersistedState) state;

    // already persisted
    if ( persisted.getPosition() >= 0 ) {
      return;
    }

    // nothing to persist
    if ( persisted.getValue() == null ) {
      throw new RuntimeException("Invalid value: null");
    }

    synchronized ( file_ ) {
      long position = fos_.getChannel().position();

      ObjectOutputStream oos = new ObjectOutputStream(bos_);
      oos.writeObject(persisted.getValue());
      oos.flush();

      bos_.writeTo(fos_);
      bos_.flush();
      bos_.reset();

      persisted.setPosition(position);
      persisted.setValue(null);
    }
  }

  @Override
  public void close() throws IOException {
    IOUtils.closeQuietly(bos_);
    IOUtils.closeQuietly(fos_);
    IOUtils.closeQuietly(fis_);
  }
}
