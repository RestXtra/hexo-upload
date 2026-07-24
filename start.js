const { spawn } = require('child_process')
const path = require('path')

const CLIENT_DIR = path.join(__dirname, 'client')
const isWin = process.platform === 'win32'

process.title = 'hexo-upload'

const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: isWin
})

const vite = spawn('npx', ['vite', '--host', '0.0.0.0'], {
  cwd: CLIENT_DIR,
  stdio: 'inherit',
  shell: isWin
})

function cleanup() {
  server.kill()
  vite.kill()
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('exit', cleanup)

server.on('exit', (code) => {
  console.log('后端服务已退出')
  vite.kill()
  process.exit(code)
})

vite.on('exit', () => {
  console.log('前端服务已退出')
  server.kill()
  process.exit()
})