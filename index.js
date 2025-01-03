import simpleOctokit from 'simple-octokit'
import wget from 'node-wget'
import fs from 'fs'

(async () => {

  const test = ""
  const map = new Map()
  const owner = process.env.OWNER
  const token = process.env.GITHUB_TOKEN
  const octokit = simpleOctokit(token)
  const markdown = [`
  <div align="center">
  <img width="47%" src="stats.svg" />
  &nbsp;
  <img width="50%" src="streak.svg" />
  <img width="57%" src="activity.svg" >
  &nbsp;
  <img width="40%" src="trophy.svg" />
  </div>
  <hr />
  \n\n`]

  /**
   * Initialize
   *
   */
  const init = async () => {
    [
      { dest: `.${test}/stats.svg`, url: `https://github-readme-stats.vercel.app/api?username=${owner}&theme=react&show_icons=true&rank_icon=github&count_private=true&hide_border=true&role=OWNER,ORGANIZATION_MEMBER,COLLABORATOR` },
      { dest: `.${test}/streak.svg`, url: `https://streak-stats.demolab.com?user=${owner}&theme=react&hide_border=true&date_format=M%20j%5B%2C%20Y%5D` },
      { dest: `.${test}/activity.svg`, url: `https://github-readme-activity-graph.vercel.app/graph?username=${owner}&theme=react&radius=50&hide_border=true&hide_title=false&area=true&custom_title=Total%20contribution%20graph%20in%20all%20repo` },
      { dest: `.${test}/trophy.svg`, url: `https://github-profile-trophy.vercel.app/?username=${owner}&theme=discord&no-frame=true&row=2&column=4` }
    ].map(async (svg) => await wget({url: svg.url, dest: svg.dest}))
    upsertMap(await getReposStarredByUser(octokit, owner))
    markdown.push(getTOCMarkdown())
    for (const language of sortedMapKeys()) { markdown.push(getH2Markdown(language)) }
    fs.writeFileSync(`.${test}/README.md`, markdown.join('\n\n'))
  }

  /**
   * Fetches a list of starred repositories by user.
   *
   * @param {simpleOctokit} octokit - The simpleOctokit instance to use.
   * @param {string} username - The GitHub username to fetch starred repositories for.
   * @returns {Promise<string[]>} A promise resolving to an array of repository names.
   */
  const getReposStarredByUser = async (octokit, username) => {
    let result = []
    for await (const response of octokit.activity.listReposStarredByUser.all({ username })) {
      for (const repository of response.data) { result.push(repository) }
    }
    return result
  }

  /**
   * Upserts the map.
   *
   * @param {Map<string, any[]>} map - The map.
   * @param {any} repositories - The repositories.
   */
  const upsertMap = (repositories) => {
    for (const repository of repositories) {
      const key = repository.language ?? ' '
      if (map.has(key)) {
        const obj = map.get(key)
        obj.push(repository)
        map.set(key, obj)
      } else map.set(key, [repository])
    }
  }

  /**
   * Returns an array of sorted keys from a map.
   *
   * @param {Map<string, any>} map - The map to extract keys from.
   * @returns {string[]} An array of sorted keys.
   */
  const sortedMapKeys = () => { return Array.from(map.keys()).sort((a, b) => a.localeCompare(b)) }

  /**
   * Gets TOC Markdown string.
   *
   * @param {Map<string, any>} map - The map to convert.
   * @returns {string} The converted TOC Markdown string.
   */
  const getTOCMarkdown = () => {
    return Array.from(sortedMapKeys(map)).map((key) => { 
      return `[${key}](#-${key.toLowerCase().replace(/ /g, '-')})`
    }).join(' ✨ ')
  }

  /**
   * Gets H2 Markdown string.
   *
   * @param {string} groupKey - The key of the group.
   * @param {object[]} groupValue - The value of the group (an array of repositories).
   * @returns {string} The converted H2 Markdown string.
   */
  const getH2Markdown = (language) => {
    const repos = map.get(language)
    language = language.replace(/ /g, '-')
    return [
      `## ✨ ${language}\n`,
      repos.map((repo) => { return `\n- [${repo.name}](${repo.html_url}) - ${repo.description}` })
    ].join('\n')
  }

  init()

})()