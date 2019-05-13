package foam.nanos.fs;

import foam.util.SafetyUtil;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.util.*;

public class Storage {
  private java.io.File root_;

  private boolean isResource_ = false;
  private String resourceDir_;

  public Storage() {
    this(new java.io.File(""));
  }

  public Storage(String root) {
    this(new java.io.File(root));
  }

  public Storage(java.io.File root) {
    root_ = root.getAbsoluteFile();
  }

  public Storage (String root, boolean isResource) {
    isResource_ = isResource;
    resourceDir_ = root;
  }

  protected FileSystem getFS() {
    FileSystem fs;
    switch(System.getProperty("flow.uri.scheme", "file")) {
      case "jar":
        if ( isResource() ) {
          String nanopayJar = System.getenv("NANOPAY_JAR");
          if ( ! SafetyUtil.isEmpty(nanopayJar) ) {
            Path nanopayJarPath = Paths.get(nanopayJar);
            try {
              URI nanopayJarURI = new URI("jar", nanopayJarPath.toUri().toString(), null);
              try {
                fs = FileSystems.getFileSystem(nanopayJarURI);
              } catch (FileSystemNotFoundException e) {
                Map<String, String> env = new HashMap<>();
                env.put("create", "true");
                fs = FileSystems.newFileSystem(nanopayJarURI, env);
              }
            } catch(URISyntaxException | IOException e) {
              throw new RuntimeException(e);
            }
            break;
          }
        }
      case "file":
      default:
        fs = FileSystems.getDefault();
        break;
    }

    return fs;
  }

  protected Path getPath(FileSystem fs, String name) {
    Path path;
    if ( isResource() ) {
      if ( ! SafetyUtil.isEmpty(resourceDir_) ) {
        path = fs.getPath("/", resourceDir_, name);
      } else {
        path = fs.getPath("/", name);
      }
    } else {
      if ( ! SafetyUtil.isEmpty(resourceDir_) ) {
        path = fs.getPath(resourceDir_, name);
      } else {
        path = fs.getPath(name);
      }
    }
    return path;
  }

  public boolean isResource() {
    return isResource_;
  }
  
  public java.io.File get(String name) {
    return new java.io.File(root_, name).getAbsoluteFile();
  }

  public Map<String, InputStream> getDirectoryAsStream(String name) {
    Map<String, InputStream> iStreamMap = new HashMap<>();

    Path path = getPath(getFS(), name);

    DirectoryStream<Path> contents;

    try {
      contents = java.nio.file.Files.newDirectoryStream(path);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    for ( Path p : contents ) {
      try {
        iStreamMap.put(p.getFileName().toString(), Files.newInputStream(p));
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    return iStreamMap;
  }

  public java.io.InputStream getResourceAsStream(String name) {
    Path path = getPath(getFS(), name);

    if ( ! Files.isReadable(path) ) return null;
    try {
      return Files.newInputStream(path);
    } catch (IOException e) {
      return null;
    }
  }
}
