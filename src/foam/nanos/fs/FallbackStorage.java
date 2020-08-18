package foam.nanos.fs;

import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
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
    Set<String> paths = storage_.getAvailableFiles(name, glob);
    if ( paths == null ) return fallback_.getAvailableFiles(name, glob);
    try {
      paths.addAll(fallback_.getAvailableFiles(name, glob));
    } catch ( RuntimeException e ) {
      // Fallback is allowed to fail in this case
    }
    return paths;
  }
}
