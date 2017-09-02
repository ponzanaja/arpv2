var arpscanner = require('arpscan');
arpscanner(onResult);

function onResult(err, data){
    if(err) throw err;
    console.log(data);
}
