package foam.nanos.fs;

import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.DirectoryStream;
import java.nio.file.Path;

public class UnionStorage implements Storage {

  protected Storage fs_;
  protected Storage rs_;

  UnionStorage(Storage fs, Storage rs) {
    fs_ = fs;
    rs_ = rs;
  }

  @Override
  public File get(String name) {
    return null;
  }

  @Override
  public byte[] getBytes(String name) {
    return new byte[0];
  }

  @Override
  public OutputStream getOutputStream(String name) {
    return fs_.getOutputStream(name);
  }

  @Override
  public InputStream getInputStream(String name) {
    return null;
  }

  @Override
  public DirectoryStream<Path> getDirectoryStream(String name) {
    return getDirectoryStream(name, "");
  }

  @Override
  public DirectoryStream<Path> getDirectoryStream(String name, String glob) {
    return null;
  }
}
