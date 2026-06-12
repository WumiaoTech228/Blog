---
title: 微软 Office 官方部署指南：如何利用 setup.exe 与 XML 配置文件进行精简安装
description: 详细介绍如何通过微软官方 Office Deployment Tool (ODT) 以纯净、轻量、原版的方式安装 Office 办公软件，摆脱臃肿的全家桶安装包。
date: 2026-06-12
draft: false
tags:
  - Windows
  - Office
  - 极客折腾
---

# 微软 Office 官方部署指南：如何利用 setup.exe 与 XML 配置文件进行精简安装

在日常使用 Windows 系统时，许多人习惯直接下载官方体积庞大的 Office 在线或离线安装包。然而，默认的安装会将整个 Office 办公组件（如 Outlook、Publisher、Access 等等）一古脑地全部塞入系统，对于仅需要 Word、Excel、PowerPoint 的轻度用户而言十分臃肿且浪费空间。

其实，微软官方提供了一套针对企业和 IT 管理员的部署工具——**Office Deployment Tool (ODT)**。我们可以利用它自带的 `setup.exe` 配合一个轻巧的 `.xml` 配置文件，以纯净、自定义、原版化且免广告的方式来自由定制需要安装的 Office 组件。

---

## 🛠️ 第一步：下载部署工具与准备工作

1. 首先，前往微软官方网站下载 [Office Deployment Tool (ODT)](https://www.microsoft.com/en-us/download/details.aspx?id=49117)。
2. 下载后运行该 `.exe` 文件，它会提示你解压到指定文件夹。我们在桌面或某个盘符的根目录下新建一个名为 `OfficeSetup` 的文件夹，并将文件解压进去。
3. 解压完成后，你会发现文件夹中包含了一个 `setup.exe` 文件以及几个示例 `.xml` 文件（如 `configuration-Office365-x64.xml`）。

---

## 📄 第二步：定制你的 XML 配置文件

接下来是核心环节——定义你的安装范围。我们可以在 `OfficeSetup` 文件夹内新建一个名为 `configuration.xml` 的文本文档，并用文本编辑器打开它，写入以下配置：

```xml
<Configuration>
  <Add OfficeClientEdition="64" Channel="Current">
    <!-- 安装 Office 长期通道专业增强版 (Office LTSC 2021) 也可以根据需要改成 ProPlus2026Volume 或 O365ProPlusRetail -->
    <Product ID="ProPlus2021Volume">
      <Language ID="zh-cn" />
      
      <!-- 排除掉不需要的组件，只留下 Word, Excel, PowerPoint -->
      <ExcludeApp ID="Access" />
      <ExcludeApp ID="Groove" />
      <ExcludeApp ID="Lync" />
      <ExcludeApp ID="OneDrive" />
      <ExcludeApp ID="OneNote" />
      <ExcludeApp ID="Outlook" />
      <ExcludeApp ID="Publisher" />
      <ExcludeApp ID="Teams" />
    </Product>
  </Add>
  <Property Name="SharedComputerLicensing" Value="0" />
  <Property Name="FORCEAPPSHUTDOWN" Value="TRUE" />
  <Property Name="DeviceBasedLicensing" Value="0" />
  <Updates Enabled="TRUE" />
  <Display Level="Full" AcceptEULA="TRUE" />
</Configuration>
```

### 💡 关键节点说明：
- **OfficeClientEdition**: 代表架构，`64` 代表 64 位，建议首选 64 位以获取最佳性能。
- **Channel**: 安装通道，`Current` 代表零售当前通道，`PerpetualVL2021` 代表 2021 长期企业版通道。
- **Product ID**: 决定要安装的 Office 版本（如 `ProPlus2021Volume` 意为 2021 批量授权版；`O365ProPlusRetail` 则是 365 订阅版）。
- **ExcludeApp**: 通过将不需要的组件声明在这一项里，安装程序在运行时便会自动跳过它们，实现完美精简。

---

## 💻 第三步：使用命令行启动下载与安装

Office 部署工具不支持直接双击运行，我们需要借由命令行（Command Prompt 或 PowerShell）来引导它。

1. 在 `OfficeSetup` 文件夹的空白处，按住 `Shift` 键的同时点击鼠标右键，选择“**在此处打开 PowerShell 窗口**”（或者在上方地址栏输入 `cmd` 后回车）。
2. 在弹出的窗口中输入以下命令以开始下载 Office 离线资源文件（这一步视你的网速而定，它会在文件夹下默默下载一个几吉字节的 `Office` 数据包，窗口不会有明显反馈，待光标重新闪烁即为下载完成）：
   ```bash
   .\setup.exe /download .\configuration.xml
   ```
3. 下载完成后，输入以下命令开始执行正式安装：
   ```bash
   .\setup.exe /configure .\configuration.xml
   ```
4. 此时，屏幕上便会弹出标准的微软原版 Office 安装窗体，只展示你保留的 Word、Excel 和 PowerPoint 的安装进程。

---

## 🎉 总结

利用 ODT 命令不仅能最大化地精简你的系统空间，而且能避免第三方修改版安装包内置的捆绑广告或恶意修改，是体验原汁原味 Office 办公套件的最佳方式。这也正是我的开源工具 `GlimOfficeInstaller` 底层调用的微软官方正统部署接口。
