---
title: LepoProxy 开发日志：Tauri v2 + Sing-Box 架构下的路由环路与 DNS 劫持踩坑复盘
description: 记录在使用 Rust (Tauri v2) 和 Go (Sing-Box) 开发桌面网络客户端时，遇到的 Tun 网卡虚拟路由环路、系统 DNS 污染劫持以及本地进程回环等技术死穴与具体解法。
date: 2026-06-12
draft: false
tags:
  - Tauri
  - Rust
  - Go
  - Sing-Box
  - 踩坑记录
---

# LepoProxy 开发日志：Tauri v2 + Sing-Box 架构下的路由环路与 DNS 劫持踩坑复盘

在开发 `LepoProxy`——这款基于 Tauri v2 与 Sing-Box 内核构建的下一代全协议高性能桌面代理客户端时，我曾天真地以为只要写好了 Tauri 的前台 UI、做好了 IPC 通信，直接把编译好的 Sing-Box 核心用 Sidecar 方式拉起来，塞一个标准的配置文件就能万事大吉。

然而，网络工具的底层开发水极深，尤其是涉及到 **Tun 虚拟网卡代理模式**、**DNS 流量劫持与分流** 以及 **本地路由闭环（Routing Loop）** 时，系统路由表的一个微小改动就会导致整台电脑直接断网，甚至把内核跑满、死机。

在此，我将这几个月踩过的三大底层网络技术死穴与解法整理出来，进行一次深度的复盘。

---

## 🚫 死穴一：Tauri 进程自循环导致的路由环路 (Routing Loop)

在 Tun（虚拟网卡）代理模式下，内核会将系统所有的出口流量全部接管，并路由到 Sing-Box 虚拟网卡中。然而，Sing-Box 本身要把流量发送出去，也必须通过真实的物理网卡（如 Wi-Fi 或以太网）。

这就带来了一个经典的死锁：
1. 系统流量 -> 进入 Tun 网卡 (Sing-Box)。
2. Sing-Box 对流量进行代理加密 -> 发送给远端节点。
3. 该出口流量因为也是“系统出口流量”，再次被系统路由表路由回 -> Tun 网卡 (Sing-Box)。
4. 流量陷入无限自循环，CPU 瞬间飙到 100%，网络彻底瘫痪。

### 🛠️ 解决方案：
必须在 Sing-Box 的配置中启用 `Route Rule` 或是依靠操作系统底层机制排除代理客户端自身的流量。
在我们的 Go (Sing-Box) 配置文件中，主要采取了以下手段：
1. **自动绕过私有/局域网地址** (Direct Private Ranges)。
2. **依据进程名/PID 进行排除**：在配置中启用 `auto_detect_interface: true`，此时 Sing-Box 会自动标记并接管默认网关。针对我们客户端发出的加密流量，配置规则中加入 `process_name` 或是 `package_name` 排除：
   ```json
   {
     "route": {
       "rules": [
         {
           "process_name": [
             "LepoProxy",
             "lepoproxy-core"
           ],
           "action": "hijack-dns" 
         }
       ]
     }
   }
   ```
   同时，必须确保 Tauri 的编译名称和 Sidecar 进程名被 Sing-Box 识别为直连，不进入虚拟网卡。

---

## 🌪️ 死穴二：Windows 系统的 DNS 劫持与“DNS 泄漏”

Windows 在 Tun 模式下的 DNS 劫持行为极其诡异。即使我们成功修改了系统全局 DNS 或是开启了系统的虚拟 DNS 分流，Windows 也经常会绕过 Tun 网卡的 DNS 配置，直接向真实的物理网卡（如家庭路由器的 192.168.1.1）发送并发 DNS 请求，这被称为 **DNS 泄漏**，也会导致敏感域名在直连链路上曝光。

### 🛠️ 解决方案：
采用 **Sing-Box 内建 DNS 劫持服务器**，并且通过高级路由规则拦截所有的 UDP 53 端口流量：
1. 建立一个处于内网虚拟 IP（如 `172.19.0.1`）的私有 DNS 服务。
2. 配置防火墙规则或是系统路由表，将发往任何 IP 地址的 53 端口请求强行重定向到虚拟网卡：
   ```json
   {
     "dns": {
       "servers": [
         {
           "tag": "dns_proxy",
           "address": "https://1.1.1.1/dns-query",
           "detour": "proxy"
         },
         {
           "tag": "dns_direct",
           "address": "223.5.5.5",
           "detour": "direct"
         }
       ],
       "rules": [
         {
           "outbound": "any",
           "server": "dns_proxy"
         }
       ]
     }
   }
   ```
3. 在系统层面，将主物理网卡的公网 DNS 全部临时改写为虚拟网卡的监听地址，并在客户端退出（包括异常退出崩溃时）利用 Rust 里的 `Drop` 特征和 `Tauri State` 的 `Exit` 事件监听，强制恢复系统原有的物理网卡 DNS 设置，防止用户电脑在客户端崩溃后直接无法解析域名。

---

## 🦿 死穴三：跨平台虚拟网卡驱动（Wintun / TuTUN）权限

在 macOS 或 Linux 上，代理客户端只需要通过简单的 `sudo` 或系统的 Network Extension 权限即可创建虚拟网卡。但在 Windows 下，Sing-Box 底层极为依赖微软的 `wintun.dll` 驱动。
- Wintun 必须在**管理员权限**下运行才能成功创建并初始化。
- 如果用户没有以管理员权限启动 `LepoProxy`，创建网卡便会静默失败，甚至导致 Sidecar 直接挂起。

### 🛠️ 解决方案：
1. 在 Tauri 的 `tauri.conf.json` 中配置应用清单，或在 Rust 底层初始化时检查当前进程的管理员特权状态（通过 `is_elevated` 库检测）。
2. 如果检测到当前没有管理员权限且用户开启了 TUN 模式，在前台通过 Tauri 弹窗提示，并使用特殊脚本以管理员权限静默重新拉起 Sing-Box Sidecar 进程，而保持主 UI 窗口无需全局管理员特权，从而提升系统安全性。

---

## 💡 总结

网络工具是一门“和操作系统玩躲猫猫”的学问。通过 Tauri v2 构建的轻量级 UI 搭配 Go 极速的 Sing-Box 底层，能让 `LepoProxy` 拥有惊人的低内存占用和极佳的响应速度。而在解决完路由环路、DNS 污染和权限管理后，它终于能够像一个真正润物细无声的系统助手一样，稳定地服务于我们的每一次网络冲浪。
