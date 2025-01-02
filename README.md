# readme-generator

Generate README.md

## Example Usage

This is workflow example:

```yml
name: "Generate README.md"
on:
  schedule:
    - cron: '0 23 * * 0'
  workflow_dispatch:
    
jobs:
  generate_awesome_readme_job:
    runs-on: ubuntu-latest
    name: Generate README.md
    steps:
      - name: checkout
        uses: actions/checkout@v1
      - name: Generate README.md
        uses: slattman/readme-generator@v1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          owner: 'slattman'
      - name: Commit files
        run: |
          git config --local user.email "slattman@gmail.com"
          git config --local user.name "Brad Slattman"
          git add .
          git commit -m "Add changes"
      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: ${{ github.ref }}
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
