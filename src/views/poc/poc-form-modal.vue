<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./rule";
import { UpdatePocCommand } from "@/api/poc";

interface FormProps {
  formInline: UpdatePocCommand;
  deptOptions: any[];
  statusOptions: any[];
  riskOptions: any[];
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    pocId: 0,
    owner: "",
    status: "",
    customer: "",
    project: "",
    progress: 0,
    risk: "",
    todo_risk: "",
    done: "",
    sales: "",
    sa: "",
    poc: "",
    op: "",
    kv: "",
    pocStartDt: null,
    pocEndDt: null,
    onlineDt: null,
    lastUpdDt: null,
    province: "",
    industry: "",
    isv: "",
    maintenance: "",
    version: "",
    deployment: "",
    compatibility: "",
    plugins: "",
    notes: "",
    deptId: 0
  }),
  deptOptions: () => []
});

const newFormInline = ref(props.formInline);
const deptOptions = ref(props.deptOptions);
const statusOptions = ref(props.statusOptions);
const riskOptions = ref(props.riskOptions);

const formRuleRef = ref();

function getFormRuleRef() {
  return formRuleRef.value;
}

defineExpose({ getFormRuleRef });
</script>

<template>
  <el-form
    ref="formRuleRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12">
        <el-form-item label="责任人" prop="owner">
          <el-input
            v-model="newFormInline.owner"
            clearable
            placeholder="请输入责任人"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="项目组">
          <el-tree-select
            class="w-full"
            v-model="newFormInline.deptId"
            :data="deptOptions"
            :show-all-levels="false"
            value-key="id"
            :props="{
              value: 'id',
              label: 'deptName',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            placeholder="请选择项目组"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="客户" prop="customer">
          <el-input
            v-model="newFormInline.customer"
            clearable
            placeholder="请输入客户"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="项目名称" prop="project">
          <el-input
            v-model="newFormInline.project"
            clearable
            placeholder="请输入项目名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="进度" prop="progress">
          <el-input-number
            :min="0"
            v-model="newFormInline.progress"
            clearable
            placeholder="请输入进度"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="状态" prop="status">
          <el-select
            class="w-full"
            v-model="newFormInline.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="风险" prop="risk">
          <el-select
            class="w-full"
            v-model="newFormInline.risk"
            placeholder="请选择风险"
            clearable
          >
            <el-option
              v-for="item in riskOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="newFormInline.notes"
            clearable
            placeholder="请输入备注内容"
            rows="6"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
