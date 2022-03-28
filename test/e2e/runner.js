const path = require('path');
const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');

const getTask = (app) => () => {
  return new Promise(resolve => {
    console.log(`Start server for ${app}`);
    const server = spawn('yarn', [
      '--cwd',
      `../apps/${app}`,
      'start:prod'
    ], { stdio: 'inherit' });

    waitOn({
      resources: [
        'http-get://localhost:8080'
      ]
    }).then(() => {
      const wdioConfig = path.resolve(__dirname, 'wdio.conf.js');
      const runner = spawn(
        'npx', [
          'wdio',
          'run',
          wdioConfig
        ],
        { stdio: 'inherit' }
      );

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
  'angular-v12',
  'angular-v13',
  'angular-v14',
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
