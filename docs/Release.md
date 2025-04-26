# Release

## How to release a new version for Yelix

1. **Create a new release branch**
   - Create a new branch from `main` with the version number, e.g.,
     `release/v1.0.0`.
   - Use the command: `git switch -c release/v1.0.0`.

2. **Update the version number**
   - Follow the semantic versioning rules.
   - Update the version number with `deno task bump:patch`,
     `deno task bump:minor`, or `deno task bump:major` as needed.
   - This will update the version in `deno.json`, `jsr.json` and `version.ts`
     files.

3. **Update the changelog**
   - Update the `CHANGELOG.md` file with the new version number and a summary of
     changes.

4. **Commit the changes**
   - Commit the changes with a message like `Release v1.0.0`.
   - Use the command: `git commit -m "Release v1.0.0"`.
   - Push the changes to the remote repository with
     `git push origin release/v1.0.0`.

5. **Create a pull request**
   - Create a pull request from the `release/v1.0.0` branch to the `main`
     branch.
   - Do not forget to add ChangeLog and version bump to the pull request
     description.
   - Add reviewers and assign the pull request to them.
   - Wait for the pull request to be reviewed and approved.
   - Once approved, merge the pull request into the `main` branch.

6. **Publish the release**
   - This will be done automatically by the CI/CD pipeline.
   - The pipeline will build the project and publish it to the Deno registry.
   - The release will be available at
     [jsr.io/@murat/yelix](https://jsr.io/@murat/yelix)
