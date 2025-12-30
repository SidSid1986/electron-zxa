/*
 * @Author: Sid Li
 * @Date: 2025-11-24 10:59:31
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-30 14:41:59
 * @FilePath: \zi-xiao-ai\src\api\common.js
 * @Description:
 */
import request from "@/utils/request.js";

export function hello() {
  return request({
    url: "api/hello",
    method: "get",
  });
}

//获取所有方案的列表
export function getCaseList() {
  return request({
    url: "api/load_all",
    method: "get",
  });
}

//获取所有点的列表
export function getPoints() {
  return request({
    url: "api/load_points",
    method: "get",
  });
}

//添加新方案
export function addPlan(data) {
  return request({
    url: "api/save_a_plan",
    method: "post",
    data,
  });
}

//删除方案
export function deletePlan(uuid) {
  return request({
    url: `api/delete_uuid?uuid_value=${uuid}`,
    method: "delete",
  });
}

//export 修改计划
export function updatePlan(uuid_value,data) {
  return request({
    url: `api/update_plan_by_uuid/${uuid_value}`,
    method: "put",
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
