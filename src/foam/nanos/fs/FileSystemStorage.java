package foam.nanos.fs;

import foam.util.SafetyUtil;

import java.nio.file.*;

public class FileSystemStorage extends AbstractStorage {

  public FileSystemStorage() {
    super();
  }

  public FileSystemStorage (String root) {
    super(root);
  }

  @Override
  protected FileSystem getFS() {
      return FileSystems.getDefault();
  }

  @Override
  protected Path getRootPath() {
    FileSystem fs = getFS();
    if ( fs == null ) return null;
    return SafetyUtil.isEmpty(resourceDir_) ? fs.getPath("") : fs.getPath(resourceDir_);
  }

  @Override
  protected Path getPath(String name) {
    FileSystem fs = getFS();
    if ( fs == null ) return null;
    return SafetyUtil.isEmpty(resourceDir_) ? fs.getPath(name) : fs.getPath(resourceDir_, name);
  }
}
