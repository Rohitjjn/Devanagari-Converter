const DEVA_RANGE = /[\u0900-\u097F]/;
const IMATRA_RE = /([\u0915-\u0939](?:्[\u0915-\u0939])*)ि/g;
const REPH_RE = /र्([\u0915-\u0939](?:्[\u0915-\u0939])*)/g;

const KRU_MAP = new Map([
  ['^','\u2018'],['*','\u2019'],['Þ','\u201C'],['ß','\u201D'],
  ['\u2018','\u201C'],['\u2019','\u201D'],['\u201C','\u2018'],['\u201D','\u2019'],
  ['å','\u0966'],['ƒ','\u0967'],['„','\u0968'],['…','\u0969'],
  ['†','\u096A'],['‡','\u096B'],['ˆ','\u096C'],['‰','\u096D'],
  ['Š','\u096E'],['‹','\u096F'],
  ['¶+','\u0958\u094D'],['d+','\u0958'],['[+k','\u0959'],['[+','\u0959\u094D'],
  ['x+','\u095A'],['T+','\u091C\u093C\u094D'],['t+','\u091C\u093C'],
  ['M+','\u095C'],['<+','\u095D'],['Q+','\u095B'],[';+','\u095F'],
  ['j+','\u0931'],['u+','\u0929'],
  ['Ùk','\u0924\u094D\u0924'],['Ù','\u0924\u094D\u0924\u094D'],
  ['ä','\u0915\u094D\u0924'],['–','\u0926\u0943'],['—','\u0915\u0943'],
  ['é','\u0928\u094D\u0928'],['™','\u0928\u094D\u0928\u094D'],
  ['=kk','=k'],['f=k','f='],
  ['à','\u0939\u094D\u0928'],['á','\u0939\u094D\u092F'],['â','\u0939\u0943'],
  ['ã','\u0939\u094D\u092E'],['ºz','\u0939\u094D\u0930'],['º','\u0939\u094D'],
  ['í','\u0926\u094D\u0926'],['{k','\u0915\u094D\u0937'],['{','\u0915\u094D\u0937\u094D'],
  ['=','\u0924\u094D\u0930'],['«','\u0924\u094D\u0930\u094D'],
  ['Nî','\u091B\u094D\u092F'],['Vî','\u091F\u094D\u092F'],['Bî','\u0920\u094D\u092F'],
  ['Mî','\u0921\u094D\u092F'],['<î','\u0922\u094D\u092F'],['|','\u0926\u094D\u092F'],
  ['K','\u091C\u094D\u091E'],['}','\u0926\u094D\u0935'],
  ['J','\u0936\u094D\u0930'],['Vª','\u091F\u094D\u0930'],['Mª','\u0921\u094D\u0930'],
  ['<ªª','\u0922\u094D\u0930'],['Nª','\u091B\u094D\u0930'],
  ['Ý','\u092B\u094D\u0930'],
  ['nzZ','\u0930\u094D\u0926\u094D\u0930'],['æ','\u0926\u094D\u0930'],
  ['Á','\u092A\u094D\u0930'],
  ['xz','\u0917\u094D\u0930'],['#','\u0930\u0941'],[':','\u0930\u0942'],
  ['v\u201A','\u0911'],['vks','\u0913'],['vkS','\u0914'],['vk','\u0906'],['v','\u0905'],
  ['b±','\u0908\u0902'],['bZ','\u0908'],['b','\u0907'],
  ['m','\u0909'],['\u00C5','\u090A'],[',s','\u0910'],[',','\u090F'],['_','\u090B'],
  ['Dk','\u0915'],['[k','\u0916'],['Xk','\u0917'],['?k','\u0918'],
  ['Pk','\u091A'],['Tk','\u091C'],['Rk','\u0924'],['Fk','\u0925'],
  ['.k','\u0923'],['/k','\u0927'],['\u00E8k','\u0927'],
  ['Uk','\u0928'],['Ik','\u092A'],['\u00B6','\u092B\u094D'],
  ['Ck','\u092C'],['Hk','\u092D'],['Ek','\u092E'],
  ['Yk','\u0932'],['Ok','\u0935'],['Lk','\u0938'],
  ["'k",'\u0936'],['"k','\u0937'],
  ['d','\u0915'],['x','\u0917'],['\u00B3','\u0919'],
  ['p','\u091A'],['N','\u091B'],['t','\u091C'],['>','\u091D'],['\u00A5','\u091E'],
  ['V','\u091F'],['B','\u0920'],['M','\u0921'],['<','\u0922'],
  ['.','\u0923\u094D'],['r','\u0924'],['n','\u0926'],['u','\u0928'],
  ['i','\u092A'],['Q','\u092B'],['c','\u092C'],['e','\u092E'],
  [';','\u092F'],['j','\u0930'],['y','\u0932'],['G','\u0933'],
  ['o','\u0935'],['l','\u0938'],['g','\u0939'],
  ['D','\u0915\u094D'],['[','\u0916\u094D'],['X','\u0917\u094D'],['?','\u0918\u094D'],
  ['P','\u091A\u094D'],['T','\u091C\u094D'],['\u00F7','\u091D\u094D'],
  ['R','\u0924\u094D'],['F','\u0925\u094D'],[')','\u0926\u094D\u0927'],
  ['/','\u0927\u094D'],['\u00CB','\u0927\u094D'],['\u00E8','\u0927\u094D'],
  ['U','\u0928\u094D'],['I','\u092A\u094D'],['C','\u092C\u094D'],
  ['H','\u092D\u094D'],['E','\u092E\u094D'],['\u00B8','\u092F\u094D'],
  ['Y','\u0932\u094D'],['O','\u0935\u094D'],["'",'\u0936\u094D'],
  ['"','\u0937\u094D'],['L','\u0938\u094D'],
  ['\u00CC','\u0926\u094D\u0926'],['\u00CD','\u091F\u094D\u091F'],
  ['\u00CE','\u091F\u094D\u0920'],['\u00CF','\u0921\u094D\u0921'],
  ['\u00D1','\u0915\u0943'],['\u00D3','\u094D\u092F'],
  ['\u00D4','\u0921\u094D\u0922'],['\u00D6','\u091D\u094D'],
  ['\u00D8','\u0915\u094D\u0930'],['\u00D9','\u0924\u094D\u0924\u094D'],
  ['\u00DCk','\u0936'],['\u00DC','\u0936\u094D'],
  ['\u00EA','\u091F\u094D\u091F'],['\u00EB','\u091F\u094D\u0920'],
  ['\u00EC','\u0921\u094D\u0921'],['\u00EF','\u0921\u094D\u0922'],
  ['\u00F4','\u0915\u094D\u0915'],['sas','sa'],
  ['pkS','\u091A\u0948'],
  ['ks','\u094B'],['kS','\u094C'],['k','\u093E'],
  ['h','\u0940'],['q','\u0941'],['w','\u0942'],
  ['`','\u0943'],['s','\u0947'],['S','\u0948'],
  ['W','\u0945'],['\u201A','\u0949'],
  ['a','\u0902'],['\u00A1','\u0901'],['%','\u0903'],
  ['\u2022','\u093D'],['\u00B7','\u093D'],['\u2219','\u093D'],
  ['\u00C8','\u0940\u0902'],['z','\u094D\u0930'],
  ['+','\u093C'],['~j','\u094D\u0930'],['~','\u094D'],
  ['\u00F1','\u0970'],
  ['AA','\u0965'],['A','\u0964'],['-','.'],['&','-'],
  ['\\','?'],[']',','],['@','/'],
  ['(',';'],['\u00BC','('],['\u00BD',')'],
  ['\u00BF','{'],['\u00C0','}'],['\u00BE','='],
  ['\u0152','\u0970'],['~ ','\u094D '],[' \u0903',':'],
]);

