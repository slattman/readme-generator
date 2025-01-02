/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 56:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 693:
/***/ ((module) => {

module.exports = eval("require")("simple-octokit");


/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(56);
const simpleOctokit = __nccwpck_require__(693);
const fs = __nccwpck_require__(896);

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
  let toc = ['## Contents\n'];
  for (const key of sorted_keys) {
    const group_name = `${key}`.replace(/ /g, '-');
    const group = `- [${key}](#${group_name})`;
    toc.push(group);
  }
  return toc.join('\n');
};

const convert_group_to_h2_markdown = (group_key, group_value) => {
  const group_name = `${group_key}`.replace(/ /g, '-');
  let toc = [`## ${group_name}\n`];
  for (const repo of group_value) {
    const group = `- [${repo.name}](${repo.url}) - ${repo.description}`;
    toc.push(group);
  }
  return toc.join(' ');
}

(async () => {
  try {
    const owner = core.getInput('owner');
    const myToken = core.getInput('github-token');
    const octokit = simpleOctokit(myToken);

    const repos = await fetch_starred_repos_with_language(octokit, owner);
    for (const repo of repos) {
      if (repo.language) {
        upsert(topicMap, repo.language, repo);
      } else {
        upsert(topicMap, 'etc', repo);
      }
    }
    
    let markdown = [`
      <div align="center" width='100%'>
      <p align="center">
          <a href="https://github.com/slattman?tab=repositories">
              <img src="https://github-readme-activity-graph.vercel.app/graph?username=slattman&theme=react-dark&hide_border=true&hide_title=false&area=true&custom_title=Total%20contribution%20graph%20in%20all%20repo" width="98%" alt="activity graph">
          </a>
      </p>
      <p align="center">
        <a href="https://github.com/slattman?tab=stars">
          <img src="https://github-readme-streak-stats.herokuapp.com?user=slattman&theme=gotham&hide_border=true&date_format=M%20j%5B%2C%20Y%5D"  width="49%" alt="github-readme-streak-stats"/>
        </a>
        <a href="https://github.com/slattman?tab=repositories">
          <img src="https://github-readme-stats-one-bice.vercel.app/api?username=slattman&theme=gotham&show_icons=true&count_private=true&hide_border=true&role=OWNER,ORGANIZATION_MEMBER,COLLABORATOR"  width="49%" alt="github-readme-stats"/>
        </a>
      </p>
      <p align="center">
      <a href="https://github.com/slattman?tab=stars">
        <img width="50%" height="250px" src="https://github-readme-stats.vercel.app/api/top-langs/?username=slattman&layout=compact&hide_border=true&title_color=00b3ff&text_color=00b4ff&bg_color=0d1117" /></a>
        <a href="https://github.com/slattman?tab=achievements">
          <img src="https://github-profile-trophy.vercel.app/?username=slattman&theme=onestar&no-frame=true&column=4&row=2" width="49%" height="250px" alt="trophy stats"/>
        </a>
      </p>
      \n\n`];

    const toc = convert_maps_to_toc_markdown(topicMap);
    markdown.push(toc);

    const sorted_keys = sorted_map_keys(topicMap);
    for (const group_name of sorted_keys) {
      // skip etc to append at the end
      if (group_name == 'etc') { continue; }
      const group_value = topicMap.get(group_name);
      const group = convert_group_to_h2_markdown(group_name, group_value);
      markdown.push(group);
    }

    if (topicMap.has('etc')) {
      const group_name = 'etc';
      const group_value = topicMap.get(group_name);
      const group = convert_group_to_h2_markdown(group_name, group_value);
      markdown.push(group);
    }

    const result = markdown.join("\n\n");
    fs.writeFileSync('README.md', result);

  } catch (error) {
    core.setFailed(error.message);
  }
})();
module.exports = __webpack_exports__;
/******/ })()
;