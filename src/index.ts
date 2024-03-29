import * as ci from 'miniprogram-ci';
import analyse from './analyse';

declare var wx: any;
declare var process: any;

interface Options {
  robot: number;
  appid: string;
  version: string;
  projectPath: string;
  privateKeyPath?: string;
  initOptions?: any;
  uploadOptions?: any;
  skipAnalyse?: boolean;
}

const { WEIXIN_PRIVATE_KEY, CI_COMMIT_SHA, GITLAB_USER_LOGIN } = process.env;
const defaults = { robot: 1, skipAnalyse: false, privateKeyPath: WEIXIN_PRIVATE_KEY };
// const privateKeyPath = WEIXIN_PRIVATE_KEY;

async function upload(inProject, { version, robot }, inOptions?) {
  const desc = [`🎉: ${version}`, `🐶: ${GITLAB_USER_LOGIN}`, `🐛: ${CI_COMMIT_SHA}`].join(' ');
  await ci.upload({
    project: inProject,
    version,
    desc,
    setting: {
      es6: true,
      minify: false,
    },
    robot,
    // onProgressUpdate: console.log,
    ...inOptions,
  });
}

const minaDeploy = (inOptions: Options) => {
  const { robot, version, appid, projectPath, privateKeyPath, initOptions, uploadOptions, skipAnalyse } = {
    ...defaults,
    ...inOptions,
  };

  const project = new ci.Project({
    type: 'miniProgram',
    appid,
    projectPath,
    privateKeyPath,
    ...initOptions,
  });

  if (!skipAnalyse) analyse(project);

  return upload(project, { version, robot }, uploadOptions);
};

// for commonjs es5 require
if (typeof module !== 'undefined' && module.exports && typeof wx === 'undefined') {
  module.exports = minaDeploy;
}

export default minaDeploy;
