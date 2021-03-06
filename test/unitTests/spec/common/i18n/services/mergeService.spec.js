describe("merge functionality", () => {

    var master, mergeService;

    beforeEach(() => {
        module('bahmni.common.i18n');

        module($provide => {
            _$cookies = jasmine.createSpyObj('$cookies', ['get', 'put', 'remove']);
            $provide.value('$cookies', _$cookies);
        });

        inject(_mergeService_ => {
            mergeService = _mergeService_;
        });

        master = {
            a: {
                c: "Hi",
                d: {
                    e: "Ola",
                    f: "Salut"
                }
            },
            b: "Hello"
        };
    });

    it("should change a leaf value", () => {
        var result = mergeService.merge(master, {
            a: {
                d: {
                    e: "Konnichiwa"
                }

            }
        });
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.d.e).toBe("Konnichiwa");
        expect(result.a.d.f).toBe(master.a.d.f);
    });

    it("should be able to remove a value", () => {
        var result = mergeService.merge(master, {
            a: {
                d: {
                    e: "annyeonghaseyo",
                    f: null
                }

            }
        });
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.c).toBe(master.a.c);
        expect(result.a.d.e).toBe("annyeonghaseyo");
        expect(result.a.d.f).toBeFalsy();
    });


    it("should be able to add a new node", () => {
        var result = mergeService.merge(master, {
            x: {key: "something"}
        });
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.c).toBe(master.a.c);
        expect(result.a.d.e).toBe("Ola");
        expect(result.x.key).toBe("something");
    });

    it("should be able to remove a null node", () => {
        var result = mergeService.merge(master, {
            x: {key: "something"},
            a:{d: null, s:{}}
        });
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.c).toBe(master.a.c);
        expect(result.a.d).toBeFalsy();
        expect(result.a.s).toBeTruthy();
        expect(result.x.key).toBe("something");
    });

    it("should not throw an error for undefined parameter", () => {
        var result = mergeService.merge(master, undefined);
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.c).toBe(master.a.c);
        expect(result.b).toBe(master.b);
        expect(result.a.d.e).toBe(master.a.d.e);
        expect(result.a.d.f).toBe(master.a.d.f);
    });
});
