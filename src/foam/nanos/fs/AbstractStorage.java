package foam.nanos.fs;

import foam.util.SafetyUtil;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.DirectoryStream;
import java.nio.file.FileSystem;
import java.nio.file.Files;
import java.nio.file.Path;

public abstract class AbstractStorage implements Storage {

  protected abstract FileSystem getFS();

  protected abstract Path getPath(String name);

  protected String resourceDir_;

  public AbstractStorage() {
    resourceDir_ = null;
  }

  public AbstractStorage (String root) {
    resourceDir_ = root;
  }

  @Override
  public java.io.File get(String name) {
    return new java.io.File(resourceDir_, name).getAbsoluteFile();
  }

  @Override
  public byte[] getBytes(String name) {
    Path path = getPath(name);
    if ( path == null ) return null;

    try {
      return Files.readAllBytes(path);
    } catch (IOException e) {
      return null;
    }
  }

  @Override
  public OutputStream getOutputStream(String name) {
    Path path = getPath(name);
    if ( path == null ) return null;

    try {
      return Files.newOutputStream(path);
    } catch (IOException e) {
      return null;
    }
  }

  @Override
  public InputStream getInputStream(String name) {
    Path path = getPath(name);
    if ( path == null ) return null;

    try {
      return Files.newInputStream(path);
    } catch (IOException e) {
      return null;
    }
  }

  @Override
  public DirectoryStream<Path> getDirectoryStream(String name) {
    return getDirectoryStream(name, "");
  }

  @Override
  public DirectoryStream<Path> getDirectoryStream(String name, String glob) {
    Path path = getPath(name);
    if ( path == null ) return null;

    DirectoryStream<Path> contents;

    try {
      if ( ! SafetyUtil.isEmpty(glob) ) {
        contents = java.nio.file.Files.newDirectoryStream(path);
      } else {
        contents = java.nio.file.Files.newDirectoryStream(path, glob);
      }
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    return contents;
  }

}
