import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  beginDate: [{ required: true, message: "周为必填项", trigger: "change" }],
  pocId: [{ required: true, message: "项目名称为必填项", trigger: "change" }],
  workHours: [{ required: true, message: "工时为必填项", trigger: "change" }]
});
