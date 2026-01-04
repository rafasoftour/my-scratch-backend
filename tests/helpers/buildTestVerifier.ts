export const buildTestVerifier = () => ({
  verify: async () => ({ sub: "test-sub", claims: {} })
});
