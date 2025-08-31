import testRunner from 'test-runner-lite';
import mod from './index.js';


testRunner("My Module Tests", { /* onComplete: console.log */ }, (test) => {

    test("Module loads", (check, done) => {
        check("typeof module", typeof mod).mustBe("object").done();
    });
    test("Example function works", (check, done) => {
        const result = mod.add(1, 2);
        check("sum", result).mustBe(3).done();
    });
    test("Example function works skip", { skip: true }, (check, done) => {
        const result = mod.add(1, 2);
        check("sum", result).mustBe(3).done();
    });
    test("Example function works off", { off: true }, (check, done) => {
        const result = mod.add(1, 2);
        check("sum", result).mustBe(3).done();
    });
    test("Async test", async (check, done) => {
        const val = await Promise.resolve("nano");
        check("value", val).mustInclude("nano").done();
    });
});