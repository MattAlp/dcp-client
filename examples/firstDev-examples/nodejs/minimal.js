#! /usr/bin/env node
/** 
 * @file      minimal.html
 *
 *            Sample NodeJS application showing how to deploy a minimal DCP job.
 * 
 *            Note: You need to provide a folder '.dcp' in your home directory and put 
 *            your keystore file there. Then, rename it to default.keystore .
 * 
 * @author    Wes Garland, wes@kingsds.network
 * @date      Aug 2019, April 2020
 */ 

const SCHEDULER_URL =  new URL('https://scheduler.distributed.computer') ;

async function main() {
  const compute = require('dcp/compute');

  let job = compute.for(1, 10,
    function(i) {
      progress(0);
      let sum = 0;
      for (let i =0; i < 10000000; i++) {
        sum += Math.random();
        progress(i/10000000);
      }
      return i*3
    }
  )

  job.on('result',function(ev) {
    console.log('received result', ev.result);
  }) 

  job.public.name = 'minimal example, nodejs';                                
  await job.exec(compute.marketValue);
}

require('dcp-client').init(SCHEDULER_URL, true).then(main);
