var arpscanner = require('arpscan');
arpscanner(onResult);

function onResult(err, data){
    if(err) console.console.log(err);
    console.log(data);
}
