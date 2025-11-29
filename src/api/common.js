/*
 * @Author: Sid Li
 * @Date: 2025-11-24 10:59:31
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-11-29 08:55:05
 * @FilePath: \robot-blocky-git\src\api\common.js
 * @Description:
 */
import request from "@/utils/request.js";

export function hello() {
  return request({
    url: "api/hello",
    method: "get",
  });
}
export function addList(data) {
  return request({
    url: "api/tasks",
    method: "post",
    data,
  });
}
export function getList() {
  return request({
    url: "api/tasks",
    method: "get",
  });
}
export function deleteList(id) {
  return request({
    url: "api/tasks/" + id,
    method: "delete",
  });
}

export function updateList(id, data) {
  return request({
    url: "api/tasks/" + id,
    method: "put",
    data,
  });
}

//token获取
export function login() {
  return request({
    url: "FreeIeAPI/Login",
    method: "get",
  });
}

export function writeStacking(data) {
  return request({
    url: `FreeIeAPI/WriteStacking`,
    method: "post",
    data,
  });
}

export function editUser(n) {
  return request({
    url: "/api/user",
    method: "put",
    data: n,
  });
}

export function removerUser(n) {
  return request({
    url: "/system/user/" + n,
    method: "DELETE",
  });
}

export function post2DArray(data) {
  return request({
    url: "/api/data", // 替换为你实际的API地址
    method: "post",
    data,
  });
}