const UNICODE_TO_KRU = new Map<string, string>();
for (const [kru, uni] of KRU_MAP) {
  if (!UNICODE_TO_KRU.has(uni) || kru.length < UNICODE_TO_KRU.get(uni)!.length) {
    UNICODE_TO_KRU.set(uni, kru);
  }
}

const CONJUNCT_MAP = [
  ['\u0930\u094D\u0926\u094D\u0930','nzZ'],['\u0924\u094D\u0924\u094D','Ù'],
  ['\u0928\u094D\u0928\u094D','™'],['\u0915\u094D\u0937\u094D','{'],
  ['\u0924\u094D\u0930\u094D','«'],['\u0915\u094D\u0937','{k'],
  ['\u0924\u094D\u0930','='],['\u091C\u094D\u091E','K'],
  ['\u0936\u094D\u0930','J'],['\u092A\u094D\u0930','iz'],
  ['\u0915\u094D\u0930','dz'],['\u0926\u094D\u0927',')'],
  ['\u0926\u094D\u0935','}'],['\u091F\u094D\u091F','\u00CD'],
  ['\u091F\u094D\u0920','\u00CE'],['\u0921\u094D\u0921','\u00CF'],
  ['\u0921\u094D\u0922','\u00D4'],['\u0926\u094D\u0926','\u00CC'],
  ['\u0926\u094D\u0930','æ'],['\u0926\u094D\u092F','|'],
  ['\u0917\u094D\u0930','xz'],['\u0924\u094D\u0924','Ùk'],
  ['\u0928\u094D\u0928','é'],['\u0939\u094D\u0928','à'],
  ['\u0939\u094D\u092F','á'],['\u0939\u094D\u092E','ã'],
  ['\u0939\u094D\u0930','ºz'],['\u0939\u094D','º'],
  ['\u0915\u094D\u0924','ä'],['\u092B\u094D\u0930','Ý'],
  ['\u0915\u094D\u0915','\u00F4'],['\u0930\u0941','#'],
  ['\u0930\u0942',':'],['\u091B\u094D\u092F','Nî'],
  ['\u091F\u094D\u092F','Vî'],['\u0920\u094D\u092F','Bî'],
  ['\u0921\u094D\u092F','Mî'],['\u0922\u094D\u092F','<î'],
  ['\u091F\u094D\u0930','Vª'],['\u0921\u094D\u0930','Mª'],
  ['\u0922\u094D\u0930','<ªª'],['\u091B\u094D\u0930','Nª'],
  ['\u0915\u0943','Ñ'],
  ['\u0938\u094D\u0930','lz'],
].sort((a,b)=>b[0].length-a[0].length);

