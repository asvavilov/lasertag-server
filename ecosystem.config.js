module.exports = {
  apps : [{
    name: 'bot',
    script: 'dist/index.js',
    watch: ['dist'],
    time: true,
  }]
};
