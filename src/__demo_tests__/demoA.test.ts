describe("Demo test", () => {
  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });
  it("should pass", () => {
    console.log("Can't see me");
    expect(true).toEqual(true);
  });
  it("should pass again", () => {
    console.log("You should not see this");
    expect(22).toEqual(21 + 1);
  });
  it("should take a second", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(1 + 68).toEqual(69);
  });
});
