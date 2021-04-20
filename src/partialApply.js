const ___ = Symbol("___")

const partialApply = (...args) => (f) => {
    if(args.length === 0) { return f };

    const firstArg = args[0];
    const otherArgs = args.slice(1);
    if (firstArg === ___) {
        return (x) => partialApply(...otherArgs)(f(x));
    }
    return partialApply(...otherArgs)(f(firstArg));
};