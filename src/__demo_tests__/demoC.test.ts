describe("Demo test", () => {
  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });
  it("should pass", () => {
    expect(true).toEqual(true);
  });
  it("should fail", () => {
    console.log("😈 I'm a debug log from a failing test. You should see me.");
    expect(true).toEqual(false);
  });
  it("should take a second", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(1 + 68).toEqual(69);
  });
});
