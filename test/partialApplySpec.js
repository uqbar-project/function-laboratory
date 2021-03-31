describe("partialApply", () => {
    describe("one parameter functions", () => {
        const add2 = (x) => x + 2;
        it("when no parameters are passed it returns the same function", () => {
            const g = partialApply()(add2);
    
            assert.equal(g(2), 4);
        });
    
        it("when a parameter is passed it returns the result of applying that parameter to the function", () => {
            const n = partialApply(2)(add2)
            
            assert.equal(n, 4)
        })
    
        it("when a ___ is passed it returns the same function", () => {
            const g = partialApply(___)(add2);
    
            assert.equal(g(2), 4);
        });
    })
    
    describe("binomial functions", () => {
        const charAt = (string) => (pos) => string[pos]
        it("when no parameters are passed it returns the same function", () => {
            const g = partialApply()(charAt)

            assert.equal(g("hola")(1), "o")
        })
        it("when a parameter is passed it returns the partially applied function", () => {
            const g = partialApply("hola")(charAt)

            assert.equal(g(1), "o");
        })
            
        it("when a parameter AND ___ is passed it partially applies it as the first parameter", () => {
            const g = partialApply("hola", ___)(charAt)

            assert.equal(g(1), "o");
        })
        it("when ___ AND a parameter is passed it partially applies it as the second parameter", () => {
            const g = partialApply(___, 1)(charAt)

            assert.equal(g("hola"), "o")
        })
        it("when both parameters are passed it returns the result of the function", () => {
            const o = partialApply("hola", 1)(charAt)

            assert.equal(o, "o")
        })
        it("when all ___s are passed it returns the same function", () => {
            const g = partialApply(___, ___)(charAt)

            assert.equal(g("hola")(1), "o")
        })
    })
    describe("multiple parameter functions", () => {
        const foldr = (f) => (semilla) => (lista) => lista.reduce(f, semilla)
        const plus = (x, y) => x + y
        it("when no parameters are passed it returns the same function", () => {
            const g = partialApply()(foldr)

            assert.equal(g(plus)(0)([1, 2, 3]), 6);
        })
        it("when ___ is passed and a parameter is passed it applies it in the position it was passed", () => {
            const g = partialApply(___, 0)(foldr)

            assert.equal(g(plus)([1, 2, 3]), 6);
        })
        it("multiple values can be left unapplied", () => {
            const g = partialApply(___, ___, [1, 2, 3])(foldr)

            assert.equal(g(plus)(0), 6);
        })
        it("applied values can be passed between unapplied values", () => {
            const g = partialApply(___, 0, ___)(foldr)

            assert.equal(g(plus)([1, 2, 3]), 6);
        })
        it("unapplied values can be passed between applied values", () => {
            const g = partialApply(plus, ___, [1,2,3])(foldr)

            assert.equal(g(0), 6);
        })
    })
})

