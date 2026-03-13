import { describe, expect, it } from "vitest";
import { resolveSafeHomeFilePath } from "../routes/files.js";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync, realpathSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("resolveSafeHomeFilePath", () => {
  it("allows files under home", () => {
    expect(resolveSafeHomeFilePath("/home/test/image.png", "/home/test")).toBe(
      "/home/test/image.png",
    );
  });

  it("allows relative paths rooted at home", () => {
    expect(resolveSafeHomeFilePath("pics/cat.png", "/home/test")).toBe(
      "/home/test/pics/cat.png",
    );
  });

  it("rejects parent traversal outside home", () => {
    expect(resolveSafeHomeFilePath("../other/image.png", "/home/test")).toBeNull();
  });

  it("rejects prefix collisions outside home", () => {
    expect(resolveSafeHomeFilePath("/home/test2/image.png", "/home/test")).toBeNull();
  });

  it("allows file URIs under home", () => {
    expect(
      resolveSafeHomeFilePath("file:///home/test/pics/cat.png", "/home/test"),
    ).toBe("/home/test/pics/cat.png");
  });

  it("allows Windows drive-letter URIs under home", () => {
    expect(
      resolveSafeHomeFilePath(
        "file:///C:/Users/test/image.png",
        "C:\\Users\\test",
        true,
      ),
    ).toBe("C:\\Users\\test\\image.png");
  });

  it("allows legacy Windows drive-letter paths under home", () => {
    expect(
      resolveSafeHomeFilePath(
        "/C:/Users/test/image.png",
        "C:\\Users\\test",
        true,
      ),
    ).toBe("C:\\Users\\test\\image.png");
  });

  it("infers Windows paths from a Windows home", () => {
    expect(
      resolveSafeHomeFilePath("file:///C:/Users/test/pics/cat.png", "C:\\Users\\test"),
    ).toBe("C:\\Users\\test\\pics\\cat.png");
  });

  it("rejects Windows paths outside home", () => {
    expect(
      resolveSafeHomeFilePath(
        "file:///D:/shared/image.png",
        "C:\\Users\\test",
        true,
      ),
    ).toBeNull();
  });
});

describe("symlink escape detection", () => {
  it("lexical check passes but realpath escapes home boundary", () => {
    const base = mkdtempSync(join(tmpdir(), "porta-test-"));
    const fakeHome = join(base, "home");
    const outside = join(base, "outside");
    const outsideFile = join(outside, "secret.png");

    try {
      mkdirSync(fakeHome, { recursive: true });
      mkdirSync(outside, { recursive: true });
      writeFileSync(outsideFile, "secret");

      // Create symlink: fakeHome/pics -> outside
      symlinkSync(outside, join(fakeHome, "pics"));

      // Lexical check passes (path looks like it's under home)
      const resolved = resolveSafeHomeFilePath(
        join(fakeHome, "pics", "secret.png"),
        fakeHome,
      );
      expect(resolved).not.toBeNull();

      // But realpath reveals the escape
      const realPath = realpathSync(resolved!);
      const realHome = realpathSync(fakeHome);
      expect(realPath.startsWith(realHome + "/")).toBe(false);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});

