/**
 * # Authorization codes example file
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * File must export an array of objects containing at the very least two
 * properties: _AccesCode_, and _ExitCode_. The values of such properties
 * must be unique. 
 *
 * For real authorization codes use at least 32 random characters and digits.
 * ---
 */

var nCodes, i, codes;

nCodes = 100;
codes = [];

for (i = 0 ; i < nCodes; i ++) {
    codes.push({
        AccessCode: i + '_access',
        ExitCode: i + '_exit'
    });
}
        
module.exports = codes;    


