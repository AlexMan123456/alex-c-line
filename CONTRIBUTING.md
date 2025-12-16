## General workflow summary

1. Create the skeleton of the feature.
2. Add tests if necessary.
3. Implement the feature, using the tests to guide you if present.
4. Commit the feature by itself.
5. If intending to release, create a release note, carefully deciding if it's a major, minor, or patch release (if adding to a release that is about to happen, add to the existing note)
6. Commit the release note separately from the feature.
7. Create a feature pull request and wait for it to be merged, choosing the appropriate template.
8. Run the commit-version-change workflow to create a pull request to change just the version.
9. Merge it in once CI passes.
10. All done!
