type Term
  = { type: 'true' }
  | { type: 'false' }
  | { type: 'if', cond: Term, then: Term, el: Term }
  | { type: 'zero' }
  | { type: 'succ', t: Term }
  | { type: 'pred', t: Term }
  | { type: 'iszero', t: Term };


const t: Term = { type: 'true' };
const f: Term = { type: 'false' };
const _if: (cond: Term, then: Term, el: Term) => Term = (cond, then, el) => { return { type: 'if', cond, then, el } };
const zero: Term = { type: 'zero' };
const succ: (t: Term) => Term = (t) => { return { type: 'succ', t } };
const pred: (t: Term) => Term = (t) => { return { type: 'pred', t } };
const iszero: (t: Term) => Term = (t) => { return { type: 'iszero', t } };

function isNumValue(term: Term): boolean {
  switch (term.type) {
    case 'zero':
      return true;
    case 'succ':
      return isNumValue(term.t);
    default:
      return false;
  }
}

function isValue(term: Term): boolean {
  switch (term.type) {
    case 'true':
      return true;
    case 'false':
      return true;
    default:
      if (isNumValue(term)) {
        return true;
      }
      return false;
  }
}

function evaluate(term: Term): Term {
  switch (term.type) {
    case 'if':
      switch (term.cond.type) {
        case 'true':
          return term.then;
        case 'false':
          return term.el;
        default:
          return { ...term, cond: evaluate(term.cond) };
      }

    case 'succ':
      return { ...term, t: evaluate(term.t) };

    case 'pred':
      switch (term.t.type) {
        case 'zero':
          return term.t;
        case 'succ':
          if (isNumValue(term.t.t)) {
            return term.t.t;
          }
        default:
          return { ...term, t: evaluate(term.t) }
      }

    case 'iszero':
      switch (term.t.type) {
        case 'zero':
          return { type: 'true' };
        case 'succ':
          if (isNumValue(term.t.t)) {
            return { type: 'false' };
          }
        default:
          return { ...term, t: evaluate(term.t) };
      }
  }
  throw new Error('No rule applies');
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


// turns into zero.
console.log(normalForm(_if(t, pred(succ(zero)), f)));

// turns into succ(succ(zero)).
console.log(normalForm(succ(succ(pred(succ(zero))))));

// already in normal form.
console.log(normalForm(t));