const HALF_FORM_MAP = new Map([
  ['\u0915\u094D','D'],['\u0916\u094D','['],['\u0917\u094D','X'],
  ['\u0918\u094D','?'],['\u091A\u094D','P'],['\u091C\u094D','T'],
  ['\u091D\u094D','\u00F7'],['\u0924\u094D','R'],['\u0925\u094D','F'],
  ['\u0927\u094D','/'],['\u0928\u094D','U'],['\u092A\u094D','I'],
  ['\u092C\u094D','C'],['\u092D\u094D','H'],['\u092E\u094D','E'],
  ['\u092F\u094D','\u00B8'],['\u0932\u094D','Y'],['\u0935\u094D','O'],
  ['\u0936\u094D',"'"],['\u0937\u094D','"'],['\u0938\u094D','L'],
]);

const ASCII_TO_KRU = new Map([
  [',', ']'],    
  ['.', '-'],    
  ['-', '&'],    
  ['?', '\\'], 
  ['/', '@'],    
  [';', '('],    
  ['(', '\u00BC'], 
  [')', '\u00BD'], 
  ['{', '\u00BF'], 
  ['}', '\u00C0'], 
  ['=', '\u00BE'], 
  ["'", '^'],    
  ['"', 'Þ'],    
]);

function applyAsciiMap(text: string) {
  let result = text;
  for (const [ascii, kru] of ASCII_TO_KRU) {
    result = result.split(ascii).join(kru);
  }
  return result;
}

function splitSegments(text: string) {
  const segs: {text: string; isDeva: boolean}[] = [];
  let cur = '', inDeva = false;
  for (const ch of text) {
    const isDeva = DEVA_RANGE.test(ch);
    if (isDeva !== inDeva && cur) { segs.push({text:cur, isDeva:inDeva}); cur=''; }
    inDeva = isDeva; cur += ch;
  }
  if (cur) segs.push({text:cur, isDeva:inDeva});
  return segs;
}

function applyConjuncts(text: string) {
  for (const [uni,kru] of CONJUNCT_MAP) {
    let i = text.indexOf(uni);
    while (i!==-1) { text=text.slice(0,i)+kru+text.slice(i+uni.length); i=text.indexOf(uni,i+kru.length); }
  }
  return text;
}

function reorderReph(text: string) {
  return text.replace(REPH_RE, (m,cluster)=>cluster+'\x02');
}

