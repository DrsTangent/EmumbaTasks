const { verifyUser } = require("./../../middlewares/authentication");

const next = jest.fn();

test("adds 1 + 2 to equal 3", () => {

    const req = {

    }


    verifyUser(req,{},next)

    expect(3).toBe(3);
    expect(next).toBe.called()
});
