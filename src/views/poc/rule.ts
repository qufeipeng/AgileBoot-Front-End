import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  owner: [{ required: true, message: "当前责任人为必填项", trigger: "change" }],
  status: [{ required: true, message: "状态为必填项", trigger: "change" }],
  customer: [{ required: true, message: "客户名称为必填项", trigger: "blur" }],
  project: [{ required: true, message: "项目名称为必填项", trigger: "blur" }],
  risk: [{ required: true, message: "风险为必填项", trigger: "change" }],
  //poc: [{ required: true, message: "poc人员为必填项", trigger: "change" }],
  province: [{ required: true, message: "省份为必填项", trigger: "change" }],
  industry: [{ required: true, message: "行业为必填项", trigger: "change" }]
});
