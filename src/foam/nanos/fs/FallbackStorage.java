/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.fs;

import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public class FallbackStorage implements Storage {

  protected Storage storage_;
  protected Storage fallback_;

  public FallbackStorage(Storage storage, Storage fallback) {
    storage_ = storage;
    fallback_ = fallback;
  }

  @Override
  public File get(String name) {
    File file = storage_.get(name);
    return file == null ? fallback_.get(name) : file;
  }

  @Override
  public byte[] getBytes(String name) {
    byte[] bytes = storage_.getBytes(name);
    return bytes == null ? fallback_.getBytes(name) : bytes;
  }

  @Override
  public OutputStream getOutputStream(String name) {
    OutputStream os = storage_.getOutputStream(name);
    return os == null ? fallback_.getOutputStream(name) : os;
  }

  @Override
  public InputStream getInputStream(String name) {
    InputStream is = storage_.getInputStream(name);
    return is == null ? fallback_.getInputStream(name) : is;
  }

  @Override
  public Set<String> getAvailableFiles(String name) {
    return getAvailableFiles(name, "");
  }

  @Override
  public Set<String> getAvailableFiles(String name, String glob) {
    Throwable exception = null;
    Set<String> paths = null;
    try {
      paths = storage_.getAvailableFiles(name, glob);
    } catch ( Throwable t ) {
      exception = t;
    }
    try {
      if ( paths == null ) return fallback_.getAvailableFiles(name, glob);
    } catch ( Throwable t ) {
      exception = t;
    }
    try {
      paths.addAll(fallback_.getAvailableFiles(name, glob));
    } catch ( Throwable t ) {
      exception = t;
    }
    if ( paths == null ) {
      if ( exception != null ) {
        throw new RuntimeException(exception.getMessage(), exception);
      }
      return new HashSet<String>();
    }
    return paths;
  }
}
