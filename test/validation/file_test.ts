import { inp } from "@/mod.ts";
import { assert } from "@/test/validation/helper.ts";

// Helper function to create real File objects
function createMockFile(options: {
  name?: string;
  type?: string;
  size?: number;
}) {
  const size = Math.min(options.size || 1024, 1024 * 1024); // Cap at 1MB for safety
  const content = new Uint8Array(Math.max(1, size)); // Ensure at least 1 byte
  return new File([content], options.name || "test.txt", {
    type: options.type || "text/plain",
    lastModified: Date.now(),
  });
}

Deno.test("File validation - basic types and required", () => {
  const validator = inp().file();
  const mockFile = createMockFile({});

  assert(validator.validate(mockFile), true);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
});

Deno.test("File validation - multiple files handling", () => {
  const validator = inp().file().multipleFiles();
  const mockFiles = [
    createMockFile({ name: "file1.txt" }),
    createMockFile({ name: "file2.txt" }),
  ];

  assert(validator.validate(mockFiles), true);
  assert(validator.validate([]), true);
});

Deno.test("File validation - minFilesCount", () => {
  const validator = inp().file().multipleFiles().minFilesCount(2);
  const oneFile = [createMockFile({})];
  const twoFiles = [createMockFile({}), createMockFile({})];
  const threeFiles = [
    createMockFile({}),
    createMockFile({}),
    createMockFile({}),
  ];

  assert(validator.validate(oneFile), false);
  assert(validator.validate(twoFiles), true);
  assert(validator.validate(threeFiles), true);
});

Deno.test("File validation - maxFilesCount", () => {
  const validator = inp().file().multipleFiles().maxFilesCount(2);
  const oneFile = [createMockFile({})];
  const twoFiles = [createMockFile({}), createMockFile({})];
  const threeFiles = [
    createMockFile({}),
    createMockFile({}),
    createMockFile({}),
  ];

  assert(validator.validate(oneFile), true);
  assert(validator.validate(twoFiles), true);
  assert(validator.validate(threeFiles), false);
});

Deno.test("File validation - file size constraints", () => {
  const minValidator = inp().file().minSize(100);
  const maxValidator = inp().file().maxSize(200);
  const bothValidator = inp().file().minSize(100).maxSize(200);

  const smallFile = createMockFile({ size: 50 });
  const mediumFile = createMockFile({ size: 150 });
  const largeFile = createMockFile({ size: 250 });

  // Min size tests
  assert(minValidator.validate(smallFile), false);
  assert(minValidator.validate(mediumFile), true);
  assert(minValidator.validate(largeFile), true);

  // Max size tests
  assert(maxValidator.validate(smallFile), true);
  assert(maxValidator.validate(mediumFile), true);
  assert(maxValidator.validate(largeFile), false);

  // Combined size tests
  assert(bothValidator.validate(smallFile), false);
  assert(bothValidator.validate(mediumFile), true);
  assert(bothValidator.validate(largeFile), false);
});

Deno.test("File validation - mime type validation", () => {
  const singleMimeValidator = inp().file().mimeType("text/plain");
  const multiMimeValidator = inp().file().mimeType(["image/jpeg", "image/png"]);

  const textFile = createMockFile({ type: "text/plain" });
  const jpegFile = createMockFile({ type: "image/jpeg" });
  const pngFile = createMockFile({ type: "image/png" });
  const pdfFile = createMockFile({ type: "application/pdf" });

  // Single mime type tests
  assert(singleMimeValidator.validate(textFile), true);
  assert(singleMimeValidator.validate(jpegFile), false);

  // Multiple mime types tests
  assert(multiMimeValidator.validate(jpegFile), true);
  assert(multiMimeValidator.validate(pngFile), true);
  assert(multiMimeValidator.validate(pdfFile), false);

  // Multiple files mime type test
  const multiFileValidator = inp()
    .file()
    .multipleFiles()
    .mimeType(["image/jpeg", "image/png"]);
  assert(multiFileValidator.validate([jpegFile, pngFile]), true);
  assert(multiFileValidator.validate([jpegFile, pdfFile]), false);
});

Deno.test("File validation - edge cases", () => {
  const validator = inp()
    .file()
    .multipleFiles()
    .minFilesCount(1)
    .maxFilesCount(3);

  // Empty array
  assert(validator.validate([]), false);

  // Zero size file
  const zeroSizeFile = createMockFile({ size: 0 });
  assert(validator.validate([zeroSizeFile]), true);

  // Empty mime type
  const emptyMimeFile = createMockFile({ type: "" });
  assert(validator.validate([emptyMimeFile]), true);

  // Maximum possible file size
  const maxSizeFile = createMockFile({ size: Number.MAX_SAFE_INTEGER });
  assert(validator.validate([maxSizeFile]), true);
});

Deno.test("File validation - chaining multiple validations", () => {
  const validator = inp()
    .file()
    .multipleFiles()
    .minFilesCount(1)
    .maxFilesCount(3)
    .maxSize(2000)
    .mimeType(["image/jpeg", "image/png"]);

  const validFile = createMockFile({ size: 1500, type: "image/jpeg" });
  const invalidSizeFile = createMockFile({ size: 2500, type: "image/jpeg" });
  const invalidTypeFile = createMockFile({ size: 1500, type: "text/plain" });

  assert(validator.validate([validFile]), true);
  assert(validator.validate([validFile, validFile]), true);
  assert(validator.validate([invalidSizeFile]), false);
  assert(validator.validate([invalidTypeFile]), false);
  assert(
    validator.validate([validFile, validFile, validFile, validFile]),
    false,
  );
});

Deno.test("File validation - non-file inputs", () => {
  const validator = inp().file();

  assert(validator.validate("not a file"), false);
  assert(validator.validate(123), false);
  assert(validator.validate({}), false);
  assert(validator.validate({ name: "test.txt", type: "text/plain" }), false);
  assert(validator.validate(true), false);
});

Deno.test("File validation - optional", () => {
  const validator = inp().file().optional();
  const mockFile = createMockFile({});

  assert(validator.validate(mockFile), true);
  assert(validator.validate(undefined), true);
  assert(validator.validate(null), true);
  assert(validator.validate("not a file"), false);
  assert(validator.validate(123), false);
});
