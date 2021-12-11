type Term
  = { type: 'var', idx: number, ctxSize: number }
  | { type: 'abstraction', body: Term, argName: string }
  | { type: 'application', fn: Term, arg: Term };

type Context = string[];

enum Binding {
  Name,
}

function mkVar(idx: number, ctxSize: number): Term {
  return { type: 'var', idx, ctxSize };
}

function mkAbs(body: Term, argName: string): Term {
  return { type: 'abstraction', body, argName };
}

function mkApp(fn: Term, arg: Term): Term {
  return { type: 'application', fn, arg };
}

function printTerm(term: Term, ctx: Context) {
  switch (term.type) {
    case 'abstraction':
      const [newCtx, newName] = freshName(term.argName, ctx);
      console.log(`(lambda ${newName}. ${printTerm(term.body, newCtx)})`);
      break;
    case 'application':
      console.log(`(${printTerm(term.fn, ctx)} ${printTerm(term.arg, ctx)})`);
      break;
    case 'var':
      if (ctx.length === term.ctxSize) {
        console.log(ctx[term.idx]);
      } else {
        console.log('[bad index]');
      }
      break;
  }
}

function freshName(name: string, ctx: Context): [Context, string] {
  const newCtx = [...ctx];
  while (newCtx.some((n) => n === name)) {
    name += "'";
  }
  return [newCtx, name];
}

function termShift(shiftBy: number, term: Term): Term {
  function walk(c: number, t: Term): Term {
    switch (t.type) {
      case 'var':
        if (t.idx >= c) {
          return mkVar(t.idx + shiftBy, t.ctxSize + shiftBy);
        } else {
          return mkVar(t.idx, t.ctxSize + shiftBy);
        }
      case 'abstraction':
        return mkAbs(walk(c + 1, t.body), t.argName);
      case 'application':
        return mkApp(walk(c, t.fn), walk(c, t.arg));
    }
  }
  return walk(0, term);
}

function termSubst(j: number, s: Term, term: Term) {
  function walk(c: number, t: Term): Term {
    switch (t.type) {
      case 'var':
        if (t.idx === j + c) {
          return termShift(c, s);
        } else {
          return mkVar(t.idx, t.ctxSize);
        }
      case 'abstraction':
        return mkAbs(walk(c + 1, t.body), t.argName);
      case 'application':
        return mkApp(walk(c, t.fn), walk(c, t.arg));
    }
  }
  return walk(0, term);
}

function termSubstTop(t1: Term, t2: Term) {
  return termShift(-1, termSubst(0, termShift(1, t2), t1));
}

function isValue(term: Term): boolean {
  return term.type === 'abstraction';
}

function evaluate(term: Term): Term {
  switch (term.type) {
    case 'application':
      if (term.fn.type === 'abstraction' && isValue(term.arg)) {
        return termSubstTop(term.arg, term.fn.body);
      }
      if (isValue(term.fn)) {
        return mkApp(term.fn, evaluate(term.arg));
      }
    default:
      throw new Error('no rule applies.');
  }
}

function normalForm(term: Term): Term {
  while (true) {
    try {
      term = evaluate(term);
    } catch {
      return term;
    }
  }
}

console.log(normalForm(
  mkApp(
    mkAbs(
      mkAbs(
        mkVar(1, 2),
        'y',
      ),
      'x',
    ),
    mkAbs(mkVar(0, 1), 'z'),
  ),
));
