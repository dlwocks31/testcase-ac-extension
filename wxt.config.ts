import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["activeTab", "background", "storage"],
    host_permissions: ["https://testcase.ac/"],
    web_accessible_resources: [
      {
        resources: ["icon/32.png"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
