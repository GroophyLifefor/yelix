const endpoints = [
  await import("./api/body.ts"),
  await import("./api/formData.ts"),
  await import("./api/hello.ts"),
  await import("./api/jsonResponse.ts"),
  await import("./api/query.ts"),
  await import("./api/User/getUser.ts"),
  await import("./endpoints.ts"),
  await import("./main.ts"),
  await import("./test/hello_test.ts"),
];
export default endpoints;
