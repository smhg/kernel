const cheerio = require('cheerio');
const request = require('request');
const { resolve } = require('url');
const { createWriteStream } = require('fs');

const genericFilter = new RegExp('^(?!.*(lowlatency))linux-.*_(amd64|all)\.deb$', 'gi');

module.exports = function (version) {
  const index = `https://kernel.ubuntu.com/~kernel-ppa/mainline/${version}/`;
  console.log(`INDEX ${index}`);

  request(index, (err, res, body) => {
    if (err) {
      throw err;
    }

    const $ = cheerio.load(body);

    const files = new Set(Array.from($('a[href]').map((idx, el) => $(el).attr('href')))
      .filter(link => genericFilter.test(link)));

    for (const file of files) {
      console.log(`FILE ${file}`);
      request(resolve(index, file)).pipe(createWriteStream(file));
    }

    console.log('sudo dpkg -i *.deb');
  });
}