function reorderIMatra(text: string) {
  return text.replace(IMATRA_RE, (m,cluster)=>'\x01'+cluster);
}

function applyHalfForms(text: string) {
  for (const [uni,kru] of HALF_FORM_MAP) {
    let i = text.indexOf(uni);
    while (i!==-1) { text=text.slice(0,i)+kru+text.slice(i+uni.length); i=text.indexOf(uni,i+kru.length); }
  }
  return text;
}

function mapDevanagariChars(chars: string[]) {
  const out: string[] = [], unmapped = [], seen = new Set();
  for (let i=0;i<chars.length;i++) {
    const ch = chars[i];
    if (ch==='\x01') { out.push('f'); continue; }
    if (ch==='\x02') { out.push('Z'); continue; }
    if (UNICODE_TO_KRU.has(ch)) { out.push(UNICODE_TO_KRU.get(ch)!); continue; }
    if (DEVA_RANGE.test(ch)) {
      const cp = 'U+'+ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4,'0');
      const key = ch+' '+cp;
      if (!seen.has(key)) { seen.add(key); unmapped.push({char:ch,codepoint:cp,position:i}); }
    }
    out.push(ch);
  }
  return {output:out.join(''), unmapped};
}

function postProcess(text: string) {
  const warnings: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i)!;
    if (cp > 255 || (cp < 32 && cp !== 10 && cp !== 13)) {
      const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
      warnings.push(`Non-Windows-1252 character ${hex} at position ${i}`);
    }
  }
  const devaSurvivors: {char: string, hex: string}[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x0900 && cp <= 0x097F) {
      const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
      if (!devaSurvivors.some(s => s.hex === hex)) {
        devaSurvivors.push({char: ch, hex});
      }
    }
  }
  for (const s of devaSurvivors) {
    warnings.push(`UNMAPPED survivor: "${s.char}" ${s.hex} — add to KRU_MAP`);
  }
  return {output: text, warnings};
}

function processDevanagariSegment(text: string) {
  text = reorderIMatra(text);
  text = applyConjuncts(text);
  text = reorderReph(text);
  text = applyHalfForms(text);
  const result: string[] = [];
  const segmentWarnings: string[] = [];
  let devaBuffer: string[] = [];
  
  const flushBuffer = () => {
    if (devaBuffer.length) {
      const mapped = mapDevanagariChars(devaBuffer);
      result.push(mapped.output);
      mapped.unmapped.forEach(u => segmentWarnings.push(`UNMAPPED: "${u.char}" ${u.codepoint}`));
      devaBuffer = [];
    }
  };

  for (const ch of text) {
    if (ch === '\x01' || ch === '\x02' || DEVA_RANGE.test(ch)) {
      devaBuffer.push(ch);
    } else {
      flushBuffer();
      result.push(ch);
    }
  }
  flushBuffer();
  
  let output = result.join('');
  const post = postProcess(output);
  segmentWarnings.push(...post.warnings);
  return { output: post.output, warnings: segmentWarnings };
}

export function convertUnicodeToKrutidev(input: string) {
  const warnings: string[] = [];
  let text = input;

  const segments = splitSegments(text);
  let output = '';
  for (const seg of segments) {
    if (seg.isDeva) {
      const processed = processDevanagariSegment(seg.text);
      output += processed.output;
      warnings.push(...processed.warnings);
    } else {
      output += applyAsciiMap(seg.text);
    }
  }
  return { text: output, warnings };
}

export function processTextU2K(input: string) {
  const MAX_CHUNK_SIZE = 6000;
  const charCount = input.length;

  if (charCount <= MAX_CHUNK_SIZE) {
    const result = convertUnicodeToKrutidev(input);
    return { ...result, charCount };
  }

  let processed = '';
  const warnings: string[] = [];
  let start = 0;

  while (start < charCount) {
    let end = start + MAX_CHUNK_SIZE;
    if (end < charCount) {
      while (end > start && input.charAt(end) !== ' ' && input.charAt(end) !== '\n') end--;
      if (end === start) end = start + MAX_CHUNK_SIZE;
    } else {
      end = charCount;
    }
    const chunk = input.substring(start, end);
    const result = convertUnicodeToKrutidev(chunk);
    processed += result.text;
    warnings.push(...result.warnings);
    start = end;
  }

  return { text: processed, warnings: [...new Set(warnings)], charCount };
}

