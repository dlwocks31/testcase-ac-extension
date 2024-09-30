import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["tabs", "activeTab", "background"],
    host_permissions: ["https://testcase.ac/"],
  },
});