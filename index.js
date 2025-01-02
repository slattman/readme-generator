const core = require('@actions/core');
const git = require('simple-git');
const simpleOctokit = require('simple-octokit');
const wget = require('node-wget');
const fs = require('fs');

const fetch_starred_repos_with_language = async (octokit, username) => {
  let result = [];
  for await (const response of octokit.activity.listReposStarredByUser.all({ username })) {
    for (const repository of response.data) {
      result.push(repository);
    }
  }
  return result;
};

const upsert = (map, key, value) => {
  if (map.has(key)) {
    let obj = map.get(key);
    obj.push(value);
    map.set(key, obj);
  } else {
    map.set(key, [value]);
  }
};

const sorted_map_keys = (map) => {
  let keys = [];
  for (const key of map.keys()) {
    keys.push(key);
  }
  return keys.sort((a, b) => { 
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
}

const convert_maps_to_toc_markdown = (map) => {
  let sorted_keys = sorted_map_keys(map);
  let toc = [''];
  for (const key of sorted_keys) {
    const group_name = `${key}`.replace(/ /g, '-');
    const group = `[${key}](#${group_name})`;
    toc.push(group);
  }
  return toc.join(' ✨ ');
};

const convert_group_to_h2_markdown = (group_key, group_value) => {
  const group_name = `${group_key}`.replace(/ /g, '-');
  let toc = [`## ✨ ${group_name}\n`];
  for (const repo of group_value) {
    const group = `- [${repo.name}](${repo.html_url}) - ${repo.description}`;
    toc.push(group);
  }
  return toc.join('\n');
}

(async () => {
    const owner = core.getInput('owner');
    const token = core.getInput('github-token');
    const octokit = simpleOctokit(token);
    const topic = new Map();
    const repos = await fetch_starred_repos_with_language(octokit, owner);
    for (const repo of repos) {
      if (repo.language) {
        upsert(topic, repo.language, repo);
      } else {
        upsert(topic, 'etc', repo);
      }
    }
    
    let markdown = [`
<div>
<img width="49%" src="streak.svg" />
<img width="49%" src="stats.svg" />
<img width="57%" src="activity.svg" >
<img width="40%" src="trophy.svg" />
</div>
<hr />
    \n\n`];

    const toc = convert_maps_to_toc_markdown(topic);
    markdown.push(toc);

    const sorted_keys = sorted_map_keys(topic);
    for (const group_name of sorted_keys) {
      if (group_name == 'etc') { continue; }
      const group_value = topic.get(group_name);
      const group = convert_group_to_h2_markdown(group_name, group_value);
      markdown.push(group);
    }

    if (topic.has('etc')) {
      const group_name = 'etc';
      const group_value = topic.get(group_name);
      const group = convert_group_to_h2_markdown(group_name, group_value);
      markdown.push(group);
    }

    const result = markdown.join("\n\n");
    fs.writeFileSync('./test.md', result);
    const svgs = [
      { "dest": "./streak.svg", "url": "https://github-readme-streak-stats.herokuapp.com?user=slattman&theme=react&hide_border=true&date_format=M%20j%5B%2C%20Y%5D" },
      { "dest": "./stats.svg", "url": "https://github-readme-stats-one-bice.vercel.app/api?username=slattman&theme=react&show_icons=true&count_private=true&hide_border=true&role=OWNER,ORGANIZATION_MEMBER,COLLABORATOR" },
      { "dest": "./activity.svg", "url": "https://github-readme-activity-graph.vercel.app/graph?username=slattman&theme=react&radius=50&hide_border=true&hide_title=false&area=true&custom_title=Total%20contribution%20graph%20in%20all%20repo" },
      { "dest": "./trophy.svg", "url": "https://github-profile-trophy.vercel.app/?username=slattman&theme=discord&no-frame=true&row=2&column=4" }
    ];
    svgs.every(async (svg) => {
      await wget({
          url: svg.url,
          dest: svg.dest
      });
    });
    await git().add('.')
      .commit('updates')
      .push(['-u', 'origin', 'main']);

})();