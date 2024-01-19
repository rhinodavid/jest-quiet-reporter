describe("Demo test", () => {
  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });
  it("should pass", () => {
    expect(true).toEqual(true);
  });
  it("should also pass", () => {
    console.log("If you see me this is broken");
    expect("true").toHaveLength(4);
  });
  it("should take a second", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(1 + 68).toEqual(69);
  });
});
