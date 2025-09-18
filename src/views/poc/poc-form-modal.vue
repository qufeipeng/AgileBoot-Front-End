<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./rule";
import { UpdatePocCommand } from "@/api/poc";

interface FormProps {
  formInline: UpdatePocCommand;
  //deptOptions: any[];
  statusOptions: any[];
  riskOptions: any[];
  userOptions: any[];
  userAllOptions: any[];
  provinceOptions: any[];
  industryOptions: any[];
  deploymentOptions: any[];
  compatibilityOptions: any[];
  pluginsOptions: any[];
  //isDisabled: any;
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
    todoRisk: "",
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
    evaluate: "",
    plan: ""
  }),
  //deptOptions: () => [],
  statusOptions: () => [],
  riskOptions: () => [],
  userOptions: () => [],
  userAllOptions: () => [],
  provinceOptions: () => [],
  industryOptions: () => [],
  deploymentOptions: () => [],
  compatibilityOptions: () => [],
  pluginsOptions: () => []
  //isDisabled: false
});

const newFormInline = ref(props.formInline);
//const deptOptions = ref(props.deptOptions);
const statusOptions = ref(props.statusOptions);
const riskOptions = ref(props.riskOptions);
const userOptions = ref(props.userOptions);
const userAllOptions = ref(props.userAllOptions);
const provinceOptions = ref(props.provinceOptions);
const industryOptions = ref(props.industryOptions);
const deploymentOptions = ref(props.deploymentOptions);
const compatibilityOptions = ref(props.compatibilityOptions);
const pluginsOptions = ref(props.pluginsOptions);

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
    label-width="130px"
  >
    <el-row :gutter="20">
      <re-col :value="6">
        <el-form-item label="当前责任人" prop="owner">
          <el-select
            class="w-full"
            v-model="newFormInline.owner"
            placeholder="请选择当前责任人"
            clearable
          >
            <el-option
              v-for="item in userOptions"
              :key="item.userId"
              :label="item.nickname"
              :value="item.userId"
              :disabled="item.status == 0"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <!-- <re-col :value="6">
        <el-form-item label="当前责任人" prop="owner">
          <el-tree-select
            class="w-full"
            v-model="newFormInline.owner"
            :data="userOptions"
            :show-all-levels="false"
            value-key="id"
            :props="{
              value: 'id',
              label: 'deptName',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            default-expand-all
            placeholder="请选择当前责任人"
          />
        </el-form-item>
      </re-col> -->

      <!-- <re-col :value="6">
        <el-form-item label="项目组">
          <el-tree-select
            class="w-full"
            :disabled="isDisabled"
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
      </re-col> -->

      <re-col :value="6">
        <el-form-item label="客户" prop="customer">
          <el-input
            v-model="newFormInline.customer"
            clearable
            placeholder="请输入客户"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="项目名称" prop="project">
          <el-input
            v-model="newFormInline.project"
            clearable
            placeholder="请输入项目名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="进度" prop="progress">
          <el-input-number
            style="width: 100%"
            :min="0"
            v-model="newFormInline.progress"
            clearable
            placeholder="请输入进度"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
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

      <re-col :value="6">
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

      <re-col :value="6">
        <el-form-item label="销售" prop="sales">
          <el-input
            v-model="newFormInline.sales"
            clearable
            placeholder="请输入销售"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="售前" prop="sa">
          <el-select
            class="w-full"
            v-model="newFormInline.sa"
            placeholder="请选择售前"
            clearable
          >
            <el-option
              v-for="item in userAllOptions"
              :key="item.userId"
              :label="item.nickname"
              :value="item.userId"
              :disabled="item.status == 0"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="POC人员" prop="poc">
          <el-select
            class="w-full"
            v-model="newFormInline.poc"
            placeholder="请选择POC人员"
            clearable
          >
            <el-option
              v-for="item in userAllOptions"
              :key="item.userId"
              :label="item.nickname"
              :value="item.userId"
              :disabled="item.status == 0"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <!-- <re-col :value="6">
        <el-form-item label="POC人员" prop="poc">
          <el-tree-select
            class="w-full"
            v-model="newFormInline.poc"
            :data="userOptions"
            :show-all-levels="false"
            value-key="id"
            :props="{
              value: 'id',
              label: 'deptName',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            default-expand-all
            placeholder="请选择POC人员"
          />
        </el-form-item>
      </re-col> -->

      <re-col :value="6">
        <el-form-item label="运维" prop="op">
          <el-input
            v-model="newFormInline.op"
            clearable
            placeholder="请输入运维"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="重点项目" prop="kv">
          <el-input
            v-model="newFormInline.kv"
            clearable
            placeholder="请输入重点项目"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="开始日期" prop="pocStartDt">
          <el-date-picker
            style="width: 100%"
            v-model="newFormInline.pocStartDt"
            type="date"
            clearable
            placeholder="选择日期"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="完成日期" prop="pocEndDt">
          <el-date-picker
            style="width: 100%"
            v-model="newFormInline.pocEndDt"
            type="date"
            clearable
            placeholder="选择日期"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="上线日期" prop="onlineDt">
          <el-date-picker
            style="width: 100%"
            v-model="newFormInline.onlineDt"
            type="date"
            clearable
            placeholder="选择日期"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="最后更新日期" prop="lastUpdDt">
          <el-date-picker
            style="width: 100%"
            v-model="newFormInline.lastUpdDt"
            type="date"
            clearable
            placeholder="选择日期"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="省份" prop="province">
          <el-select
            class="w-full"
            v-model="newFormInline.province"
            placeholder="请选择省份"
            clearable
          >
            <el-option
              v-for="item in provinceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="行业" prop="industry">
          <el-select
            class="w-full"
            v-model="newFormInline.industry"
            placeholder="请选择行业"
            clearable
          >
            <el-option
              v-for="item in industryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="ISV" prop="isv">
          <el-input
            v-model="newFormInline.isv"
            clearable
            placeholder="请输入ISV"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="运维厂商" prop="maintenance">
          <el-input
            v-model="newFormInline.maintenance"
            clearable
            placeholder="请输入运维厂商"
          />
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="版本号" prop="version">
          <el-input
            v-model="newFormInline.version"
            clearable
            placeholder="请输入版本号"
          />
        </el-form-item>
      </re-col>

      <!-- <re-col :value="6">
        <el-form-item label="部署形态" prop="deployment">
          <el-select
            class="w-full"
            v-model="newFormInline.deployment"
            placeholder="请选择部署形态"
            clearable
          >
            <el-option label="单机" value="0"> </el-option>
            <el-option label="主备" value="1"> </el-option>
            <el-option label="共享集群" value="2"> </el-option>
            <el-option label="分布式" value="3"> </el-option>
          </el-select>
        </el-form-item>
      </re-col> -->

      <!-- <re-col :value="6">
        <el-form-item label="部署形态" prop="deployment">
          <el-select
            class="w-full"
            v-model="newFormInline.deployment"
            placeholder="请选择部署形态"
            clearable
          >
            <el-option
              v-for="item in deploymentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col> -->

      <re-col :value="12">
        <el-form-item label="部署形态" prop="deployment">
          <el-select
            class="w-full"
            v-model="newFormInline.deployment"
            placeholder="请选择部署形态"
            multiple
            clearable
          >
            <el-option
              v-for="item in deploymentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="相关组件" prop="plugins">
          <el-select
            class="w-full"
            v-model="newFormInline.plugins"
            placeholder="请选择相关组件"
            multiple
            clearable
          >
            <el-option
              v-for="item in pluginsOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <!-- <re-col :value="6">
        <el-form-item label="兼容性需求" prop="compatibility">
          <el-select
            class="w-full"
            v-model="newFormInline.compatibility"
            placeholder="请选择兼容性需求"
            clearable
          >
            <el-option label="Oracle" value="0"> </el-option>
            <el-option label="MySQL" value="1"> </el-option>
            <el-option label="PG" value="2"> </el-option>
            <el-option label="DB2" value="3"> </el-option>
            <el-option label="DM" value="4"> </el-option>
          </el-select>
        </el-form-item>
      </re-col> -->

      <re-col :value="6">
        <el-form-item label="兼容性需求" prop="compatibility">
          <el-select
            class="w-full"
            v-model="newFormInline.compatibility"
            placeholder="请选择兼容性需求"
            clearable
          >
            <el-option
              v-for="item in compatibilityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="6">
        <el-form-item label="节点数" prop="notes">
          <el-input
            v-model="newFormInline.notes"
            clearable
            placeholder="请输入节点数"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="客户评价" prop="evaluate">
          <el-input
            v-model="newFormInline.evaluate"
            clearable
            placeholder="请输入客户评价"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="总体计划" prop="plan">
          <el-input
            v-model="newFormInline.plan"
            clearable
            placeholder="请输入总体计划"
            type="textarea"
            rows="4"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="待处理&风险描述" prop="todoRisk">
          <el-input
            v-model="newFormInline.todoRisk"
            clearable
            placeholder="请输入待处理&风险描述"
            type="textarea"
            rows="4"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="已完成进展" prop="done">
          <el-input
            v-model="newFormInline.done"
            clearable
            placeholder="请输入进展"
            type="textarea"
            rows="4"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
