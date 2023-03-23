const path = require('path');
const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');

const getTask = (taskConfig) => () => {
  return new Promise(resolve => {
    const { app, name, asyncOktaConfig } = taskConfig;
    console.log(`Start server for ${app}`);
    // 1. start the sample's web server
    const server = spawn(`ASYNC_OKTA_CONFIG=${asyncOktaConfig ? '1' : '0'} yarn`, [
      '--cwd',
      `../apps/${app}`,
      'start:prod'
    ], { stdio: 'inherit' });

    waitOn({
      resources: [
        'http-get://localhost:8080'
      ]
    }).then(() => {
      const wdioConfig = path.resolve(__dirname, 'wdio.conf.cjs');
      const args = ['wdio', 'run', wdioConfig];
      const env = Object.assign({}, process.env);
      const runner = spawn('yarn', args, { stdio: 'inherit', env });

      let returnCode = 1;
      runner.on('exit', function(code) {
        console.log('Test runner exited with code: ' + code);
        returnCode = code;
        server.kill();
      });
      runner.on('error', function(err) {
        server.kill();
        throw err;
      });
      server.on('exit', function(code) {
        console.log('Server exited with code: ' + code);
        resolve({ code: returnCode, app });
      });
    });
  }); 
};

// track process returnCode for each task
const codes = [];
const tasks = [
  {
    name: '@okta/test.app.ng12',
    app: 'angular-v12'
  },
  {
    name: '@okta/test.app.ng13',
    app: 'angular-v13'
  },
  {
    name: '@okta/test.app.ng14',
    app: 'angular-v14'
  },
  {
    name: '@okta/test.app.ng15',
    app: 'angular-v15',
    asyncOktaConfig: true
  },
]
  .reduce((tasks, app) => {
    const task = getTask(app);
    tasks.push(task);
    return tasks;
  }, []);

function runNextTask() {
  if (tasks.length === 0) {
    console.log('all runs are complete');
    if (!codes.length || codes.reduce((acc, curr) => acc + curr, 0) !== 0) {
      // exit with error status if no finished task or any test fails
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
    return;
  }
  const task = tasks.shift();
  task().then(({ code, app }) => {
    if (code !== 0) {
      console.error(`Test failed with ${app}, code: ${code}`);
      process.exit(1);
    }

    codes.push(code);
    runNextTask();
  });
}

runNextTask();
