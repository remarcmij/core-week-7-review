const MOCKS = {
  'prompt-sync': 'mock:prompt-sync',
  chalk: 'mock:chalk',
};

export async function resolve(specifier, context, nextResolve) {
  if (specifier in MOCKS) {
    return { shortCircuit: true, url: MOCKS[specifier] };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url === 'mock:prompt-sync') {
    return {
      shortCircuit: true,
      format: 'module',
      source: PROMPT_SYNC_SOURCE,
    };
  }
  if (url === 'mock:chalk') {
    return {
      shortCircuit: true,
      format: 'module',
      source: CHALK_SOURCE,
    };
  }
  return nextLoad(url, context);
}

const PROMPT_SYNC_SOURCE = `
  import { readSync } from 'node:fs';

  function createPrompt(_config) {
    function prompt(ask) {
      if (ask) process.stdout.write(String(ask));

      const buf = Buffer.alloc(1);
      let line = '';
      while (true) {
        let bytesRead;
        try {
          bytesRead = readSync(0, buf, 0, 1);
        } catch {
          return 'QUIT';
        }
        if (bytesRead === 0) {
          return line.length > 0 ? line : 'QUIT';
        }
        const ch = buf.toString('utf8');
        if (ch === '\\n') return line;
        if (ch !== '\\r') line += ch;
      }
    }

    prompt.hide = (ask) => prompt(ask);
    prompt.history = { save() {} };
    return prompt;
  }

  export default createPrompt;
`;

// A no-op chalk mock: every property returns a function that returns the input string.
// Supports chaining (chalk.red.bold("text")) via a recursive Proxy.
const CHALK_SOURCE = `
  function passthrough(str) { return String(str); }

  const handler = {
    get(_target, _prop) {
      return new Proxy(passthrough, handler);
    },
    apply(_target, _thisArg, args) {
      return String(args[0] ?? '');
    },
  };

  const chalk = new Proxy(passthrough, handler);
  export default chalk;
`;
