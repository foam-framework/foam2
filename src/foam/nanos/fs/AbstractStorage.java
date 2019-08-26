/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.fs;

import foam.util.SafetyUtil;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.DirectoryStream;
import java.nio.file.FileSystem;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import static java.nio.file.StandardOpenOption.APPEND;
import static java.nio.file.StandardOpenOption.CREATE;

public abstract class AbstractStorage
  implements Storage
{

  protected abstract FileSystem getFS();

  protected abstract Path getRootPath();

  protected abstract Path getPath(String name);

  protected String resourceDir_;

  protected AbstractStorage() {
    resourceDir_ = null;
  }

  protected AbstractStorage (String root) {
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
      return Files.newOutputStream(path, CREATE, APPEND);
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

  // TODO Return a list of files names as a List<String> instead of a DirectoryStream<Path>

  @Override
  public Set<String> getAvailableFiles(String name) {
    return getAvailableFiles(name, "");
  }

  @Override
  public Set<String> getAvailableFiles(String name, String glob) {
    Path path = getPath(name);
    Path root = getRootPath();
    if ( path == null || root == null) return null;

    Set<String> paths = new HashSet<>();

    try (DirectoryStream<Path> contents = java.nio.file.Files.newDirectoryStream(path, SafetyUtil.isEmpty(glob) ? "*" : glob)) {
      for ( Path p : contents ) {
        paths.add(root.relativize(p).toString());
      }
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    return paths;
  }

}
