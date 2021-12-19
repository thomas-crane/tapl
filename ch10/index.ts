type Term
  = { type: 'var', name: string }
  | { type: 'abstraction', body: Term, arg: string, ty: Type }
  | { type: 'application', fn: Term, arg: Term }
  | { type: 'true' }
  | { type: 'false' }
  | { type: 'if', cond: Term, then: Term, el: Term };

type Type
  = { type: 'bool' }
  | { type: 'arr', arg: Type, result: Type };

const BoolTy: Type = { type: 'bool' };
function ArrTy(arg: Type, result: Type): Type {
  return { type: 'arr', arg, result };
}

function cmpTy(t1: Type, t2: Type): boolean {
  if (t1.type === 'arr' && t2.type === 'arr') {
    return cmpTy(t1.arg, t2.arg) && cmpTy(t1.result, t2.result);
  }

  if (t1.type === t2.type) {
    return true;
  }

  return false;
}

type Context = Map<string, Type>;

function mkVar(name: string): Term {
  return { type: 'var', name };
}

function mkAbs(body: Term, arg: string, ty: Type): Term {
  return { type: 'abstraction', body, arg, ty };
}

function mkApp(fn: Term, arg: Term): Term {
  return { type: 'application', fn, arg };
}

const T: Term = { type: 'true' };
const F: Term = { type: 'false' };

function mkIf(cond: Term, then: Term, el: Term): Term {
  return { type: 'if', cond, then, el };
}

function typeCheck(term: Term, ctx: Context): Type {
  switch (term.type) {
    case 'true':
    case 'false':
      return BoolTy;

    case 'if':
      if (!cmpTy(typeCheck(term.cond, ctx), BoolTy)) {
        throw new Error('If condition should be BoolTy.');
      }

      const thenTy = typeCheck(term.then, ctx);
      const elTy = typeCheck(term.el, ctx);
      if (!cmpTy(thenTy, elTy)) {
        throw new Error('Arms of conditional have different types.');
      }

      return elTy;
    case 'var':
      if (!ctx.has(term.name)) {
        throw new Error(`Unbound name ${term.name}`);
      }
      return ctx.get(term.name)!;
    case 'abstraction':
      const newCtx = new Map(ctx.entries());
      newCtx.set(term.arg, term.ty);
      const bodyTy = typeCheck(term.body, newCtx);
      return ArrTy(term.ty, bodyTy);

    case 'application':
      const fnTy = typeCheck(term.fn, ctx);
      const argTy = typeCheck(term.arg, ctx);
      if (fnTy.type !== 'arr') {
        throw new Error('Expected arrow type.');
      }
      if (cmpTy(fnTy.arg, argTy)) {
        return fnTy.result;
      }
      throw new Error('Parameter type mismatch.');
  }
}

function check(term: Term) {
  try {
    typeCheck(term, new Map());
    console.log(`${JSON.stringify(term)} typechecks!`);
  } catch (err) {
    console.log(err.message);
  }
}

// Works.
check(
  mkApp(
    mkAbs(
      mkVar('x'),
      'x',
      BoolTy,
    ),
    T,
  )
);

// Param type mismatch.
check(
  mkApp(
    mkAbs(
      mkVar('x'),
      'x',
      ArrTy(BoolTy, BoolTy),
    ),
    T,
  )
);

// Expected arrow type.
check(
  mkApp(
    T,
    T,
  )
);
