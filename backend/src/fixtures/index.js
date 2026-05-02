const path = require('path');

function loadFixture(name) {
  return require(path.join(__dirname, `${name}.json`));
}

module.exports = {
  getOuraFixture: () => loadFixture('oura'),
  getCalendarFixture: () => loadFixture('calendar'),
  getBaselineFixture: () => loadFixture('baseline'),
  getLlmResponseFixture: () => loadFixture('llm-response'),
  getSmsPreviewFixture: () => loadFixture('sms-preview'),
};
