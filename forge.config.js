/*
 * @Author: Sid Li
 * @Date: 2025-12-08 20:08:40
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-09 00:05:04
 * @FilePath: \electron-zxa\forge.config.js
 * @Description:
 */
const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

module.exports = {
  // 核心打包配置（修复正则+适配Linux arm64）
  packagerConfig: {
    asar: true,
    // 禁用所有文件过滤规则（绕过正则解析）
    ignore: [],
    // 强制关闭过滤逻辑
    copyIgnore: [],
    // 其他配置保留
    platform: "linux",
    arch: "arm64",
    dir: "./",
    out: "./out",
    prune: false, // 关闭依赖清理，避免触发过滤
    pruneModules: false,
  },
  rebuildConfig: {
    // 新增：适配 arm64 架构的原生依赖重建
    arch: "arm64",
    platform: "linux",
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      // 修改：新增 linux 平台，支持 arm64 打包成 zip
      platforms: ["darwin", "linux"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
