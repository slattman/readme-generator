import simpleOctokit from 'simple-octokit'
import wget from 'node-wget'
import fs from 'fs'
(async () => {

  const map = new Map()
  const octokit = simpleOctokit(process.env.GITHUB_TOKEN)
  const owner = process.env.OWNER
  const test = process.env.TEST
  const markdown = [`
  <div id="to-the-top" align="center">
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
    await getSVGs()
    await updateMap()
    markdown.push(getTOCMarkdown())
    for (const language of sortedMapKeys()) { markdown.push(getH2Markdown(language)) } markdown.push('\n<sup>made with ❤️‍🔥</sup>')
    fs.writeFileSync(`.${test}/README.md`, markdown.join('\n\n'))
    console.log("...done")
  }

  /**
   * Get SVGs
   */
  const getSVGs = async () => {
    [ { dest: `.${test}/stats.svg`, url: `https://github-readme-stats.vercel.app/api?username=${owner}&theme=react&show_icons=true&rank_icon=github&count_private=true&hide_border=true&role=OWNER,ORGANIZATION_MEMBER,COLLABORATOR` },
      { dest: `.${test}/streak.svg`, url: `https://streak-stats.demolab.com?user=${owner}&theme=react&hide_border=true&date_format=M%20j%5B%2C%20Y%5D` },
      { dest: `.${test}/activity.svg`, url: `https://github-readme-activity-graph.vercel.app/graph?username=${owner}&theme=react&radius=50&hide_border=true&hide_title=false&area=true&custom_title=Total%20contribution%20graph%20in%20all%20repo` },
      { dest: `.${test}/trophy.svg`, url: `https://github-profile-trophy.vercel.app/?username=${owner}&theme=discord&no-frame=true&row=2&column=4` }
    ].map(async (svg) => { if (!test.length) await wget({url: svg.url, dest: svg.dest}) })    
  }

  /** Update the map. */
  const updateMap = async () => {
    for (const repo of await getReposStarredByUser(octokit, owner)) {
      const key = repo.language ?? '📃'
      if (map.has(key)) {
        const obj = map.get(key)
        obj.push(repo)
        map.set(key, obj)
      } else map.set(key, [repo])
    }
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
    for await (const res of octokit.activity.listReposStarredByUser.all({ username })) {
      for (const repo of res.data) { result.push(repo) }
    } //if (test.length) { console.log(result) }
    return result
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
      return `[${key}](#--${key.toLowerCase().replace(/ /g, '-')})`
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
      `## [🔝 ✨ ${language}](#to-the-top)\n`,
      repos.map((repo) => {
        return `\n - [${repo.full_name}](${repo.html_url}) - ${repo.description?.replace(/\n/g, '')} - *[${repo.topics.map((topic) => { return ' [' + topic + '](https://github.com/topics/' + topic + ')' })} ]* - *last updated on ${new Date(repo.updated_at).toDateString()}*`
      })
    ].join('').replace(/,\n/g, '\n')
  }

init()})()