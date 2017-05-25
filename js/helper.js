
function measurePerformanceOfFunction(functionToMeasure, functionParameter) {
var loop = 1000;
var sum = 0;
for (var i = 0; i <= loop; i++) {
    var t0 = performance.now();
    functionToMeasure(functionParameter);
    var t1 = performance.now();
    if (i !== 0) sum += (t1 - t0);
}

console.log('Average time of ' + functionToMeasure.name + ': ', (sum / loop).toFixed(4), 'milliseconds');
return functionToMeasure(functionParameter);
}

function JSONstringify(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, '\t');
    }

    var 
        arr = [],
        _string = 'color:green',
        _number = 'color:darkorange',
        _boolean = 'color:blue',
        _null = 'color:magenta',
        _key = 'color:red';

    json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var style = _number;
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                style = _key;
            } else {
                style = _string;
            }
        } else if (/true|false/.test(match)) {
            style = _boolean;
        } else if (/null/.test(match)) {
            style = _null;
        }
        arr.push(style);
        arr.push('');
        return '%c' + match + '%c';
    });

    arr.unshift(json);

    console.log.apply(console, arr);
}

function cloneObject(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}