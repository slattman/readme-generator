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
        uses: slattman/readme-generator@latest
        env:
          GITHUB_TOKEN: ${{ github.token }}
          OWNER: ${{ github.repository_owner }}
      - name: commit
        uses: stefanzweifel/git-auto-commit-action@latest
```
