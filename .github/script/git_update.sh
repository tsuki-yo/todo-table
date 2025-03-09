#!/bin/bash

VERSION=""

#get parameters
while getopts v: flag
do
    case "${flag}" in
        v) VERSION=${OPTARG};;
    esac
done

# Get the latest tag
git fetch --prune --unshallow 2>/dev/null
CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null)

if [ -z "$CURRENT_VERSION" ]; then
  CURRENT_VERSION="v0.1.0"
fi
echo "Current version: $CURRENT_VERSION"

CURRENT_VERSION=${CURRENT_VERSION#v}
CURRENT_VERSION_PARTS=(${CURRENT_VERSION//./ })
MAJOR=${CURRENT_VERSION_PARTS[0]}
MINOR=${CURRENT_VERSION_PARTS[1]}
PATCH=${CURRENT_VERSION_PARTS[2]}

if [[ $VERSION == "major" ]]; then
  MAJOR=$((MAJOR + 1))
elif [[ $VERSION == "minor" ]]; then
  MINOR=$((MINOR + 1))
elif [[ $VERSION == "patch" ]]; then
  PATCH=$((PATCH + 1))
else  
  echo "Invalid version type. Use major, minor or patch"
  exit 1
fi

# Create the new tag
NEW_TAG="$MAJOR.$MINOR.$PATCH"
echo "($VERSION) updating $CURRENT_VERSION to $NEW_TAG"

#get current hash and see if it already has a tag
CURRENT_HASH=$(git rev-parse HEAD)
NEEDS_TAG=$(git describe --contains $CURRENT_HASH 2>/dev/null)

# only tag if no tag already
if [ -z "$NEEDS_TAG" ]; then
    echo "Tagged with $NEW_TAG"
    git tag $NEW_TAG
    git push --tags
    git push
else
    echo "Already a tag on this commit"
fi

echo ::set-output name=new_tag::$NEW_TAG