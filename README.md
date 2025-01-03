# readme-generator

Generate README.md

## Example Usage

This is a workflow example:

```yml
name: "Generate README.md"
on:
  schedule:
    - cron: '* * 1 * *'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write    
    name: Generate README.md
    steps:
      - name: checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
      - name: generate
        uses: slattman/readme-generator@v1.0.0
        env:
          GITHUB_TOKEN: ${{ github.token }}
          OWNER: ${{ github.repository_owner }}
      - name: commit
        uses: stefanzweifel/git-auto-commit-action@v5
```

## Inputs

```
github-token:
  description: 'github token'
  required: true
owner:
  description: 'github username'
  required: true
```
