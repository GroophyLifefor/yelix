export function getRedocHTML(pageTitle: string, spec: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${pageTitle}</title>
    <link rel="icon" type="image/png" href="https://docs.yelix.dev/img/redoc-logo.png" />
    <!-- needed for adaptive design -->
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">

    <!--
    Redoc doesn't change outer page styles
    -->
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url="${spec}"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
  </body>
</html>`;
}
