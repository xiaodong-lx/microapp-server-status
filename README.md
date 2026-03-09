> Node.js >= 18.20

### 安装依赖 {#bundle_install}

```bash
npm install
```

### 步骤 3：启动开发服务器 {#start_dev_server}

```bash
npm run dev
```

启动成功后，会自动打开一个网页，按照提示复制入口文件地址，在 Sun-Panel 中导入，即预览微应用。

### 步骤 4：打包发布

```bash
npm run build   # 构建生产版本
npm run pack    # 打包组件包
```

打包产物位于 `packages/` 目录，生成 `.zip` 文件可直接上传到 Sun-Panel。


### 开发命令一览

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产模式构建 |
| `npm run pack` | 打包组件包（生产模式） |
| `npm run pack:dev` | 打包组件包（开发模式） |
| `npm run clean` | 清理构建产物 |