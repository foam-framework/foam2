package foam.nanos.fs;

import foam.util.SafetyUtil;

import java.nio.file.*;

public class FileSystemStorage extends AbstractStorage {

  String resourceDir_;

  public FileSystemStorage() {
    resourceDir_ = null;
  }

  public FileSystemStorage (String root) {
    resourceDir_ = root;
  }

  @Override
  protected FileSystem getFS() {
      return FileSystems.getDefault();
  }

  @Override
  public Path getPath(String name) {
    FileSystem fs = getFS();
    if ( fs == null ) return null;

    Path path;
    if ( ! SafetyUtil.isEmpty(resourceDir_) ) {
      path = fs.getPath(resourceDir_, name);
    } else {
      path = fs.getPath(name);
    }

    return path;
  }

  @Deprecated
  public java.io.InputStream getResourceAsStream(String name) {
    return getInputStream(name);
  }
}
