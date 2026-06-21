export function convertKrutidevToUnicode(krutidevText: string) {
  if (!krutidevText || typeof krutidevText !== 'string') {
    return { text: '', warnings: [] };
  }

  const warnings: string[] = [];
  let text = krutidevText;

  text = text.replace(/\r\n/g, '\n');

  const REPLACEMENT_MAP: [string, string][] = [
    ['\u2018', '\u201C'],  
    ['\u2019', '\u201D'],  
    ['\u201C', '\u2018'],  
    ['\u201D', '\u2019'],  
    ['\u00E5', '\u0966'],  
    ['\u0192', '\u0967'],  
    ['\u201E', '\u0968'],  
    ['\u2026', '\u0969'],  
    ['\u2020', '\u096A'],  
    ['\u2021', '\u096B'],  
    ['\u02C6', '\u096C'],  
    ['\u2030', '\u096D'],  
    ['\u0160', '\u096E'],  
    ['\u2039', '\u096F'],  
    ['\u00B6+', '\u0958'], 
    ['d+',     '\u0958'],  
    ['[+k',    '\u0959'],  
    ['[+',     '\u0959\u094D'], 
    ['x+',     '\u095A'],  
    ['T+',     '\u091C\u093C\u094D'], 
    ['t+',     '\u091C\u093C'],      
    ['M+',     '\u095C'],  
    ['<+',     '\u095D'],  
    ['Q+',     '\u095E'],  
    [';+',     '\u095F'],  
    ['j+',     '\u0931'],  
    ['u+',     '\u0929'],  
    ['\u00D9k', '\u0924\u094D\u0924'],   
    ['\u00D9',  '\u0924\u094D\u0924\u094D'], 
    ['\u00E4',  '\u0915\u094D\u0924'],   
    ['\u2013',  '\u0926\u0943'],          
    ['\u2014',  '\u0915\u0943'],          
    ['\u00E9',  '\u0928\u094D\u0928'],   
    ['\u2122',  '\u0928\u094D\u0928\u094D'], 
    ['=kk',     '=k'],                    
    ['f=k',     'f='],                    
    ['\u00E0',  '\u0939\u094D\u0928'],   
    ['\u00E1',  '\u0939\u094D\u092F'],   
    ['\u00E2',  '\u0939\u0943'],          
    ['\u00E3',  '\u0939\u094D\u092E'],   
    ['\u00BAz', '\u0939\u094D\u0930'],   
    ['\u00BA',  '\u0939\u094D'],          
    ['\u00ED',  '\u0926\u094D\u0926'],   
    ['{k',      '\u0915\u094D\u0937'],   
    ['{',       '\u0915\u094D\u0937\u094D'], 
    ['=',       '\u0924\u094D\u0930'],   
    ['\u00AB',  '\u0924\u094D\u0930\u094D'], 
    ['N\u00EE', '\u091B\u094D\u092F'],   
    ['V\u00EE', '\u091F\u094D\u092F'],   
    ['B\u00EE', '\u0920\u094D\u092F'],   
    ['M\u00EE', '\u0921\u094D\u092F'],   
    ['<\u00EE', '\u0922\u094D\u092F'],   
    ['|',       '\u0926\u094D\u092F'],   
    ['K',       '\u091C\u094D\u091E'],   
    ['}',       '\u0926\u094D\u0935'],   
    ['J',       '\u0936\u094D\u0930'],   
    ['V\u00AA', '\u091F\u094D\u0930'],   
    ['M\u00AA', '\u0921\u094D\u0930'],   
    ['<\u00AA\u00AA', '\u0922\u094D\u0930'], 
    ['N\u00AA', '\u091B\u094D\u0930'],   
    ['\u00D8',  '\u0915\u094D\u0930'],   
    ['\u00DD',  '\u092B\u094D\u0930'],   
    ['nzZ',     '\u0930\u094D\u0926\u094D\u0930'], 
    ['\u00E6',  '\u0926\u094D\u0930'],   
    ['\u00E7',  '\u092A\u094D\u0930'],   
    ['\u00C1',  '\u092A\u094D\u0930'],   
    ['xz',      '\u0917\u094D\u0930'],   
    ['#',       '\u0930\u0941'],          
    [':',       '\u0930\u0942'],          
    ['v\u201A', '\u0911'],   
    ['vks',     '\u0913'],   
    ['vkS',     '\u0914'],   
    ['vk',      '\u0906'],   
    ['v',       '\u0905'],   
    ['b\u00B1', '\u0908\u0902'], 
    ['\u00C3',  '\u0908'],   
    ['bZ',      '\u0908'],   
    ['b',       '\u0907'],   
    ['m',       '\u0909'],   
    ['\u00C5',  '\u090A'],   
    [',s',      '\u0910'],   
    [',',       '\u090F'],   
    ['_',       '\u090B'],   
    ['Dk', '\u0915'],  
    ['[k', '\u0916'],  
    ['Xk', '\u0917'],  
    ['?k', '\u0918'],  
    ['Pk', '\u091A'],  
    ['Tk', '\u091C'],  
    ['Rk', '\u0924'],  
    ['Fk', '\u0925'],  
    ['.k', '\u0923'],  
    ['/k', '\u0927'],  
    ['\u00E8k', '\u0927'], 
    ['Uk', '\u0928'],  
    ['Ik', '\u092A'],  
    ['Q',  '\u092B'],  
    ['\u00B6', '\u092B\u094D'], 
    ['Ck', '\u092C'],  
    ['Hk', '\u092D'],  
    ['Ek', '\u092E'],  
    ['Yk', '\u0932'],  
    ['Ok', '\u0935'],  
    ['Lk', '\u0938'],  
    ["'k", '\u0936'],  
    ['"k', '\u0937'],  
    ['d', '\u0915'],  
    ['x', '\u0917'],  
    ['\u00C4', '\u0918'], 
    ['\u00B3', '\u0919'], 
    ['p', '\u091A'],  
    ['N', '\u091B'],  
    ['t', '\u091C'],  
    ['>', '\u091D'],  
    ['\u00A5', '\u091E'], 
    ['V', '\u091F'],  
    ['B', '\u0920'],  
    ['M', '\u0921'],  
    ['<', '\u0922'],  
    ['.', '\u0923\u094D'], 
    ['r', '\u0924'],  
    ['n', '\u0926'],  
    ['u', '\u0928'],  
    ['i', '\u092A'],  
    ['c', '\u092C'],  
    ['e', '\u092E'],  
    [';', '\u092F'],  
    ['j', '\u0930'],  
    ['y', '\u0932'],  
    ['G', '\u0933'],  
    ['o', '\u0935'],  
    ['l', '\u0938'],  
    ['g', '\u0939'],  
    ['D', '\u0915\u094D\u200D'],  
    ['[', '\u0916\u094D\u200D'],  
    ['X', '\u0917\u094D\u200D'],  
    ['?', '\u0918\u094D\u200D'],  
    ['P', '\u091A\u094D\u200D'],  
    ['T', '\u091C\u094D\u200D'],  
    ['\u00F7', '\u091D\u094D\u200D'], 
    ['R', '\u0924\u094D\u200D'],  
    ['F', '\u0925\u094D\u200D'],  
    [')', '\u0926\u094D\u0927'], 
    ['/', '\u0927\u094D\u200D'],  
    ['\u00CB', '\u0927\u094D\u200D'], 
    ['\u00E8', '\u0927\u094D\u200D'], 
    ['U', '\u0928\u094D\u200D'],  
    ['I', '\u092A\u094D\u200D'],  
    ['C', '\u092C\u094D\u200D'],  
    ['H', '\u092D\u094D\u200D'],  
    ['E', '\u092E\u094D\u200D'],  
    ['\u00B8', '\u092F\u094D\u200D'], 
    ['Y', '\u0932\u094D\u200D'],  
    ['O', '\u0935\u094D\u200D'],  
    ["'", '\u0936\u094D\u200D'],  
    ['"', '\u0937\u094D\u200D'],  
    ['L', '\u0938\u094D\u200D'],  
    ['\u00CC', '\u0926\u094D\u0926'],   
    ['\u00CD', '\u091F\u094D\u091F'],   
    ['\u00CE', '\u091F\u094D\u0920'],   
    ['\u00CF', '\u0921\u094D\u0921'],   
    ['\u00D1', '\u0915\u0943'],         
    ['\u00D2', '\u092D'],               
    ['\u00D3', '\u094D\u092F'],         
    ['\u00D4', '\u0921\u094D\u0922'],   
    ['\u00D6', '\u091D\u094D'],         
    ['\u00D8', '\u0915\u094D\u0930'],   
    ['\u00D9', '\u0924\u094D\u0924\u094D'], 
    ['\u00DCk', '\u0936'],              
    ['\u00DC', '\u0936\u094D'],         
    ['\u00EA', '\u091F\u094D\u091F'],   
    ['\u00EB', '\u091F\u094D\u0920'],   
    ['\u00EC', '\u0921\u094D\u0921'],   
    ['\u00EF', '\u0921\u094D\u0922'],   
    ['\u00F4', '\u0915\u094D\u0915'],   
    ['sas', 'sa'],                       
    ['pkS', '\u091A\u0948'],  
    ['ks', '\u094B'],  
    ['kS', '\u094C'],  
    ['k',  '\u093E'],  
    ['h',  '\u0940'],  
    ['q',  '\u0941'],  
    ['w',  '\u0942'],  
    ['`',  '\u0943'],  
    ['s',  '\u0947'],  
    ['S',  '\u0948'],  
    ['W',  '\u0945'],  
    ['\u201A', '\u0949'], 
    ['a',  '\u0902'],  
    ['\u00A1', '\u0901'], 
    ['%', '\u0903'],   
    ['\u2022', '\u093D'], 
    ['\u00B7', '\u093D'], 
    ['\u2219', '\u093D'], 
    ['\u00C8', '\u0940\u0902'], 
    ['z',  '\u094D\u0930'], 
    ['+',  '\u093C'],  
    ['~j', '\u094D\u0930'], 
    ['~',  '\u094D'],  
    ['\u00F1', '\u0970'], 
    ['AA', '\u0965'],  
    ['A',  '\u0964'],  
    ['-',  '.'],       
    ['&',  '-'],       
    ['\\', '?'],       
    [']',  ','],       
    ['@',  '/'],       
    ['^',  "'"],       
    ['*',  "'"],       
    ['\u00DE', '"'],   
    ['\u00DF', '"'],   
    ['(',  ';'],       
    ['\u00BC', '('],   
    ['\u00BD', ')'],   
    ['\u00BF', '{'],   
    ['\u00C0', '}'],   
    ['\u00BE', '='],   
    ['\u0152', '\u0970'], 
    ['~ ', '\u094D '], 
    [' \u0903', ':'],  
  ];

  for (const [pattern, replacement] of REPLACEMENT_MAP) {
    if (pattern.length === 0) continue;
    text = text.split(pattern).join(replacement);
  }

  const MATRA_SET = new Set('ािीुूृेैोौंँःॅॉ\u0902\u0901\u0903\u093E\u093F\u0940\u0941\u0942\u0943\u0947\u0948\u094B\u094C\u0945\u0949'.split(''));

  text = text.replace(/\u00B1/g, 'Z\u0902');
  text = text.replace(/\u00C6/g, '\u0930\u094Df');
  text = text.replace(/f\u0902/g, 'fa');

  text = text.replace(/\u00C7/g, 'fa');  
  text = text.replace(/\u00AF/g, 'fa');  
  text = text.replace(/\u00C9/g, '\u0930\u094Dfa'); 

  const clusterRegexSource = '((?:[\\u0915-\\u0939\\u0958-\\u095F]\\u093C?\\u094D[\\u200C\\u200D]?)*[\\u0915-\\u0939\\u0958-\\u095F]\\u093C?)';
  
  text = text.replace(/fa/g, 'fa'); // Do nothing, just checking. Wait, we have fa mapped already
  
  // Replace fa (i-matra + anusvara)
  const faRegex = new RegExp('fa' + clusterRegexSource, 'g');
  text = text.replace(faRegex, '$1\u093F\u0902');
  
  // Replace f (i-matra)
  const fRegex = new RegExp('f' + clusterRegexSource, 'g');
  text = text.replace(fRegex, '$1\u093F');

  // Handle any dangling f or fa
  if (text.includes('fa')) {
    warnings.push('Dangling fa-matra');
    text = text.replace(/fa/g, '\u093F\u0902');
  }
  if (text.includes('f')) {
    warnings.push('Dangling f-matra');
    text = text.replace(/f/g, '\u093F');
  }

  text = text.replace(/\u00CA/g, '\u0940Z');

  let posZ = text.indexOf('Z');
  while (posZ !== -1) {
    if (posZ === 0) {
      text = '\u0930\u094D' + text.substring(1);
      posZ = text.indexOf('Z', 2);
      continue;
    }

    let clusterStart = posZ - 1;
    while (clusterStart > 0) {
      const char = text.charAt(clusterStart);
      if (MATRA_SET.has(char) || char === '\u093C') {
        clusterStart--;
      } else if (clusterStart > 1 && text.charAt(clusterStart - 1) === '\u094D') {
        clusterStart -= 2; // Skip the halant and the consonant before it
      } else {
        break;
      }
    }

    const cluster = text.substring(clusterStart, posZ);

    text = text.substring(0, clusterStart)
          + '\u0930\u094D'   
          + cluster
          + text.substring(posZ + 1); 

    posZ = text.indexOf('Z', clusterStart + 2 + cluster.length);
  }

  const target = '\u093F\u094D';
  let pos = text.indexOf(target);
  while (pos !== -1) {
    const nextChar = text.charAt(pos + 2);
    if (nextChar) {
      const replacement = '\u094D' + nextChar + '\u093F';
      text = text.substring(0, pos) + replacement + text.substring(pos + 3);
    } else {
      text = text.substring(0, pos) + '\u093F';
      break;
    }
    pos = text.indexOf(target, pos + 2);
  }

  text = text.replace(/\u094DZ/g, 'Z');
  
  text = text.replace(/\u093F\u093E/g, '\u0940');
  text = text.replace(/\u093F\u093C/g, '\u093C\u093F');
  text = text.replace(/\u0941\u0942/g, '\u0942');
  text = text.replace(/\u0947\u0948/g, '\u0948');
  text = text.replace(/\u094D\u094D\u0930/g, '\u094D\u0930');
  text = text.replace(/\u094D\u0930\u094D/g, '\u0930\u094D');
  text = text.replace(/\u094D\u094D/g, '\u094D');

  const matraChars = '\u0902\u0901\u0903\u093E\u093F\u0940\u0941\u0942\u0943\u0947\u0948\u094B\u094C\u0945\u0949';
  for (const matra of matraChars) {
    text = text.replace(new RegExp(' ' + matra, 'g'), matra);
  }
  for (const matra of matraChars) {
    text = text.replace(new RegExp(',' + matra, 'g'), matra + ',');
  }
  for (const matra of matraChars) {
    text = text.replace(new RegExp('\u094D' + matra, 'g'), matra);
  }

  text = text.normalize('NFC');

  if (text.includes('\u093F\u093F')) {
    warnings.push('Double ि matra detected — possible conversion artifact');
  }

  return { text, warnings };
}

export function processTextK2U(text: string) {
  const MAX_CHUNK_SIZE = 6000;
  const charCount = text.length;

  if (charCount <= MAX_CHUNK_SIZE) {
    const result = convertKrutidevToUnicode(text);
    return { ...result, charCount };
  }

  let processed = '';
  const warnings: string[] = [];
  let start = 0;

  while (start < charCount) {
    let end = start + MAX_CHUNK_SIZE;
    if (end < charCount) {
      while (end > start && text.charAt(end) !== ' ' && text.charAt(end) !== '\n') end--;
      if (end === start) end = start + MAX_CHUNK_SIZE;
    } else {
      end = charCount;
    }
    const chunk = text.substring(start, end);
    const result = convertKrutidevToUnicode(chunk);
    processed += result.text;
    warnings.push(...result.warnings);
    start = end;
  }

  return { text: processed, warnings: [...new Set(warnings)], charCount };
}
