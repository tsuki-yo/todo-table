#!/bin/bash

# --- Parameter Parsing ---
VERSION_TYPE=""
while getopts v: flag; do
    case "${flag}" in
        # Type of version bump (major, minor, patch)
        v) VERSION_TYPE=${OPTARG};;
    esac
done

# --- Validate bump type ---
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo "Error: Invalid version type specified: '$VERSION_TYPE'. Use major, minor, or patch." >&2
  exit 1
fi
echo "Version type requested: $VERSION_TYPE" >&2

# --- Fetch latest tags and ensure full history ---
echo "Fetching tags and history from origin..." >&2
git fetch origin --tags --quiet
git fetch --prune --unshallow --quiet 2>/dev/null

# --- Find latest SemVer tag (X.Y.Z format, explicitly NO 'v' prefix) ---
echo "Finding latest SemVer tag (X.Y.Z format, excluding v-prefixed tags)..." >&2
# --- !! ADJUST DEFAULT AS NEEDED !! ---
# Pattern for X.Y.Z format - anchored start/end, requires digits
TAG_PATTERN='^[0-9]+\.[0-9]+\.[0-9]+$'
# Default version WITHOUT 'v' prefix
DEFAULT_VERSION="0.1.0"
# --- End Adjustments ---

# List all tags, sort by version, filter using the anchored pattern, get latest
# This grep ensures we only match tags strictly adhering to X.Y.Z format
LATEST_TAG=$(git tag -l --sort=version:refname | grep -E "${TAG_PATTERN}" | tail -n 1)
CURRENT_VERSION="${LATEST_TAG:-${DEFAULT_VERSION}}" # Use default if LATEST_TAG is empty
echo "Current version found: $CURRENT_VERSION" >&2

# --- Increment Version ---
# Assign directly as CURRENT_VERSION should not have a 'v' prefix now
BASE_VERSION="$CURRENT_VERSION"
IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE_VERSION"

case "$VERSION_TYPE" in
  "major") ((MAJOR++)); MINOR=0; PATCH=0 ;;
  "minor") ((MINOR++)); PATCH=0 ;;
  "patch") ((PATCH++)) ;;
esac

# --- Construct New Tag (NO 'v' prefix) ---
NEW_TAG="${MAJOR}.${MINOR}.${PATCH}"
echo "($VERSION_TYPE) Calculated new version: $NEW_TAG" >&2

# --- Check if HEAD commit is already tagged with the *new* tag ---
CURRENT_HASH=$(git rev-parse HEAD)
EXISTING_TAG_MATCH=$(git tag --points-at "$CURRENT_HASH" | grep -Fx "$NEW_TAG") # Use -F for fixed string, -x for exact line match

if [ -n "$EXISTING_TAG_MATCH" ]; then
  echo "Commit $CURRENT_HASH is already tagged with $NEW_TAG. No action needed." >&2
  # Output the existing/calculated tag for subsequent jobs
  echo "::set-output name=new_tag::$NEW_TAG"
  exit 0
fi

# --- Tag and Push ---
echo "Tagging commit $CURRENT_HASH with $NEW_TAG..." >&2
git tag "$NEW_TAG" "$CURRENT_HASH"

echo "Pushing tag $NEW_TAG to origin..." >&2
git push origin "$NEW_TAG"
PUSH_EXIT_CODE=$?

# Check if push was successful
if [ $PUSH_EXIT_CODE -ne 0 ]; then
    echo "Error: Failed to push tag $NEW_TAG to origin. Exit code: $PUSH_EXIT_CODE" >&2
    echo "Please check workflow permissions (needs contents: write) and tag conflicts." >&2
    exit 1 # Exit with error
fi

echo "Successfully tagged commit $CURRENT_HASH and pushed tag $NEW_TAG." >&2

# --- Set Output for other jobs ---
echo "::set-output name=new_tag::$NEW_TAG"

exit 0